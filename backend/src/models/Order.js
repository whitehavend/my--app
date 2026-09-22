const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    brand: { type: String, default: '' },
    image: { type: String, default: '' },
    currency: { type: String, default: 'NGN', uppercase: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    priceType: { type: String, enum: ['retail', 'wholesale'], default: 'retail' },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: true }
);

const paymentAttemptSchema = new mongoose.Schema(
  {
    initiatedBy: { type: String, enum: ['customer', 'rider', 'vendor'], required: true },
    checkoutRequestId: { type: String, required: true },
    amount: { type: Number, required: true, min: 1 },
    phoneNumber: { type: String, required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'insufficient_funds'], default: 'pending' },
    errorMessage: { type: String, default: '' },
  },
  { timestamps: true },
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      default: [],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      type: Object,
      default: {},
    },
    paymentMethod: {
      type: String,
      default: 'cash_on_delivery',
    },
    paymentStatus: {
      type: String,
      enum: ['not_required', 'pending', 'paid', 'failed', 'insufficient_funds'],
      default: 'not_required',
    },
    paymentReference: {
      type: String,
      default: '',
    },
    paymentError: {
      type: String,
      default: '',
    },
    paymentInitiatedBy: {
      type: String,
      enum: ['customer', 'rider', 'vendor', ''],
      default: '',
    },
    paymentAttempts: {
      type: [paymentAttemptSchema],
      default: [],
    },
    currency: {
      type: String,
      default: 'NGN',
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'delivering', 'picked_up', 'delivered', 'cancelled'],
    },
    historyExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      expires: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
