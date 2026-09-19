const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Product = require('../models/Product');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

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

  const rawImages = Array.isArray(images)
    ? images
    : typeof images === 'string'
      ? images.split(',')
      : [];

  const validImageUrls = rawImages
    .map((image) => (typeof image === 'string' ? image.trim() : ''))
    .filter((image) => {
      if (!image) {
        return false;
      }

      return /^https?:\/\//i.test(image) || /^\/uploads\//i.test(image) || /^data:image\//i.test(image);
    });

  return [...new Set(validImageUrls)];
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

router.get('/products/vendor/mine', authMiddleware, async (req, res) => {
  try {
    if (shouldUseDemoData()) {
      return res.status(200).json({
        products: demoProducts.filter((product) => String(product.vendorId) === String(req.user.id)).sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)),
      });
    }

    const products = await Product.find({ vendorId: String(req.user.id) }).sort({ createdAt: -1 });
    return res.status(200).json({ products });
  } catch (error) {
    console.error('Get vendor products error:', error);
    return res.status(500).json({ error: 'Unable to fetch uploaded products' });
  }
});

router.delete('/products/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (shouldUseDemoData()) {
      const productIndex = demoProducts.findIndex((product) => String(product._id) === String(id));

      if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const product = demoProducts[productIndex];
      if (String(product.vendorId) !== String(req.user.id)) {
        return res.status(403).json({ error: 'You can only delete your own uploaded products' });
      }

      demoProducts.splice(productIndex, 1);
      return res.status(200).json({ message: 'Product deleted successfully', productId: id });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (String(product.vendorId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'You can only delete your own uploaded products' });
    }

    await Product.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Product deleted successfully', productId: id });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ error: 'Unable to delete product' });
  }
});

