const AdvertCommission = require('../src/models/AdvertCommission');
const Order = require('../src/models/Order');
let commissionIndexesReady;

const ensureCommissionIndexes = () => {
  if (!commissionIndexesReady) commissionIndexesReady = AdvertCommission.createIndexes();
  return commissionIndexesReady;
};

const isAdvertCommissionReady = (order) => (
  order?.status === 'delivered'
  && Boolean(order.advertiserId)
  && Number(order.advertCommissionUsd) > 0
);

const recordAdvertCommission = async (order) => {
  if (!isAdvertCommissionReady(order)) return false;

  await ensureCommissionIndexes();
  try {
    await AdvertCommission.updateOne(
      { orderId: String(order._id) },
      {
        $setOnInsert: {
          orderId: String(order._id),
          advertiserId: String(order.advertiserId),
          amountUsd: Number(order.advertCommissionUsd),
          currency: 'USD',
          fulfilledAt: order.updatedAt || new Date(),
        },
      },
      { upsert: true },
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
  }

  return true;
};

const getAdvertCommissionWallet = async (advertiserId) => {
  const deliveredOrders = await Order.find({
    advertiserId: String(advertiserId),
    status: 'delivered',
    advertCommissionUsd: { $gt: 0 },
  }).select('_id advertiserId advertCommissionUsd updatedAt').lean();

  await Promise.all(deliveredOrders.map((order) => recordAdvertCommission({
    ...order,
    status: 'delivered',
  })));

  const [wallet] = await AdvertCommission.aggregate([
    { $match: { advertiserId: String(advertiserId) } },
    { $group: { _id: null, balance: { $sum: '$amountUsd' }, commissionCount: { $sum: 1 } } },
  ]);

  return {
    balance: Number(wallet?.balance || 0),
    currency: 'USD',
    commissionCount: Number(wallet?.commissionCount || 0),
  };
};

module.exports = { getAdvertCommissionWallet, isAdvertCommissionReady, recordAdvertCommission };