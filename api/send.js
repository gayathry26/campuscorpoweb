import { sendContactEmail } from '../mailer.js';

// In-memory rate limiting map: ip -> [timestamp, timestamp, ...]
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

// Clean up old entries periodically without holding the process open
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, valid);
    }
  }
}, 5 * 60 * 1000);

if (cleanupInterval && typeof cleanupInterval.unref === 'function') {
  cleanupInterval.unref();
}

function isRateLimited(ip) {
  if (!ip) return false;
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Accept POST requests only
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed. Only POST is accepted.`
    });
  }

  // 2. IP Rate Limiting Check (exempt local development)
  const clientIp = 
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
    req.headers['x-real-ip'] || 
    req.socket?.remoteAddress || 
    'unknown';

  const isLocalDev = 
    clientIp === '127.0.0.1' || 
    clientIp === '::1' || 
    clientIp === '::ffff:127.0.0.1' || 
    clientIp === 'localhost' || 
    process.env.NODE_ENV !== 'production';

  if (!isLocalDev && isRateLimited(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a few minutes before submitting another enquiry.'
    });
  }

  try {
    const body = req.body || {};

    // 3. Honeypot Spam Check (silent trap for automated bots)
    if (body._hp || body.website_url) {
      console.log('[Anti-Spam] Honeypot triggered, silently acknowledging.');
      return res.status(200).json({
        success: true,
        message: 'Your enquiry has been received.'
      });
    }

    const name = (body.name || '').trim();
    const organization = (body.organization || body.college || body.institution || '').trim();
    const email = (body.email || '').trim();
    const phone = (body.phone || '').trim();
    const role = (body.role || '').trim();
    const preferredModule = (body.preferredModule || body.primaryInterest || '').trim();
    const subject = (body.subject || body.service || (body.role || body.preferredModule ? 'Institutional Demo Request' : 'New Website Enquiry')).trim();
    const service = (body.service || body.subject || (body.preferredModule ? `Demo - ${body.preferredModule}` : 'General Enquiry')).trim();
    const message = (body.message || '').trim();
    const source = (body.source || (body.role || body.preferredModule ? 'CampusCorpo Demo Modal' : 'Website Contact Form')).trim();

    // 4. Server-Side Validation
    if (!name || name.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid full name (minimum 2 characters).'
      });
    }

    if (!organization) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your College, University or Organization name.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid official email address.'
      });
    }

    if (!phone || phone.length < 7) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid contact phone number.'
      });
    }

    if (!message || message.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide message details or requirements (minimum 5 characters).'
      });
    }

    console.log(`[Contact API] Processing enquiry from ${name} (${organization}) <${email}>...`);

    // 5. Strictly await email delivery
    const info = await sendContactEmail({
      name,
      organization,
      college: organization,
      institution: organization,
      email,
      phone,
      service,
      subject,
      message,
      role,
      preferredModule,
      source
    });

    // 6. Confirm acceptance
    if (info && (info.messageId || info.accepted?.length > 0)) {
      console.log(`[Contact API] Enquiry delivered successfully via ${info.provider}. Message ID: ${info.messageId}`);
      return res.status(200).json({
        success: true,
        message: 'Your enquiry has been successfully delivered to CampusCorpo.',
        provider: info.provider,
        messageId: info.messageId
      });
    } else {
      throw new Error('Email service did not return delivery acceptance.');
    }
  } catch (err) {
    console.error('[Contact API Error]', err.code || err.message);

    let clientMessage = err.message || 'Failed to dispatch enquiry. Please verify mail credentials or try again later.';

    if (err.code === 'EAUTH') {
      clientMessage = 'GoDaddy Titan Mail password rejected (535 Authentication Failed). Please check your email login password for info@campuscorpo.com in your .env file.';
    } else if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKET') {
      clientMessage = 'Could not connect to smtp.titan.email (network timeout). Please verify your connection.';
    }

    return res.status(500).json({
      success: false,
      error: clientMessage
    });
  }
}
