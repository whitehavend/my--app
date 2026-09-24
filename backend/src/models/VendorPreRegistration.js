const mongoose = require('mongoose');

const vendorPreRegistrationSchema = new mongoose.Schema(
  {
    shopName: { type: String, required: true, trim: true },
    normalizedShopName: { type: String, required: true, unique: true, trim: true, lowercase: true },
  },
  { timestamps: true },
);

module.exports = mongoose.models.VendorPreRegistration || mongoose.model('VendorPreRegistration', vendorPreRegistrationSchema);
