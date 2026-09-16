const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

const users = [
  {
    id: 'u1',
    fullName: 'Demo User',
    email: 'demo@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'customer',
    isApproved: true,
    shopName: '',
    phoneNumber: '',
    businessName: '',
  },
];

const getUserByEmail = async (email) => {
  if (mongoose.connection.readyState === 1) {
    return User.findOne({ email: email.toLowerCase() });
  }

  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
};

const createUserRecord = async (userData) => {
  if (mongoose.connection.readyState === 1) {
    return User.create(userData);
  }

  const newUser = {
    id: `u${Date.now()}`,
    ...userData,
  };

  users.push(newUser);
  return newUser;
};

const isMongoObjectId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id) && mongoose.connection.readyState === 1;

const getUserById = async (id) => {
  if (isMongoObjectId(id)) {
    return User.findById(id);
  }

  return users.find((user) => String(user.id || user._id) === String(id)) || null;
};

const generateToken = (user) => jwt.sign(
  {
    id: user.id || user._id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    shopName: user.shopName || '',
    isApproved: user.isApproved ?? true,
  },
  process.env.JWT_SECRET || 'dev_secret_key',
  { expiresIn: '7d' }
);

const serializeUser = (user) => ({
  id: user.id || user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  shopName: user.shopName || '',
  isApproved: user.isApproved ?? true,
  phoneNumber: user.phoneNumber || '',
  countryCode: user.countryCode || '',
  businessName: user.businessName || '',
  advertSocials: user.advertSocials ? Object.fromEntries(user.advertSocials) : {},
});

router.post('/signup', async (req, res) => {
  const {
    fullName,
    email,
    password,
    role = 'customer',
    shopName,
    phoneNumber,
    businessName,
    countryCode,
    advertSocials = {},
  } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!['customer', 'vendor', 'advert', 'logistic'].includes(role)) {
    return res.status(400).json({ error: 'Role must be customer, vendor, advert, or logistic' });
  }

  if (role === 'vendor' && (!shopName || !phoneNumber)) {
    return res.status(400).json({
      error: 'Shop name and phone number are required for vendor registration',
    });
  }

  if (role === 'advert' && (!phoneNumber || !countryCode)) {
    return res.status(400).json({
      error: 'Phone number and country code are required for Advert registration',
    });
  }

  if (role === 'logistic' && (!phoneNumber || !countryCode)) {
    return res.status(400).json({
      error: 'Phone number and country code are required for Logistic registration',
    });
  }

  if (role === 'advert' && (typeof advertSocials !== 'object' || Array.isArray(advertSocials))) {
    return res.status(400).json({ error: 'Advert social media details are invalid' });
  }

  try {
    let invalidAdvertPlatform = '';
    const normalizedAdvertSocials = Object.entries(advertSocials).reduce((socials, [platform, username]) => {
      if (typeof username !== 'string' || !username.trim()) {
        invalidAdvertPlatform = platform;
        return socials;
      }
      socials[platform] = username.trim();
      return socials;
    }, {});

    if (invalidAdvertPlatform) {
      return res.status(400).json({ error: `A username is required for ${invalidAdvertPlatform}` });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const userData = {
      fullName,
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      role,
      isApproved: role !== 'vendor',
      shopName: role === 'vendor' ? shopName : '',
      phoneNumber: role === 'customer' ? '' : phoneNumber,
      businessName: role === 'vendor' ? businessName || '' : '',
      countryCode: role === 'advert' || role === 'logistic' ? countryCode : '',
      advertSocials: role === 'advert' ? normalizedAdvertSocials : {},
    };

    const newUser = await createUserRecord(userData);

    return res.status(201).json({
      message: role === 'vendor' ? 'Vendor registration submitted successfully' : role === 'advert' ? 'Advert account created successfully' : role === 'logistic' ? 'Logistic account created successfully' : 'User created successfully',
      user: serializeUser(newUser),
      token: generateToken(newUser),
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ error: 'User already exists' });
    }

    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Unable to create user', details: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password, role = 'customer' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!['customer', 'vendor', 'advert', 'logistic'].includes(role)) {
    return res.status(400).json({ error: 'Choose a valid account type' });
  }

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== role) {
      return res.status(401).json({ error: 'The selected account type does not match this account' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({
      message: 'Login successful',
      user: serializeUser(user),
      token: generateToken(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Unable to log in' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user: serializeUser(user) });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ error: 'Unable to retrieve user' });
  }
});

router.get('/vendors/pending', async (req, res) => {
  try {
    let pendingVendors = [];

    if (mongoose.connection.readyState === 1) {
      pendingVendors = await User.find({ role: 'vendor', isApproved: false }).select('-password');
    } else {
      pendingVendors = users.filter((user) => user.role === 'vendor' && user.isApproved === false);
    }

    return res.status(200).json({
      message: 'Pending vendor list retrieved successfully',
      vendors: pendingVendors.map(serializeUser),
    });
  } catch (error) {
    console.error('List pending vendors error:', error);
    return res.status(500).json({ error: 'Unable to retrieve pending vendors' });
  }
});

router.patch('/vendors/:id/approve', async (req, res) => {
  const { id } = req.params;

  try {
    let vendor;

    if (mongoose.connection.readyState === 1) {
      vendor = await User.findById(id);
    } else {
      vendor = users.find((user) => (user.id || user._id) === id);
    }

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    if (vendor.role !== 'vendor') {
      return res.status(400).json({ error: 'User is not a vendor' });
    }

    vendor.isApproved = true;

    if (mongoose.connection.readyState === 1) {
      await vendor.save();
    }

    return res.status(200).json({
      message: 'Vendor approved successfully',
      user: serializeUser(vendor),
    });
  } catch (error) {
    console.error('Approve vendor error:', error);
    return res.status(500).json({ error: 'Unable to approve vendor', details: error.message });
  }
});

module.exports = router;
