const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

const getFirebaseAuth = () => {
  if (!getApps().length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccount) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not configured');
    }

    initializeApp({
      credential: cert(JSON.parse(serviceAccount)),
    });
  }

  return getAuth();
};

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
  username: user.username || '',
  email: user.email,
  role: user.role,
  shopName: user.shopName || '',
  isApproved: user.isApproved ?? true,
  phoneNumber: user.phoneNumber || '',
  countryCode: user.countryCode || '',
  businessName: user.businessName || '',
  deliveryAddress: user.deliveryAddress || '',
  shopAddress: user.shopAddress || '',
  advertSocials: user.advertSocials
    ? user.advertSocials instanceof Map
      ? Object.fromEntries(user.advertSocials)
      : user.advertSocials
    : {},
});

router.post('/signup', async (req, res) => {
  const {
    fullName,
    username,
    email,
    password,
    role = 'customer',
    shopName,
    phoneNumber,
    businessName,
    deliveryAddress,
    shopAddress,
    countryCode,
    advertSocials = {},
  } = req.body;

  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ error: 'Full name, username, email, and password are required' });
  }

  if (!['customer', 'vendor', 'advert', 'logistic'].includes(role)) {
    return res.status(400).json({ error: 'Role must be customer, vendor, advert, or logistic' });
  }

  if (!phoneNumber || !countryCode) {
    return res.status(400).json({
      error: 'Phone number and country code are required for registration',
    });
  }

  if (role === 'customer' && !deliveryAddress) {
    return res.status(400).json({ error: 'Delivery address is required for customer registration' });
  }

  if (role === 'vendor' && !shopAddress) {
    return res.status(400).json({ error: 'Shop address is required for vendor registration' });
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
      username: username.trim(),
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      role,
      isApproved: true,
      shopName: role === 'vendor' ? shopName : '',
      phoneNumber,
      businessName: role === 'vendor' ? businessName || '' : '',
      deliveryAddress: role === 'customer' ? deliveryAddress.trim() : '',
      shopAddress: role === 'vendor' ? shopAddress.trim() : '',
      countryCode,
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

router.post('/google', async (req, res) => {
  const { idToken, role = 'customer' } = req.body;

  console.log('Google token received:', {
    type: typeof idToken,
    length: typeof idToken === 'string' ? idToken.length : 0,
    segments: typeof idToken === 'string' ? idToken.split('.').length : 0,
  });

  if (!idToken) {
    return res.status(400).json({ error: 'Google authentication token is required' });
  }

  if (!['customer', 'vendor', 'advert', 'logistic'].includes(role)) {
    return res.status(400).json({ error: 'Choose a valid account type' });
  }

  try {
    const firebaseUser = await getFirebaseAuth().verifyIdToken(idToken);
    const email = String(firebaseUser.email || '').toLowerCase();
    if (!email || !firebaseUser.email_verified) {
      return res.status(401).json({ error: 'A verified Google account is required' });
    }

    let user = await getUserByEmail(email);

    if (user && user.role !== role) {
      return res.status(401).json({ error: 'The selected account type does not match this account' });
    }

    if (!user) {
      const fullName = firebaseUser.name || email.split('@')[0];
      user = await createUserRecord({
        fullName,
        username: email.split('@')[0],
        email,
        password: await bcrypt.hash(`google:${firebaseUser.uid}`, 10),
        role,
        isApproved: true,
        shopName: '',
        phoneNumber: '',
        businessName: '',
        deliveryAddress: '',
        shopAddress: '',
        countryCode: '',
        advertSocials: {},
      });
    }

    return res.status(200).json({
      message: 'Google login successful',
      user: serializeUser(user),
      token: generateToken(user),
    });
  } catch (error) {
    console.error('Google login error:', error);
    if (error.message === 'FIREBASE_SERVICE_ACCOUNT_JSON is not configured') {
      return res.status(503).json({ error: 'Google login is not configured on the server' });
    }
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/id-token-revoked' || error.code === 'auth/argument-error') {
      return res.status(401).json({ error: 'Google authentication token is invalid or expired' });
    }
    return res.status(500).json({ error: 'Unable to log in with Google' });
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

router.delete('/me', authMiddleware, async (req, res) => {
  try {
    if (!isMongoObjectId(req.user.id)) {
      const userIndex = users.findIndex((user) => String(user.id || user._id) === String(req.user.id));
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
      }
      users.splice(userIndex, 1);
      return res.status(200).json({ message: 'Account deleted successfully' });
    }

    const deletedUser = await User.findByIdAndDelete(req.user.id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({ error: 'Unable to delete account' });
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
