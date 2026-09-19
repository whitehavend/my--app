const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Product = require('../models/Product');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart items are required' });
  }

  try {
    const newOrder = await Order.create({
      userId: req.user.id,
      items: items.map((item) => ({
        productId: item.id || item.productId || item._id,
        title: item.title || 'Product',
        brand: item.brand || '',
        image: item.images?.[0] || item.image || '',
        currency: item.currency || 'NGN',
        price: Number(item.price || 0),
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
    console.error('Create order error:', error);
    return res.status(500).json({ error: 'Unable to place order', details: error.message });
  }
});

router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const userOrders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
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
      ? await Order.find({ 'items.productId': { $in: productIds } }).sort({ createdAt: -1 })
      : [];

    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Fetch vendor orders error:', error);
    return res.status(500).json({ error: 'Unable to fetch fulfillment orders' });
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

module.exports = router;
