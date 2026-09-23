const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      default: '',
      trim: true,
    },
    secondName: {
      type: String,
      default: '',
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'vendor', 'advert', 'logistic', 'collectionOfficer', 'blackmarket', 'admin'],
      default: 'customer',
    },
    vendorType: {
      type: String,
      enum: ['retailshopvendor', 'cardealer', 'realestate', 'pharmacy', 'agrovet', ''],
      default: '',
    },
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role !== 'vendor';
      },
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
    shopName: {
      type: String,
      default: '',
    },
    deliveryAddress: {
      type: String,
      default: '',
    },
    shopAddress: {
      type: String,
      default: '',
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    countryCode: {
      type: String,
      default: '',
    },
    advertSocials: {
      type: Map,
      of: String,
      default: {},
    },
    businessName: {
      type: String,
      default: '',
    },
    logisticAvailable: {
      type: Boolean,
      default: false,
    },
    logisticRequests: {
      type: [{
        orderId: String,
        customerId: String,
        vendorId: String,
        vendorFullName: String,
        vendorShopName: String,
        vendorPhoneNumber: String,
        vendorShopAddress: String,
        dropOffAddress: String,
        dropOffLatitude: Number,
        dropOffLongitude: Number,
        dropOffGoogleMapsUrl: String,
        status: { type: String, enum: ['pending', 'accepted', 'rejected', 'picked_up', 'delivered'], default: 'pending' },
        pickedUpAt: Date,
        requestedAt: { type: Date, default: Date.now },
      }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
