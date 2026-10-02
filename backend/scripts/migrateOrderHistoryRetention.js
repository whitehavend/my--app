require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../src/models/Order');
const getMongoUri = require('../src/config/mongoUri');

const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

const migrateOrderHistoryRetention = async () => {
  const mongoUri = getMongoUri();
  if (!mongoUri) throw new Error('MONGO_URI or MONGODB_URI must be configured before migrating order history.');

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  try {
    const result = await Order.updateMany(
      {
        createdAt: { $type: 'date' },
        $expr: {
          $lt: [
            { $ifNull: ['$historyExpiresAt', '$createdAt'] },
            { $add: ['$createdAt', RETENTION_MS] },
          ],
        },
      },
      [{ $set: { historyExpiresAt: { $add: ['$createdAt', RETENTION_MS] } } }],
    );
    console.log(`Extended order history retention for ${result.modifiedCount} order(s).`);
  } finally {
    await mongoose.disconnect();
  }
};

migrateOrderHistoryRetention().catch(async (error) => {
  console.error(`Unable to migrate order history retention: ${error.message}`);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
