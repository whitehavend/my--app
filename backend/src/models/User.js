const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
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
      enum: ['customer', 'vendor', 'advert'],
      default: 'customer',
    },
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role === 'customer';
      },
    },
    shopName: {
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
