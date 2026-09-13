const express = require('express');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const categories = [
  'smartphones',
  'laptops',
  'gaming',
  'accessories',
  'appliances',
  'fashion',
];

router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ error: 'Unable to fetch products' });
  }
});

router.post('/products', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      brand,
      category,
      price,
      rating,
      stock,
      availabilityStatus,
      shippingInformation,
      weight,
      description,
      images,
      vendorId,
      vendorName,
    } = req.body;

    if (!title || !brand || !category || !price) {
      return res.status(400).json({ error: 'Title, brand, category, and price are required' });
    }

    const product = await Product.create({
      title,
      brand,
      category: category.toLowerCase(),
      price,
      rating: rating || 0,
      stock: stock || 0,
      availabilityStatus: availabilityStatus || 'In stock',
      shippingInformation: shippingInformation || '',
      weight: weight || 0,
      description: description || '',
      images: Array.isArray(images) ? images : [],
      vendorId: vendorId || req.user?.id || '',
      vendorName: vendorName || req.user?.fullName || '',
    });

    return res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ error: 'Unable to create product', details: error.message });
  }
});

router.get('/products/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const filteredProducts = await Product.find({
      category: category.toLowerCase(),
    }).sort({ createdAt: -1 });

    if (!filteredProducts.length) {
      return res.status(404).json({ error: 'No products found for this category' });
    }

    return res.status(200).json({ products: filteredProducts });
  } catch (error) {
    console.error('Get category products error:', error);
    return res.status(500).json({ error: 'Unable to fetch products for this category' });
  }
});

router.get('/products/category-list', (req, res) => {
  return res.status(200).json(categories);
});

module.exports = router;
