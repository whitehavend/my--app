const test = require('node:test');
const assert = require('node:assert/strict');
const { sendRegistrationCode } = require('../src/utils/emailVerification');

test('sendRegistrationCode works without SMTP config by using Ethereal test mail', async () => {
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASSWORD;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_SECURE;
  delete process.env.SMTP_FROM;

  const info = await sendRegistrationCode('demo@example.com', '123456');

  assert.ok(info, 'Expected email sending info to be returned');
  assert.ok(info.messageId || info.accepted?.length, 'Expected a valid message id or accepted recipients');
});
