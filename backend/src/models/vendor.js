const mongoose = require('mongoose');

const verificationStatusSchema = {
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'FAILED'],
    default: 'PENDING',
  },
  referenceId: {
    type: String,
    trim: true,
    default: '',
  },
  errorMessage: {
    type: String,
    trim: true,
    default: '',
  },
  filePath: {
    type: String,
    trim: true,
    default: '',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
};

const payoutDetailsSchema = {
  method: {
    type: String,
    enum: ['BANK', 'MPESA', 'PAYPAL'],
    default: null,
  },
  payoutOption: {
    type: String,
    enum: ['DIRECT_PAYMENT', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY'],
    default: 'DIRECT_PAYMENT',
  },
  commissionPercent: {
    type: Number,
    min: 0,
    max: 100,
    default: 15,
  },
  accountHolderName: { type: String, trim: true, default: '' },
  bankName: { type: String, trim: true, default: '' },
  accountNumber: { type: String, trim: true, default: '' },
  branchCode: { type: String, trim: true, default: '' },
  mpesaPhoneNumber: { type: String, trim: true, default: '' },
  paypalEmail: { type: String, trim: true, lowercase: true, default: '' },
  currency: { type: String, uppercase: true, trim: true, default: 'KES' },
  status: { type: String, enum: ['PENDING', 'VERIFIED', 'FAILED'], default: 'PENDING' },
  errorMessage: { type: String, trim: true, default: '' },
  updatedAt: { type: Date, default: Date.now },
};

const vendorSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    vendorType: {
      type: String,
      required: true,
      enum: ['RETAIL', 'HEALTH_AGRO', 'REAL_ESTATE_CAR'],
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    verificationRequired: {
      type: [String],
      default: [],
    },
    verificationStatus: {
      kycVerified: { type: Boolean, default: false },
      kraVerified: { type: Boolean, default: false },
      financialGatewayVerified: { type: Boolean, default: false },
      professionalLicenseVerified: { type: Boolean, default: false },
      premisesLicenseVerified: { type: Boolean, default: false },
      financialSettlementVerified: { type: Boolean, default: false },
      lastUpdated: { type: Date, default: Date.now },
    },
    settlementInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SettlementInfo',
      default: null,
    },
    payoutDetails: {
      type: payoutDetailsSchema,
      default: () => ({}),
    },
    kycVerification: {
      type: verificationStatusSchema,
      default: () => ({}),
    },
    kybVerification: {
      type: verificationStatusSchema,
      default: () => ({}),
    },
    financialGatewayVerification: {
      type: verificationStatusSchema,
      default: () => ({}),
    },
    kraPinVerification: {
      type: verificationStatusSchema,
      default: () => ({}),
    },
    businessDocumentation: {
      type: verificationStatusSchema,
      default: undefined,
    },
    professionalLicenseVerification: {
      type: verificationStatusSchema,
      required: function () {
        return this.vendorType === 'HEALTH_AGRO';
      },
      default: undefined,
    },
    premisesLicenseVerification: {
      type: verificationStatusSchema,
      required: function () {
        return this.vendorType === 'HEALTH_AGRO';
      },
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);
module.exports.verificationStatusSchema = verificationStatusSchema;
