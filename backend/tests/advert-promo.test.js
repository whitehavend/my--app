const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateAdvertCommissionUsd,
  generatePromoCode,
  isValidPromoCode,
  isWithinReferralWindow,
  normalizePromoCode,
} = require('../services/advertPromoService');
const User = require('../src/models/User');
const AdvertCommission = require('../src/models/AdvertCommission');
const { isAdvertCommissionReady } = require('../services/advertCommissionService');

test('normalizes and validates advert promo codes', () => {
  assert.equal(normalizePromoCode('  novA-2026  '), 'NOVA-2026');
  assert.equal(isValidPromoCode('NOVA-2026'), true);
  assert.equal(isValidPromoCode('x'), false);
  assert.equal(isValidPromoCode('INVALID CODE'), false);
});

test('generates a correctly formatted system promo code', () => {
  assert.match(generatePromoCode(), /^NOVA-[A-F0-9]{8}$/);
});

test('limits referral commission to orders within the first signup hour', () => {
  const signupAt = new Date('2026-10-02T10:00:00.000Z');
  assert.equal(isWithinReferralWindow(signupAt, new Date('2026-10-02T10:59:59.999Z')), true);
  assert.equal(isWithinReferralWindow(signupAt, new Date('2026-10-02T11:00:00.000Z')), false);
  assert.equal(isWithinReferralWindow(signupAt, new Date('2026-10-02T09:59:59.999Z')), false);
});

test('calculates a rounded 3% commission across order currencies', () => {
  const commission = calculateAdvertCommissionUsd([
    { price: 100, quantity: 1, currency: 'USD' },
    { price: 1500, quantity: 2, currency: 'KES' },
  ], { USD: 1, KES: 150 });

  assert.equal(commission, 3.6);
});

test('requires an exchange rate for non-USD orders', () => {
  assert.throws(
    () => calculateAdvertCommissionUsd([{ price: 10, quantity: 1, currency: 'NGN' }], { USD: 1 }),
    /exchange rate is unavailable for NGN/
  );
});

test('enforces unique advert codes and a USD commission ledger', () => {
  const promoCodeIndex = User.schema.indexes().find(([fields, options]) => (
    fields.promoCode === 1 && options.name === 'unique_advert_promo_code'
  ));
  assert.ok(promoCodeIndex);
  assert.equal(promoCodeIndex[1].unique, true);
  assert.deepEqual(promoCodeIndex[1].partialFilterExpression, {
    role: 'advert',
    promoCode: { $gt: '' },
  });

  const orderIndex = AdvertCommission.schema.indexes().find(([fields]) => fields.orderId === 1);
  assert.ok(orderIndex);
  assert.equal(orderIndex[1].unique, true);
  assert.equal(new AdvertCommission({ orderId: 'order-1', advertiserId: 'advert-1', amountUsd: 2, fulfilledAt: new Date() }).currency, 'USD');
});

test('commissions become eligible only after delivery is confirmed', () => {
  const order = { advertiserId: 'advert-1', advertCommissionUsd: 3 };
  assert.equal(isAdvertCommissionReady({ ...order, status: 'pending' }), false);
  assert.equal(isAdvertCommissionReady({ ...order, status: 'delivering' }), false);
  assert.equal(isAdvertCommissionReady({ ...order, status: 'picked_up' }), false);
  assert.equal(isAdvertCommissionReady({ ...order, status: 'delivered' }), true);
});