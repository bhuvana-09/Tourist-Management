const nodemailer = require('nodemailer');
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS
} = require('../config/env');

const sendEmail = async ({ to, subject, html }) => {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[WARNING] SMTP credentials missing, logging email instead:');
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`CONTENT: ${html}`);
    return { messageId: 'mock-id' };
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  const mailOptions = {
    from: `"Tourist Management Portal" <no-reply@touristportal.com>`,
    to,
    subject,
    html
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;
