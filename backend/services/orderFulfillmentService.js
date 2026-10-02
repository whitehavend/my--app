const FULFILLMENT_DELAY_MS = 30 * 60 * 1000;

const canVendorFulfillOrder = (order, now = Date.now()) => {
  if (order?.status !== 'pending' || !order.collectionOfficerAcceptedAt) return false;

  const createdAt = new Date(order.createdAt).getTime();
  return Number.isFinite(createdAt) && now - createdAt >= FULFILLMENT_DELAY_MS;
};

module.exports = { FULFILLMENT_DELAY_MS, canVendorFulfillOrder };