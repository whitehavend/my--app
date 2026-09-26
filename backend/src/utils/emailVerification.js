const nodemailer = require('nodemailer');

const getTransporter = async () => {
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPassword = process.env.SMTP_PASSWORD?.trim();

  console.log('[emailVerification] SMTP config check', {
    smtpHost: Boolean(smtpHost),
    smtpUser: Boolean(smtpUser),
    smtpPassword: Boolean(smtpPassword),
    smtpPort: process.env.SMTP_PORT || '587',
    smtpSecure: process.env.SMTP_SECURE || 'false',
    smtpFrom: process.env.SMTP_FROM || 'not set',
  });

  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.error('[emailVerification] Missing SMTP config. Required values not found:', {
      smtpHost: !!smtpHost,
      smtpUser: !!smtpUser,
      smtpPassword: !!smtpPassword,
    });
    const error = new Error('EMAIL_DELIVERY_NOT_CONFIGURED');
    error.code = 'EMAIL_DELIVERY_NOT_CONFIGURED';
    throw error;
  }

  try {
    const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 587;
    const secure = process.env.SMTP_SECURE === 'true';

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure,
      family: 4,
      tls: { rejectUnauthorized: false },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    console.log('[emailVerification] SMTP transporter created successfully for host:', smtpHost, 'port:', smtpPort, 'secure:', secure);
    return transporter;
  } catch (error) {
    console.error('[emailVerification] Failed while creating SMTP transporter:', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

const sendRegistrationCode = async (email, code) => {
  console.log('[emailVerification] sendRegistrationCode called', {
    email,
    codeLength: String(code || '').length,
    smtpHost: Boolean(process.env.SMTP_HOST),
    smtpUser: Boolean(process.env.SMTP_USER),
    smtpPassword: Boolean(process.env.SMTP_PASSWORD),
  });

  let transporter;
  try {
    transporter = await getTransporter();
  } catch (error) {
    console.error('[emailVerification] getTransporter failed before sending:', {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'Nova Unicorn <noreply@ethereal.email>',
    to: email,
    subject: 'Nova Unicorn email verification code',
    text: `Your Nova Unicorn registration verification code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your Nova Unicorn registration verification code is:</p><p style="font-size:24px;font-weight:700;letter-spacing:4px">${code}</p><p>This code expires in 10 minutes.</p>`,
  };

  console.log('[emailVerification] Attempting to send verification email with options:', {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    codeLength: String(code || '').length,
  });

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[emailVerification] Email sendMail resolved successfully', {
      messageId: info?.messageId,
      accepted: info?.accepted,
      rejected: info?.rejected,
    });

    if (nodemailer.getTestMessageUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('[emailVerification] Email preview URL:', previewUrl);
      }
    }

    return info;
  } catch (error) {
    console.error('[emailVerification] SMTP connection/send failed. Exact error details:', {
      name: error.name,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

module.exports = { sendRegistrationCode };
