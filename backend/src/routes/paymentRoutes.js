const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { initiateMpesaStkPush } = require('../../services/verificationService');

const router = express.Router();
const allowedInitiators = new Set(['customer', 'rider', 'vendor']);

const normalizePhone = (value) => String(value || '').replace(/\s+/g, '');

const canInitiateForOrder = async (user, order) => {
  if (user.role === 'customer') return String(order.userId) === String(user.id);

  if (user.role === 'vendor') {
    const products = await Product.find({ vendorId: String(user.id) }).select('_id');
    const productIds = new Set(products.map((product) => String(product._id)));
    return order.items.some((item) => productIds.has(String(item.productId)));
  }

  if (user.role === 'logistic') {
    const logistic = await User.findOne({
      _id: user.id,
      role: 'logistic',
      'logisticRequests.orderId': String(order._id),
    }).select('logisticRequests');
    const request = logistic?.logisticRequests.find((item) => (
      String(item.orderId) === String(order._id)
      && ['accepted', 'picked_up'].includes(item.status)
    ));
    return Boolean(request);
  }

  return false;
};

router.post('/stkpush', authMiddleware, async (req, res) => {
  try {
    const { orderId, phoneNumber, amount, initiatedBy } = req.body || {};

    if (!orderId || !allowedInitiators.has(initiatedBy)) {
      return res.status(400).json({ error: 'orderId and initiatedBy (customer, rider, or vendor) are required' });
    }

    const expectedRole = initiatedBy === 'rider' ? 'logistic' : initiatedBy;
    if (req.user.role !== expectedRole) {
      return res.status(403).json({ error: `Only an authenticated ${initiatedBy} can initiate this payment` });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (['cancelled', 'delivered'].includes(order.status)) return res.status(400).json({ error: 'This order is no longer payable' });
    if (order.paymentStatus === 'paid') return res.status(409).json({ error: 'This order has already been paid' });

    const requestedAmount = Number(amount);
    const storedAmount = Number(order.totalAmount);
    if (!Number.isFinite(requestedAmount) || requestedAmount !== storedAmount) {
      return res.status(400).json({ error: 'Payment amount must exactly match the order total' });
    }
    if (!Number.isInteger(storedAmount) || storedAmount < 1) {
      return res.status(400).json({ error: 'Order total must be a positive whole number for M-Pesa' });
    }

    if (!(await canInitiateForOrder(req.user, order))) {
      return res.status(403).json({ error: 'You are not authorized to initiate payment for this order' });
    }

    const customer = await User.findById(order.userId).select('phoneNumber countryCode');
    const registeredPhone = normalizePhone(`${customer?.countryCode || ''}${customer?.phoneNumber || ''}`);
    const requestedPhone = normalizePhone(phoneNumber);
    if (!registeredPhone) return res.status(400).json({ error: 'The customer has no registered phone number' });
    if (requestedPhone && requestedPhone !== registeredPhone) return res.status(400).json({ error: 'The payment phone must match the customer registered phone' });

    const callbackBase = String(process.env.CALLBACK_URL_BASE || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const stkResponse = await initiateMpesaStkPush({
      phoneNumber: registeredPhone,
      amount: storedAmount,
      accountReference: String(order._id),
      transactionDesc: `Order payment initiated by ${initiatedBy}`,
      callbackUrl: `${callbackBase}/api/payments/mpesa-callback`,
    });
    const checkoutRequestId = stkResponse.CheckoutRequestID || stkResponse.checkoutRequestId || stkResponse.checkoutId || stkResponse.referenceId || '';
    if (!checkoutRequestId) return res.status(502).json({ error: 'M-Pesa did not return a checkout reference' });

    order.paymentMethod = 'mpesa';
    order.paymentStatus = 'pending';
    order.paymentReference = checkoutRequestId;
    order.paymentInitiatedBy = initiatedBy;
    order.paymentError = '';
    order.paymentAttempts.push({ initiatedBy, checkoutRequestId, amount: storedAmount, phoneNumber: registeredPhone, status: 'pending', createdAt: new Date() });
    await order.save();

    return res.status(200).json({ message: 'M-Pesa prompt sent to the customer registered phone', paymentPending: true, order, checkoutRequestId });
  } catch (error) {
    console.error('STK push error:', error);
    return res.status(502).json({ error: error.message || 'Unable to initiate M-Pesa payment' });
  }
});

router.post('/mpesa-callback', async (req, res) => {
  try {
    const callback = req.body?.Body?.stkCallback || req.body?.stkCallback || req.body || {};
    const checkoutRequestId = callback.CheckoutRequestID || callback.checkoutRequestId || callback.referenceId;
    if (!checkoutRequestId) return res.status(400).json({ error: 'CheckoutRequestID is required' });

    const order = await Order.findOne({ paymentReference: checkoutRequestId });
    if (!order) return res.status(404).json({ error: 'Order payment not found' });
    const resultCode = Number(callback.ResultCode ?? callback.resultCode);
    const attempt = order.paymentAttempts.find((item) => item.checkoutRequestId === checkoutRequestId);

    if (resultCode === 0) {
      order.paymentStatus = 'paid';
      order.paymentError = '';
      order.status = 'delivered';
      if (attempt) attempt.status = 'paid';
    } else {
      order.paymentStatus = 'insufficient_funds';
      order.paymentError = callback.ResultDesc || callback.resultDescription || 'M-Pesa payment was not completed';
      if (attempt) {
        attempt.status = 'insufficient_funds';
        attempt.errorMessage = order.paymentError;
      }
    }
    await order.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('STK callback error:', error);
    return res.status(500).json({ error: 'Unable to process M-Pesa callback' });
  }
});

module.exports = router;
