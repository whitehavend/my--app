const { Resend } = require('resend');

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  console.log('[emailVerification] Resend config check', {
    apiKeyPresent: Boolean(apiKey),
    sender: process.env.SMTP_FROM || 'onboarding@resend.dev',
  });

  if (!apiKey) {
    const error = new Error('RESEND_API_KEY is not configured');
    error.code = 'EMAIL_DELIVERY_NOT_CONFIGURED';
    throw error;
  }

  return new Resend(apiKey);
};

const sendRegistrationCode = async (email, code) => {
  console.log('[emailVerification] sendRegistrationCode called', {
    email,
    codeLength: String(code || '').length,
    sender: process.env.SMTP_FROM || 'onboarding@resend.dev',
  });

  try {
    const resend = getResendClient();
    const senderAddress = process.env.SMTP_FROM || 'onboarding@resend.dev';

    const response = await resend.emails.send({
      from: senderAddress,
      to: [email],
      subject: 'Nova Unicorn email verification code',
      text: `Your Nova Unicorn registration verification code is ${code}. It expires in 10 minutes.`,
      html: `
        <p>Your Nova Unicorn registration verification code is:</p>
        <p style="font-size:24px;font-weight:700;letter-spacing:4px">${code}</p>
        <p>This code expires in 10 minutes.</p>
      `,
    });

    console.log('[emailVerification] Resend send succeeded', {
      id: response?.id,
      status: response?.status,
      rejectReason: response?.rejectReason,
    });

    return response;
  } catch (error) {
    console.error('[emailVerification] Resend email send failed. Exact error details:', {
      name: error?.name,
      message: error?.message,
      statusCode: error?.statusCode,
      raw: error,
      stack: error?.stack,
    });
    throw error;
  }
};

module.exports = { sendRegistrationCode };
