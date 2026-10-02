const test = require('node:test');
const assert = require('node:assert/strict');
const Order = require('../src/models/Order');

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

test('orders expire 30 days after creation', () => {
  const expiryPath = Order.schema.path('historyExpiresAt');
  const now = Date.now();
  const expiry = expiryPath.defaultValue().getTime();
  const ttlIndex = Order.schema.indexes().find(([fields]) => fields.historyExpiresAt === 1);

  assert.ok(expiry - now >= THIRTY_DAYS_MS);
  assert.ok(expiry - now < THIRTY_DAYS_MS + 1000);
  assert.ok(ttlIndex);
  assert.equal(ttlIndex[1].expireAfterSeconds, 0);
});
