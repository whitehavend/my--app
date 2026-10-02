const crypto = require('crypto');
const User = require('../src/models/User');

const PROMO_CODE_PATTERN = /^[A-Z0-9-]{4,20}$/;
const REFERRAL_WINDOW_MS = 60 * 60 * 1000;
const ADVERT_COMMISSION_RATE = 0.03;
let advertPromoIndexesReady;

const normalizePromoCode = (value) => String(value || '').trim().toUpperCase();

const isValidPromoCode = (value) => PROMO_CODE_PATTERN.test(normalizePromoCode(value));

const generatePromoCode = () => `NOVA-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

const ensureAdvertPromoIndexes = () => {
  if (!advertPromoIndexesReady) advertPromoIndexesReady = User.createIndexes();
  return advertPromoIndexesReady;
};

const backfillAdvertPromoCodes = async () => {
  await ensureAdvertPromoIndexes();
  const advertisers = await User.find({
    role: 'advert',
    promoCode: { $in: [null, ''] },
  }).select('_id').lean();

  let assignedCount = 0;
  for (const advertiser of advertisers) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = generatePromoCode();
      try {
        const result = await User.updateOne(
          {
            _id: advertiser._id,
            role: 'advert',
            promoCode: { $in: [null, ''] },
          },
          { $set: { promoCode: code } },
        );
        if (result.modifiedCount === 1) assignedCount += 1;
        break;
      } catch (error) {
        if (error.code !== 11000 || attempt === 4) throw error;
      }
    }
  }

  return assignedCount;
};

const isWithinReferralWindow = (signupAt, orderAt = new Date()) => {
  const signupTime = new Date(signupAt).getTime();
  const orderTime = new Date(orderAt).getTime();
  return Number.isFinite(signupTime) && orderTime >= signupTime && orderTime - signupTime < REFERRAL_WINDOW_MS;
};

const calculateAdvertCommissionUsd = (items, usdExchangeRates) => {
  const subtotalUsd = items.reduce((subtotal, item) => {
    const amount = Number(item.price) * Number(item.quantity);
    if (!Number.isFinite(amount) || amount < 0) throw new Error('Order item amount is invalid');

    const currency = String(item.currency || 'USD').trim().toUpperCase();
    const unitsPerUsd = currency === 'USD' ? 1 : Number(usdExchangeRates[currency]);
    if (!Number.isFinite(unitsPerUsd) || unitsPerUsd <= 0) {
      throw new Error(`A USD exchange rate is unavailable for ${currency}`);
    }

    return subtotal + amount / unitsPerUsd;
  }, 0);

  return Math.round((subtotalUsd * ADVERT_COMMISSION_RATE + Number.EPSILON) * 100) / 100;
};

module.exports = {
  calculateAdvertCommissionUsd,
  backfillAdvertPromoCodes,
  ensureAdvertPromoIndexes,
  generatePromoCode,
  isValidPromoCode,
  isWithinReferralWindow,
  normalizePromoCode,
};