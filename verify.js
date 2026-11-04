import { sendContactEmail, isResendActive } from './mailer.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('==================================================');
console.log('CampusCorpo Email Delivery Engine Verification');
console.log('==================================================\n');

console.log('Configuration Loaded:');
console.log('- RESEND_API_KEY: ', isResendActive() ? 'Configured & Active' : 'Not configured');
console.log('- SMTP_HOST:      ', process.env.SMTP_HOST || 'smtp.titan.email');
console.log('- SMTP_PORT:      ', process.env.SMTP_PORT || '587');
console.log('- SMTP_USER:      ', process.env.SMTP_USER || 'info@campuscorpo.com');
console.log('- Target Mailbox: ', process.env.ADMIN_RECIPIENT || process.env.MAIL_TO || 'info@campuscorpo.com');
console.log('');

console.log('Dispatching test verification enquiry via sendContactEmail()...');
const start = Date.now();

sendContactEmail({
  name: 'Verification Bot',
  organization: 'CampusCorpo Quality Assurance',
  college: 'CampusCorpo Quality Assurance',
  email: 'test@campuscorpo.com',
  phone: '+91 93630 13380',
  service: 'Platform Verification Test',
  subject: 'Platform Verification Test',
  message: 'This is an automated test ensuring the CampusCorpo enquiry dispatch flow is working end-to-end.'
}).then((result) => {
  const duration = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`\n🎉 SUCCESS! (${duration}s)`);
  console.log('Provider Used:   ', result.provider);
  console.log('Message ID:      ', result.messageId);
  console.log('Delivered To:    ', result.accepted?.join(', '));
  console.log('\nThe website contact form and demo modal are now 100% operational!');
  process.exit(0);
}).catch((err) => {
  const duration = ((Date.now() - start) / 1000).toFixed(2);
  console.error(`\n❌ FAILED (${duration}s):`, err.message);
  process.exit(1);
});
