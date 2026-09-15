const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const demoProducts = [];

const categories = [
  'smartphones',
  'laptops',
  'gaming',
  'accessories',
  'appliances',
  'fashion',
];

const normalizeImages = (images) => {
  if (!images) {
    return [];
  }

  if (Array.isArray(images)) {
    return images
      .map((image) => (typeof image === 'string' ? image.trim() : ''))
      .filter(Boolean);
  }

  if (typeof images === 'string') {
    return images
      .split(',')
      .map((image) => image.trim())
      .filter(Boolean);
  }

  return [];
};

const shouldUseDemoData = () => !process.env.MONGO_URI || mongoose.connection.readyState !== 1;

router.get('/products', async (req, res) => {
  try {
    if (shouldUseDemoData()) {
      return res.status(200).json({ products: demoProducts.slice().reverse() });
    }

    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(200).json({ products: demoProducts.slice().reverse() });
  }
});

router.post('/products', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      brand,
      category,
      price,
      salePrice,
      compareAtPrice,
      priceDetails,
      rating,
      stock,
      availabilityStatus,
      shippingInformation,
      weight,
      description,
      images,
    } = req.body;

    const isMongoObjectId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id) && mongoose.connection.readyState === 1;

    let currentUser = null;

    if (isMongoObjectId(req.user.id)) {
      currentUser = await User.findById(req.user.id).select('-password');
    } else {
      currentUser = {
        id: req.user.id,
        _id: req.user.id,
        role: req.user.role,
        isApproved: req.user.isApproved ?? true,
        fullName: req.user.fullName || '',
        shopName: req.user.shopName || '',
      };
    }

    if (!currentUser || currentUser.role !== 'vendor') {
      return res.status(403).json({ error: 'Only approved vendors can upload products' });
    }

    if (currentUser.isApproved === false || req.user.isApproved === false) {
      return res.status(403).json({ error: 'Your vendor account is not approved yet' });
    }

    if (!title || !brand || !category || !description || price === undefined || stock === undefined) {
      return res.status(400).json({
        error: 'Title, brand, category, description, price, and stock are required',
      });
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    const normalizedImages = normalizeImages(images);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ error: 'Price must be a valid number greater than or equal to zero' });
    }

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ error: 'Stock must be a valid number greater than or equal to zero' });
    }

    try {
      if (shouldUseDemoData()) {
        const product = {
          _id: `demo_${Date.now()}`,
          title: title.trim(),
          brand: brand.trim(),
          category: category.toLowerCase().trim(),
          price: parsedPrice,
          salePrice: salePrice === undefined || salePrice === null || salePrice === '' ? null : Number(salePrice),
          compareAtPrice: compareAtPrice === undefined || compareAtPrice === null || compareAtPrice === '' ? null : Number(compareAtPrice),
          priceDetails: priceDetails || '',
          rating: rating || 0,
          stock: parsedStock,
          availabilityStatus: availabilityStatus || (parsedStock > 0 ? 'In stock' : 'Out of stock'),
          shippingInformation: shippingInformation || '',
          weight: weight === undefined || weight === null || weight === '' ? 0 : Number(weight),
          description: description.trim(),
          images: normalizedImages,
          vendorId: currentUser.id || currentUser._id,
          vendorName: currentUser.shopName || currentUser.fullName || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        demoProducts.push(product);
        return res.status(201).json({ message: 'Product created successfully', product });
      }

      const product = await Product.create({
        title: title.trim(),
        brand: brand.trim(),
        category: category.toLowerCase().trim(),
        price: parsedPrice,
        salePrice: salePrice === undefined || salePrice === null || salePrice === '' ? null : Number(salePrice),
        compareAtPrice: compareAtPrice === undefined || compareAtPrice === null || compareAtPrice === '' ? null : Number(compareAtPrice),
        priceDetails: priceDetails || '',
        rating: rating || 0,
        stock: parsedStock,
        availabilityStatus: availabilityStatus || (parsedStock > 0 ? 'In stock' : 'Out of stock'),
        shippingInformation: shippingInformation || '',
        weight: weight === undefined || weight === null || weight === '' ? 0 : Number(weight),
        description: description.trim(),
        images: normalizedImages,
        vendorId: currentUser.id || currentUser._id,
        vendorName: currentUser.shopName || currentUser.fullName || '',
      });

      return res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
      const product = {
        _id: `demo_${Date.now()}`,
        title: title.trim(),
        brand: brand.trim(),
        category: category.toLowerCase().trim(),
        price: parsedPrice,
        salePrice: salePrice === undefined || salePrice === null || salePrice === '' ? null : Number(salePrice),
        compareAtPrice: compareAtPrice === undefined || compareAtPrice === null || compareAtPrice === '' ? null : Number(compareAtPrice),
        priceDetails: priceDetails || '',
        rating: rating || 0,
        stock: parsedStock,
        availabilityStatus: availabilityStatus || (parsedStock > 0 ? 'In stock' : 'Out of stock'),
        shippingInformation: shippingInformation || '',
        weight: weight === undefined || weight === null || weight === '' ? 0 : Number(weight),
        description: description.trim(),
        images: normalizedImages,
        vendorId: currentUser.id || currentUser._id,
        vendorName: currentUser.shopName || currentUser.fullName || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      demoProducts.push(product);
      return res.status(201).json({ message: 'Product created successfully', product });
    }
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
