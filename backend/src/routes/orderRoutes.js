const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Order = require('../models/Order');

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
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
      })),
      totalAmount: Number(totalAmount || 0),
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || 'cash_on_delivery',
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

module.exports = router;
