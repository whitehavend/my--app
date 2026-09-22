const axios = require('axios');
const crypto = require('crypto');

const smileIdBaseUrl = process.env.SMILEID_BASE_URL || 'https://api.smileidentity.com/v1';
const darajaBaseUrl = process.env.DARAJA_BASE_URL || 'https://sandbox.safaricom.co.ke';

const mockSmileVerification = {
  success: true,
  referenceId: 'MOCK_SMILE_12345',
  data: {
    ResultCode: '1012',
    ResultText: 'ID Match Successful (Mocked)',
  },
};

const mockDarajaStkPush = {
  success: true,
  referenceId: 'ws_CO_MockCheckoutID9999',
  message: 'Mock STK initiated',
};

const isPlaceholderCredential = (value) => {
  const normalizedValue = String(value || '').trim().toLowerCase();
  return !normalizedValue
    || normalizedValue.includes('placeholder')
    || normalizedValue.includes('change_me')
    || normalizedValue.includes('your_')
    || normalizedValue.includes('replace_me')
    || normalizedValue.includes('example')
    || normalizedValue.includes('dummy')
    || normalizedValue.startsWith('<')
    || normalizedValue === 'test'
    || normalizedValue === 'mock';
};

const shouldMockSmileId = () => [
  process.env.SMILEID_PARTNER_ID,
  process.env.SMILEID_API_KEY,
].some(isPlaceholderCredential);

const shouldMockDaraja = () => [
  process.env.DARAJA_CONSUMER_KEY,
  process.env.DARAJA_CONSUMER_SECRET,
  process.env.DARAJA_SHORTCODE,
  process.env.DARAJA_PASSKEY,
].some(isPlaceholderCredential);

const requireEnv = (...names) => {
  const missing = names.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }
};

const formatKenyanPhoneNumber = (phoneNumber) => {
  const digits = String(phoneNumber || '').replace(/\D/g, '');

  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('0') && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.startsWith('7') && digits.length === 9) return `254${digits}`;

  throw new Error('Phone number must be a valid Kenyan number in 07XXXXXXXX, 7XXXXXXXX, or 2547XXXXXXXX format');
};

const createSmileIdSignature = (timestamp) => {
  requireEnv('SMILEID_PARTNER_ID', 'SMILEID_API_KEY');
  return crypto
    .createHmac('sha256', process.env.SMILEID_API_KEY)
    .update(`${process.env.SMILEID_PARTNER_ID}${timestamp}`)
    .digest('base64');
};

const verifyIdentity = async (verificationData) => {
  if (shouldMockSmileId()) return { ...mockSmileVerification, data: { ...mockSmileVerification.data } };
  requireEnv('SMILEID_PARTNER_ID', 'SMILEID_API_KEY');

  const timestamp = new Date().toISOString();
  const payload = {
    ...verificationData,
    partner_id: process.env.SMILEID_PARTNER_ID,
    timestamp,
  };

  const response = await axios.post(`${smileIdBaseUrl}/id_verification`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-SmileID-Partner-ID': process.env.SMILEID_PARTNER_ID,
      'X-SmileID-Timestamp': timestamp,
      'X-SmileID-Signature': createSmileIdSignature(timestamp),
    },
  });

  return response.data;
};

const getDarajaAccessToken = async () => {
  requireEnv('DARAJA_CONSUMER_KEY', 'DARAJA_CONSUMER_SECRET');

  const credentials = Buffer
    .from(`${process.env.DARAJA_CONSUMER_KEY}:${process.env.DARAJA_CONSUMER_SECRET}`)
    .toString('base64');

  const response = await axios.get(`${darajaBaseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  return response.data.access_token;
};

const createMpesaPassword = (timestamp) => {
  requireEnv('DARAJA_SHORTCODE', 'DARAJA_PASSKEY');
  return Buffer
    .from(`${process.env.DARAJA_SHORTCODE}${process.env.DARAJA_PASSKEY}${timestamp}`)
    .toString('base64');
};

const queryMpesaStkPush = async ({ phoneNumber, checkoutRequestId }) => {
  if (shouldMockDaraja()) return { ...mockDarajaStkPush };
  requireEnv('DARAJA_SHORTCODE', 'DARAJA_PASSKEY');
  if (!checkoutRequestId) throw new Error('checkoutRequestId is required');

  const formattedPhoneNumber = formatKenyanPhoneNumber(phoneNumber);
  const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  const accessToken = await getDarajaAccessToken();

  const response = await axios.post(`${darajaBaseUrl}/mpesa/stkpush/v1/query`, {
    BusinessShortCode: process.env.DARAJA_SHORTCODE,
    Password: createMpesaPassword(timestamp),
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
    PhoneNumber: formattedPhoneNumber,
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

const initiateMpesaStkPush = async ({ phoneNumber, amount = 1, accountReference = 'Vendor Verification', transactionDesc = 'Vendor Verification', callbackUrl }) => {
  if (shouldMockDaraja()) return { ...mockDarajaStkPush };
  requireEnv('DARAJA_SHORTCODE', 'DARAJA_PASSKEY');

  const formattedPhoneNumber = formatKenyanPhoneNumber(phoneNumber);
  const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  const accessToken = await getDarajaAccessToken();

  const response = await axios.post(`${darajaBaseUrl}/mpesa/stkpush/v1/processrequest`, {
    BusinessShortCode: process.env.DARAJA_SHORTCODE,
    Password: createMpesaPassword(timestamp),
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Number(amount),
    PartyA: formattedPhoneNumber,
    PartyB: process.env.DARAJA_SHORTCODE,
    PhoneNumber: formattedPhoneNumber,
    CallBackURL: callbackUrl || process.env.DARAJA_CALLBACK_URL || 'https://example.com/api/vendors/mpesa/callback',
    AccountReference: accountReference,
    TransactionDesc: transactionDesc,
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

module.exports = {
  createSmileIdSignature,
  formatKenyanPhoneNumber,
  getDarajaAccessToken,
  initiateMpesaStkPush,
  queryMpesaStkPush,
  verifyIdentity,
};
