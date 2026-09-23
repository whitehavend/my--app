const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { initiateMpesaStkPush } = require('../../services/verificationService');

const router = express.Router();

const requireCollectionOfficer = (req, res, next) => {
  if (req.user?.role !== 'collectionOfficer') {
    return res.status(403).json({ error: 'Collection officer access is required' });
  }
  return next();
};

router.post('/', authMiddleware, async (req, res) => {
  const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart items are required' });
  }

  const volumeUpdates = [];
  const rollbackVolumeUpdates = async () => {
    await Promise.all(volumeUpdates.map(({ productId, quantity }) => Product.updateOne(
      { _id: productId },
      { $inc: { wholesaleVolume: quantity } },
    )));
  };

  try {
    const requestedQuantities = new Map();
    items.forEach((item) => {
      const productId = String(item.id || item.productId || item._id || '');
      const quantity = Number(item.quantity || 1);
      if (productId && quantity > 0) {
        const key = `${productId}:${item.priceType || 'retail'}`;
        requestedQuantities.set(key, { productId, priceType: item.priceType || 'retail', quantity: (requestedQuantities.get(key)?.quantity || 0) + quantity });
      }
    });

    const requestedItems = [...requestedQuantities.values()];
    const productIds = [...new Set(requestedItems.map(({ productId }) => productId))];
    const products = productIds.length ? await Product.find({ _id: { $in: productIds } }) : [];
    const productsById = new Map(products.map((product) => [String(product._id), product]));
    for (const { productId, priceType, quantity } of requestedItems) {
      const product = productsById.get(productId);
      if (priceType !== 'wholesale') continue;
      
      if (!product || product.wholesaleVolume === null || product.wholesaleVolume === undefined) {
        continue;
      }

      if (product.wholesaleVolume < quantity) {
        await rollbackVolumeUpdates();
        return res.status(400).json({ error: `${product.title} does not have enough wholesale volume available` });
      }

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, wholesaleVolume: { $gte: quantity } },
        { $inc: { wholesaleVolume: -quantity } },
        { new: true },
      );

      if (!updatedProduct) {
        await rollbackVolumeUpdates();
        return res.status(409).json({ error: `${product.title} was just ordered by someone else. Please refresh and try again` });
      }

      volumeUpdates.push({ productId, quantity });
    }

    const newOrder = await Order.create({
      userId: req.user.id,
      items: items.map((item) => ({
        productId: item.id || item.productId || item._id,
        title: item.title || 'Product',
        brand: item.brand || '',
        image: item.images?.[0] || item.image || '',
        currency: item.currency || 'NGN',
        price: Number(item.price || 0),
        priceType: item.priceType || 'retail',
        quantity: Number(item.quantity || 1),
      })),
      totalAmount: Number(totalAmount || 0),
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || 'cash_on_delivery',
      currency: items[0]?.currency || 'NGN',
      status: 'pending',
    });

    return res.status(201).json({
      message: 'Order placed successfully',
      order: newOrder,
    });
  } catch (error) {
    await rollbackVolumeUpdates();
    console.error('Create order error:', error);
    return res.status(500).json({ error: 'Unable to place order', details: error.message });
  }
});

router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const userOrders = await Order.find({
      userId: req.user.id,
      $or: [
        { historyExpiresAt: { $gt: new Date() } },
        { historyExpiresAt: { $exists: false } },
      ],
    }).sort({ createdAt: -1 });
    return res.status(200).json({ orders: userOrders });
  } catch (error) {
    console.error('Fetch user orders error:', error);
    return res.status(500).json({ error: 'Unable to fetch orders' });
  }
});

router.get('/vendor', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({ vendorId: String(req.user.id) }).select('_id');
    const productIds = products.map((product) => String(product._id));
    const orders = productIds.length
      ? await Order.find({ status: { $in: ['pending', 'delivering'] }, 'items.productId': { $in: productIds } }).sort({ createdAt: -1 })
      : [];

    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Fetch vendor orders error:', error);
    return res.status(500).json({ error: 'Unable to fetch fulfillment orders' });
  }
});

router.get('/collection-officer', authMiddleware, requireCollectionOfficer, async (req, res) => {
  try {
    const [orders, logistics] = await Promise.all([
      Order.find({
        $or: [
          { historyExpiresAt: { $gt: new Date() } },
          { historyExpiresAt: { $exists: false } },
        ],
      }).sort({ createdAt: -1 }).lean(),
      User.find({ role: 'logistic', logisticAvailable: true })
        .select('fullName phoneNumber countryCode email logisticAvailable')
        .sort({ fullName: 1 })
        .lean(),
    ]);

    const customerIds = [...new Set(orders.map((order) => String(order.userId)))];
    const customers = await User.find({ _id: { $in: customerIds } }).select('fullName email phoneNumber countryCode').lean();
    const customersById = new Map(customers.map((customer) => [String(customer._id), customer]));

    return res.status(200).json({
      orders: orders.map((order) => ({ ...order, customer: customersById.get(String(order.userId)) || null })),
      logistics,
    });
  } catch (error) {
    console.error('Fetch collection officer data error:', error);
    return res.status(500).json({ error: 'Unable to fetch collection officer data' });
  }
});

