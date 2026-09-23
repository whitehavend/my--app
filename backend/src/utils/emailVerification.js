const nodemailer = require('nodemailer');

const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    throw new Error('EMAIL_DELIVERY_NOT_CONFIGURED');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
};

const sendRegistrationCode = async (email, code) => {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Nova Unicorn email verification code',
    text: `Your Nova Unicorn registration verification code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your Nova Unicorn registration verification code is:</p><p style="font-size:24px;font-weight:700;letter-spacing:4px">${code}</p><p>This code expires in 10 minutes.</p>`,
  });
};

module.exports = { sendRegistrationCode };
