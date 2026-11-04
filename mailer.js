import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Check if Resend HTTP API is configured
 */
export function isResendActive() {
  const key = process.env.RESEND_API_KEY || process.env.RESEND_KEY || '';
  return Boolean(key && key.trim().length > 10 && !key.includes('your_resend_api_key'));
}

/**
 * Builds HTML template for both Demo requests and Contact enquiries
 */
export function buildEmailTemplate({ name, orgName, email, phone, inquirySubject, message, providerLabel, role, preferredModule, source }) {
  const isDemo = (source && source.toLowerCase().includes('demo')) || (inquirySubject && inquirySubject.toLowerCase().includes('demo'));
  const headerTitle = isDemo ? 'New Institutional Demo Request – CampusCorpo' : 'New Website Enquiry – CampusCorpo';
  const headerSubtitle = isDemo 
    ? 'A university / institutional leader has requested a live walkthrough.' 
    : 'New general enquiry submitted via campuscorpo.com.';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 28px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
      <div style="border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 24px;">
        <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #4b5563;">
          ${isDemo ? 'CAMPUSCORPO &bull; DEMO REQUEST' : 'CAMPUSCORPO &bull; GENERAL ENQUIRY'}
        </span>
        <h2 style="color: #111827; margin: 6px 0 4px 0; font-size: 20px;">${headerTitle}</h2>
        <p style="color: #6b7280; font-size: 13px; margin: 0;">${headerSubtitle}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; color: #6b7280; font-weight: 600; width: 160px;">Full Name:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600;">${name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Institution / College:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600;">${orgName}</td>
        </tr>
        ${role ? `
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Role / Title:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600;">${role}</td>
        </tr>` : ''}
        ${preferredModule ? `
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Primary Interest:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600;">${preferredModule}</td>
        </tr>` : ''}
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Official Email:</td>
          <td style="padding: 10px 0; color: #111827;">
            <a href="mailto:${email}" style="color: #111827; font-weight: 600; text-decoration: underline;">${email}</a>
            <span style="color: #9ca3af; font-size: 12px; margin-left: 6px;">(Reply-To enabled)</span>
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Phone Number:</td>
          <td style="padding: 10px 0; color: #111827;">
            <a href="tel:${phone}" style="color: #111827; text-decoration: none; font-weight: 600;">${phone || 'Not provided'}</a>
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Subject / Track:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600;">${inquirySubject}</td>
        </tr>
      </table>

      <div style="background-color: #f9fafb; padding: 18px; border-radius: 6px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
        <h4 style="margin: 0 0 10px 0; color: #374151; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Request Details &amp; Scope:</h4>
        <p style="margin: 0; color: #111827; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 12px; color: #9ca3af; text-align: center;">
        Delivered directly to <strong>info@campuscorpo.com</strong> via ${providerLabel} &bull; <a href="https://campuscorpo.com" style="color: #6b7280;">campuscorpo.com</a>
      </div>
    </div>
  `;
}

/**
 * Builds plain text email content
 */
export function buildTextTemplate({ name, orgName, email, phone, inquirySubject, message, role, preferredModule, source }) {
  const isDemo = (source && source.toLowerCase().includes('demo')) || (inquirySubject && inquirySubject.toLowerCase().includes('demo'));
  return `New ${isDemo ? 'Institutional Demo Request' : 'Website Enquiry'} – CampusCorpo
--------------------------------------------------
Full Name: ${name}
Institution / College: ${orgName}
${role ? `Role / Title: ${role}\n` : ''}${preferredModule ? `Primary Interest: ${preferredModule}\n` : ''}Official Email: ${email}
Phone Number: ${phone || 'Not provided'}
Subject / Track: ${inquirySubject}

Details:
${message}
--------------------------------------------------
Sent from CampusCorpo (https://campuscorpo.com)
Reply-To: ${email}
`;
}

/**
 * Create a Nodemailer transporter configured for Port 587 STARTTLS
 */
export function getTitanTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.titan.email';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const requireTLS = process.env.REQUIRE_TLS === 'true' || (!secure && port === 587);
  const user = process.env.SMTP_USER || 'info@campuscorpo.com';
  const pass = process.env.SMTP_PASS || process.env.TITAN_PASSWORD || '';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS,
    family: 4,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
    },
    connectionTimeout: 25000,
    greetingTimeout: 25000,
    socketTimeout: 30000,
  });
}

/**
 * Send via Titan SMTP (Nodemailer) on Port 587 (STARTTLS)
 */
export async function sendWithTitanSMTP({ name, orgName, email, phone, inquirySubject, message, role, preferredModule, source }) {
  const user = process.env.SMTP_USER || 'info@campuscorpo.com';
  const pass = process.env.SMTP_PASS || process.env.TITAN_PASSWORD || '';

  if (!pass || pass.trim() === '' || pass === 'your_titan_mail_password_here') {
    throw new Error('SMTP_PASS is not configured in .env. Please add your GoDaddy Titan Mail password.');
  }

  const senderName = process.env.MAIL_FROM_NAME ? process.env.MAIL_FROM_NAME.replace(/^"|"$/g, '') : 'CampusCorpo';
  const senderEmail = process.env.MAIL_FROM_EMAIL || user;
  const fromHeader = `"${senderName}" <${senderEmail}>`;
  const recipient = (process.env.ADMIN_RECIPIENT || process.env.MAIL_TO || 'info@campuscorpo.com').trim();

  const isDemo = (source && source.toLowerCase().includes('demo')) || (inquirySubject && inquirySubject.toLowerCase().includes('demo'));
  const emailSubject = isDemo 
    ? `New Demo Request – CampusCorpo: ${name} (${orgName})` 
    : `New Website Enquiry – CampusCorpo: ${name} (${inquirySubject})`;

  const mailOptions = {
    from: fromHeader,
    to: recipient,
    replyTo: `"${name}" <${email}>`,
    subject: emailSubject,
    text: buildTextTemplate({ name, orgName, email, phone, inquirySubject, message, role, preferredModule, source }),
    html: buildEmailTemplate({
      name,
      orgName,
      email,
      phone,
      inquirySubject,
      message,
      providerLabel: 'GoDaddy Titan Mail',
      role,
      preferredModule,
      source
    }),
  };

  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  console.log(`[Titan SMTP] Connecting to smtp.titan.email on port ${port} (STARTTLS)...`);
  const transporter = getTitanTransporter();

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Titan SMTP] Email successfully dispatched to ${recipient}! Message ID: ${info.messageId}`);
  return {
    ...info,
    provider: 'titan-smtp',
    port
  };
}

