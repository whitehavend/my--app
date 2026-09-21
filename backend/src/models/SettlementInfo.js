const mongoose = require('mongoose');

const settlementInfoSchema = new mongoose.Schema(
  {
    vendorType: {
      type: String,
      required: true,
      enum: ['retailshopvendor', 'cardealer', 'realestate', 'pharmacy', 'agrovet'],
    },
    payoutMethod: {
      type: String,
      required: true,
      enum: ['bank', 'mpesa', 'wallet'],
    },
    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      default: '',
      trim: true,
    },
    bankName: {
      type: String,
      default: '',
      trim: true,
    },
    phoneNumber: {
      type: String,
      default: '',
      trim: true,
    },
    walletId: {
      type: String,
      default: '',
      trim: true,
    },
    currency: {
      type: String,
      default: 'KES',
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.SettlementInfo || mongoose.model('SettlementInfo', settlementInfoSchema);