router.post('/collection-officer/:orderId/assign-logistic', authMiddleware, requireCollectionOfficer, async (req, res) => {
  try {
    const logisticId = String(req.body.logisticId || '');
    const [order, logistic] = await Promise.all([
      Order.findById(req.params.orderId),
      User.findOne({ _id: logisticId, role: 'logistic', logisticAvailable: true }),
    ]);

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!logistic) return res.status(404).json({ error: 'Available logistic not found' });
    if (!['pending', 'delivering'].includes(order.status)) {
      return res.status(400).json({ error: 'Only pending or delivering orders can be assigned' });
    }

    const alreadyAssigned = logistic.logisticRequests.some((request) => (
      String(request.orderId) === String(order._id) && !['rejected', 'delivered'].includes(request.status)
    ));
    if (alreadyAssigned) return res.status(409).json({ error: 'This order is already assigned to this logistic' });

    logistic.logisticRequests.push({
      orderId: String(order._id),
      customerId: String(order.userId),
      vendorFullName: 'Collection officer assignment',
      vendorShopName: 'Nova Unicorn collection desk',
      vendorShopAddress: order.shippingAddress?.address || order.shippingAddress?.deliveryAddress || '',
    });
    await logistic.save();

    return res.status(201).json({ message: 'Order assigned to logistic successfully', logisticId: String(logistic._id) });
  } catch (error) {
    console.error('Assign collection order error:', error);
    return res.status(500).json({ error: 'Unable to assign order to logistic' });
  }
});

router.patch('/:id/fulfill', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ error: 'Only vendors can fulfill orders' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const vendorProducts = await Product.find({ vendorId: String(req.user.id) }).select('_id');
    const vendorProductIds = new Set(vendorProducts.map((product) => String(product._id)));
    const ownsOrderItem = order.items.some((item) => vendorProductIds.has(String(item.productId)));

    if (!ownsOrderItem) {
      return res.status(403).json({ error: 'You can only fulfill orders containing your products' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending orders can be fulfilled' });
    }

    const fulfillmentDelayMs = 30 * 60 * 1000;
    const elapsedMs = Date.now() - new Date(order.createdAt).getTime();
    if (elapsedMs < fulfillmentDelayMs) {
      const minutesRemaining = Math.ceil((fulfillmentDelayMs - elapsedMs) / 60000);
      return res.status(400).json({ error: `This order can be fulfilled in approximately ${minutesRemaining} minute(s)` });
    }

    order.status = 'delivering';
    await order.save();
    return res.status(200).json({ message: 'Order marked as being delivered', order });
  } catch (error) {
    console.error('Fulfill order error:', error);
    return res.status(500).json({ error: 'Unable to fulfill order' });
  }
});

router.patch('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Only customers can cancel orders' });
    }

    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending orders can be cancelled' });
    }

    order.status = 'cancelled';
    await order.save();
    return res.status(200).json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(500).json({ error: 'Unable to cancel order' });
  }
});

router.patch('/:id/arrived', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'customer') return res.status(403).json({ error: 'Only customers can confirm delivery' });
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'picked_up') return res.status(400).json({ error: 'Goods can be confirmed after pickup' });

    if (order.paymentStatus === 'paid') {
      order.status = 'delivered';
      await order.save();
      return res.status(200).json({ message: 'Delivery confirmed', order });
    }

    const customer = await User.findById(req.user.id).select('phoneNumber countryCode');
    const phoneNumber = `${customer?.countryCode || ''}${customer?.phoneNumber || ''}`.replace(/\s+/g, '');
    if (!phoneNumber) return res.status(400).json({ error: 'A registered phone number is required before confirming delivery' });

    const stkResponse = await initiateMpesaStkPush({
      phoneNumber,
      amount: Math.max(1, Math.round(Number(order.totalAmount || 0))),
      accountReference: `Order-${order._id}`,
      callbackUrl: `${String(process.env.CALLBACK_URL_BASE || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '')}/api/orders/mpesa-callback`,
    });
    const checkoutRequestId = stkResponse.CheckoutRequestID || stkResponse.checkoutRequestId || stkResponse.checkoutId || stkResponse.referenceId || '';
    if (!checkoutRequestId) return res.status(502).json({ error: 'M-Pesa did not return a checkout reference' });

    order.paymentMethod = 'mpesa';
    order.paymentStatus = 'pending';
    order.paymentReference = checkoutRequestId;
    order.paymentError = '';
    await order.save();
    return res.status(200).json({ message: 'M-Pesa payment prompt sent to your registered phone', paymentPending: true, order });
  } catch (error) {
    console.error('Confirm delivery error:', error);
    return res.status(502).json({ error: error.message || 'Unable to start M-Pesa payment' });
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
    if (resultCode === 0) {
      order.paymentStatus = 'paid';
      order.paymentError = '';
      order.status = 'delivered';
    } else {
      order.paymentStatus = 'failed';
      order.paymentError = callback.ResultDesc || callback.resultDescription || 'M-Pesa payment was not completed';
    }
    await order.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('M-Pesa order callback error:', error);
    return res.status(500).json({ error: 'Unable to process M-Pesa callback' });
  }
});

module.exports = router;