/**
 * Send via Resend HTTP API (Port 443 HTTPS)
 */
export async function sendWithResend({ name, orgName, email, phone, inquirySubject, message, role, preferredModule, source }) {
  const apiKey = (process.env.RESEND_API_KEY || process.env.RESEND_KEY || '').trim();
  const resend = new Resend(apiKey);

  const targetRecipient = (process.env.ADMIN_RECIPIENT || process.env.MAIL_TO || 'info@campuscorpo.com').trim();
  const fromAddress = (process.env.RESEND_FROM || 'CampusCorpo <info@campuscorpo.com>').trim();

  const isDemo = (source && source.toLowerCase().includes('demo')) || (inquirySubject && inquirySubject.toLowerCase().includes('demo'));
  const emailSubject = isDemo 
    ? `New Demo Request – CampusCorpo: ${name} (${orgName})` 
    : `New Website Enquiry – CampusCorpo: ${name} (${inquirySubject})`;

  const html = buildEmailTemplate({
    name,
    orgName,
    email,
    phone,
    inquirySubject,
    message,
    providerLabel: 'Resend HTTPS API',
    role,
    preferredModule,
    source
  });

  const text = buildTextTemplate({
    name,
    orgName,
    email,
    phone,
    inquirySubject,
    message,
    role,
    preferredModule,
    source
  });

  console.log(`[Resend API] Dispatching to: ${targetRecipient} from: ${fromAddress}...`);

  let response = await resend.emails.send({
    from: fromAddress,
    to: [targetRecipient],
    reply_to: `"${name}" <${email}>`,
    subject: emailSubject,
    text,
    html
  });

  // Handle Resend Sandbox mode (if domain is ever unverified)
  let actualRecipient = targetRecipient;
  if (response.error && (response.error.statusCode === 403 || response.error.name === 'validation_error') && response.error.message?.includes('your own email address')) {
    const match = response.error.message.match(/\(([^)]+)\)/);
    const sandboxOwner = match ? match[1] : 'campuscorp.com@gmail.com';
    actualRecipient = sandboxOwner;
    console.warn(`[Resend Sandbox Notice] Delivering to registered account: ${sandboxOwner}`);

    response = await resend.emails.send({
      from: fromAddress,
      to: [sandboxOwner],
      reply_to: `"${name}" <${email}>`,
      subject: emailSubject,
      text,
      html
    });
  }

  if (response.error) {
    console.error('[Resend Error]', response.error);
    throw new Error(`Resend delivery failed: ${response.error.message || JSON.stringify(response.error)}`);
  }

  console.log('[Resend Success] Email dispatched successfully. ID:', response.data?.id, 'Delivered to:', actualRecipient);
  return {
    success: true,
    messageId: response.data?.id,
    provider: 'resend',
    accepted: [actualRecipient]
  };
}

/**
 * Universal email dispatcher:
 * Works seamlessly for both Contact Form enquiries and Demo Modal requests!
 */
export async function sendContactEmail({ name, organization, college, institution, email, phone, service, subject, message, role, preferredModule, source }) {
  const orgName = organization || college || institution || 'Not specified';
  const inquirySubject = subject || service || 'General Enquiry';

  if (isResendActive()) {
    return await sendWithResend({
      name,
      orgName,
      email,
      phone,
      inquirySubject,
      message,
      role,
      preferredModule,
      source
    });
  }

  try {
    return await sendWithTitanSMTP({
      name,
      orgName,
      email,
      phone,
      inquirySubject,
      message,
      role,
      preferredModule,
      source
    });
  } catch (err) {
    console.error('[Email Dispatcher Error]', err.code || err.message);

    if (err.code === 'EAUTH' || (err.response && err.response.includes('535'))) {
      const authError = new Error(
        'GoDaddy Titan Mail password rejected (535 Authentication Failed). Please check your email login password for info@campuscorpo.com in .env.'
      );
      authError.code = 'EAUTH';
      throw authError;
    }

    if (err.message?.includes('Greeting never received') || err.code === 'ETIMEDOUT') {
      const detailedError = new Error(
        'Connection to smtp.titan.email on port 587 timed out. Please check network firewall or use HTTPS email API.'
      );
      detailedError.code = 'ETIMEDOUT';
      throw detailedError;
    }

    throw err;
  }
}
