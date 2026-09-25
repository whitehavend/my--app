const nodemailer = require('nodemailer');

const getTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false') === 'true',
      tls: { rejectUnauthorized: false },
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    tls: { rejectUnauthorized: false },
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporter;
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