router.post('/products', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    const {
      title,
      brand,
      category,
      price,
      salePrice,
      wholesalePrice,
      compareAtPrice,
      priceDetails,
      rating,
      stock,
      stockVolume,
      wholesaleVolume,
      availabilityStatus,
      shippingInformation,
      weight,
      description,
      images,
      vendorName,
      vendorContactInfo,
      vendorDescription,
      vendorType,
      contactInfo,
      country,
      location,
      massVolume,
    } = req.body;

    const uploadedImageFiles = Array.isArray(req.files) ? req.files : [];
    const imageListFromBody = Array.isArray(images) ? images : typeof images === 'string'
      ? images.split(',').map((image) => image.trim()).filter(Boolean)
      : [];

    const validUploadedFiles = uploadedImageFiles.filter((file) => {
      return file && file.mimetype && /^image\//i.test(file.mimetype);
    });

    if (validUploadedFiles.length > 0 && imageListFromBody.length === 0) {
      console.warn('Uploaded image files were received without a valid URL list; ignoring raw binary payloads to prevent oversized data URLs.');
    }

    const parsedImages = [...imageListFromBody];

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
      return res.status(403).json({ error: 'Only vendors can upload products' });
    }

    if (!title || !brand || !category || !description || price === undefined || stock === undefined) {
      return res.status(400).json({
        error: 'Title, brand, category, description, price, and stock are required',
      });
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    const parsedWholesalePrice = wholesalePrice === undefined || wholesalePrice === null || wholesalePrice === ''
      ? (salePrice === undefined || salePrice === null || salePrice === '' ? null : Number(salePrice))
      : Number(wholesalePrice);
    const parsedWholesaleVolume = wholesaleVolume === undefined || wholesaleVolume === null || wholesaleVolume === ''
      ? (stockVolume === undefined || stockVolume === null || stockVolume === '' ? null : Number(stockVolume))
      : Number(wholesaleVolume);
    const normalizedImages = normalizeImages(parsedImages);
    const normalizedVendorName = vendorName || currentUser?.shopName || currentUser?.fullName || 'Vendor';
    const normalizedVendorContactInfo = vendorContactInfo || contactInfo || '';
    const normalizedVendorDescription = vendorDescription || description || '';

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ error: 'Price must be a valid number greater than or equal to zero' });
    }

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ error: 'Stock must be a valid number greater than or equal to zero' });
    }

    if (parsedWholesalePrice !== null && (Number.isNaN(parsedWholesalePrice) || parsedWholesalePrice < 0)) {
      return res.status(400).json({ error: 'Wholesale price must be a valid number greater than or equal to zero' });
    }

    if (parsedWholesalePrice !== null && parsedWholesalePrice <= parsedPrice) {
      return res.status(400).json({ error: 'Wholesale price must be greater than the base price' });
    }

    if (parsedWholesaleVolume !== null && (Number.isNaN(parsedWholesaleVolume) || parsedWholesaleVolume < 0)) {
      return res.status(400).json({ error: 'Wholesale volume must be a valid number greater than or equal to zero' });
    }

    if (parsedWholesaleVolume !== null && parsedWholesaleVolume <= 5) {
      return res.status(400).json({ error: 'Wholesale volume must be greater than 5' });
    }

    try {
      if (shouldUseDemoData()) {
        const product = {
          _id: `demo_${Date.now()}`,
          title: title.trim(),
          brand: brand.trim(),
          category: category.toLowerCase().trim(),
          price: parsedPrice,
          salePrice: parsedWholesalePrice,
          wholesalePrice: parsedWholesalePrice,
          compareAtPrice: compareAtPrice === undefined || compareAtPrice === null || compareAtPrice === '' ? null : Number(compareAtPrice),
          priceDetails: priceDetails || '',
          rating: rating || 0,
          stock: parsedStock,
          wholesaleVolume: parsedWholesaleVolume,
          availabilityStatus: availabilityStatus || (parsedStock > 0 ? 'In stock' : 'Out of stock'),
          shippingInformation: shippingInformation || '',
          weight: weight === undefined || weight === null || weight === '' ? (massVolume === undefined || massVolume === null || massVolume === '' ? 0 : Number(massVolume)) : Number(weight),
          description: description.trim(),
          images: normalizedImages,
          vendorId: currentUser.id || currentUser._id,
          vendorName: normalizedVendorName,
          vendorContactInfo: normalizedVendorContactInfo,
          vendorDescription: normalizedVendorDescription,
          vendorType: vendorType || currentUser.role || '',
          country: country || '',
          location: location || '',
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
        salePrice: parsedWholesalePrice,
        wholesalePrice: parsedWholesalePrice,
        compareAtPrice: compareAtPrice === undefined || compareAtPrice === null || compareAtPrice === '' ? null : Number(compareAtPrice),
        priceDetails: priceDetails || '',
        rating: rating || 0,
        stock: parsedStock,
        wholesaleVolume: parsedWholesaleVolume,
        availabilityStatus: availabilityStatus || (parsedStock > 0 ? 'In stock' : 'Out of stock'),
        shippingInformation: shippingInformation || '',
        weight: weight === undefined || weight === null || weight === '' ? (massVolume === undefined || massVolume === null || massVolume === '' ? 0 : Number(massVolume)) : Number(weight),
        description: description.trim(),
        images: normalizedImages,
        vendorId: currentUser.id || currentUser._id,
        vendorName: normalizedVendorName,
        vendorContactInfo: normalizedVendorContactInfo,
        vendorDescription: normalizedVendorDescription,
        vendorType: vendorType || currentUser.role || '',
        country: country || '',
        location: location || '',
      });

      return res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
      const product = {
        _id: `demo_${Date.now()}`,
        title: title.trim(),
        brand: brand.trim(),
        category: category.toLowerCase().trim(),
        price: parsedPrice,
        salePrice: parsedWholesalePrice,
        wholesalePrice: parsedWholesalePrice,
        compareAtPrice: compareAtPrice === undefined || compareAtPrice === null || compareAtPrice === '' ? null : Number(compareAtPrice),
        priceDetails: priceDetails || '',
        rating: rating || 0,
        stock: parsedStock,
        wholesaleVolume: parsedWholesaleVolume,
        availabilityStatus: availabilityStatus || (parsedStock > 0 ? 'In stock' : 'Out of stock'),
        shippingInformation: shippingInformation || '',
        weight: weight === undefined || weight === null || weight === '' ? (massVolume === undefined || massVolume === null || massVolume === '' ? 0 : Number(massVolume)) : Number(weight),
        description: description.trim(),
        images: normalizedImages,
        vendorId: currentUser.id || currentUser._id,
        vendorName: normalizedVendorName,
        vendorContactInfo: normalizedVendorContactInfo,
        vendorDescription: normalizedVendorDescription,
        vendorType: vendorType || currentUser.role || '',
        country: country || '',
        location: location || '',
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
