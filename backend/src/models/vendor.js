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
    kycVerification: {
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
      required: function () {
        return this.vendorType === 'RETAIL';
      },
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
