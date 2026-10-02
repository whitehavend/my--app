const mongoose = require('mongoose');

const advertCommissionSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    advertiserId: {
      type: String,
      required: true,
      index: true,
    },
    amountUsd: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD'],
    },
    fulfilledAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.models.AdvertCommission || mongoose.model('AdvertCommission', advertCommissionSchema);