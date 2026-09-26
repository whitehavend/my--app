const nodemailer = require('nodemailer');

const getTransporter = async () => {
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPassword = process.env.SMTP_PASSWORD?.trim();

  if (!smtpHost || !smtpUser || !smtpPassword) {
    const error = new Error('EMAIL_DELIVERY_NOT_CONFIGURED');
    error.code = 'EMAIL_DELIVERY_NOT_CONFIGURED';
    throw error;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    tls: { rejectUnauthorized: false },
    auth: { user: smtpUser, pass: smtpPassword },
  });
};

const sendRegistrationCode = async (email, code) => {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'Nova Unicorn <noreply@ethereal.email>',
    to: email,
    subject: 'Nova Unicorn email verification code',
    text: `Your Nova Unicorn registration verification code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your Nova Unicorn registration verification code is:</p><p style="font-size:24px;font-weight:700;letter-spacing:4px">${code}</p><p>This code expires in 10 minutes.</p>`,
  });

  if (nodemailer.getTestMessageUrl) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('Email preview URL:', previewUrl);
    }
  }

  return info;
};

module.exports = { sendRegistrationCode };
