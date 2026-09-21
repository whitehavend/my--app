const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    brand: { type: String, default: '' },
    image: { type: String, default: '' },
    currency: { type: String, default: 'NGN', uppercase: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: true }
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
