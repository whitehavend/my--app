const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const { isValidPhoneForCountry } = require('../utils/phoneValidation');

const router = express.Router();
const vendorTypes = ['retailshopvendor', 'cardealer', 'realestate', 'pharmacy', 'agrovet'];

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

const ensureSharedAccountStore = () => {
  if (!process.env.MONGO_URI) {
    throw new Error('SHARED_ACCOUNT_STORE_MISSING');
  }

  if (mongoose.connection.readyState !== 1) {
    throw new Error('SHARED_ACCOUNT_STORE_UNAVAILABLE');
  }
};

const getUserByEmail = async (email) => {
  ensureSharedAccountStore();
  return User.findOne({ email: email.toLowerCase() });
};

const createUserRecord = async (userData) => {
  ensureSharedAccountStore();
  return User.create(userData);
};

const isMongoObjectId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id) && mongoose.connection.readyState === 1;

const getUserById = async (id) => {
  if (isMongoObjectId(id)) {
    return User.findById(id);
  }

  return null;
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
  vendorType: user.vendorType || '',
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
    vendorType = '',
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

  if (!['customer', 'vendor', 'advert', 'logistic', 'blackmarket'].includes(role)) {
    return res.status(400).json({ error: 'Role must be customer, vendor, advert, logistic, or black market' });
  }

  if (role === 'vendor' && !vendorTypes.includes(vendorType)) {
    return res.status(400).json({ error: 'Choose a valid vendor type' });
  }

  if (!phoneNumber || !countryCode) {
    return res.status(400).json({
      error: 'Phone number and country code are required for registration',
    });
  }

  const normalizedPhone = String(phoneNumber).replace(/\s+/g, '').trim();
  const normalizedCountryCode = String(countryCode).trim();

  if (!isValidPhoneForCountry(normalizedCountryCode, normalizedPhone)) {
    return res.status(400).json({
      error: 'The phone number must match the selected country code',
    });
  }

  if (['customer', 'blackmarket'].includes(role) && !deliveryAddress) {
    return res.status(400).json({ error: 'Delivery address is required for this account' });
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

    try {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }
    } catch (error) {
      if (error.message === 'SHARED_ACCOUNT_STORE_MISSING' || error.message === 'SHARED_ACCOUNT_STORE_UNAVAILABLE') {
        return res.status(503).json({ error: 'Account storage is not available. Please connect the backend to MongoDB so the same account can be used across devices.' });
      }
      throw error;
    }

    const userData = {
      fullName,
      username: username.trim(),
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      role,
      vendorType: role === 'vendor' ? vendorType : '',
      isApproved: true,
      shopName: role === 'vendor' ? shopName : '',
      phoneNumber: normalizedPhone,
      businessName: role === 'vendor' ? businessName || '' : '',
      deliveryAddress: ['customer', 'blackmarket'].includes(role) ? deliveryAddress.trim() : '',
      shopAddress: role === 'vendor' ? shopAddress.trim() : '',
      countryCode: normalizedCountryCode,
      advertSocials: role === 'advert' ? normalizedAdvertSocials : {},
    };

    const newUser = await createUserRecord(userData);

    return res.status(201).json({
      message: role === 'vendor' ? 'Vendor registration submitted successfully' : role === 'advert' ? 'Advert account created successfully' : role === 'logistic' ? 'Logistic account created successfully' : role === 'blackmarket' ? 'Black market account created successfully' : 'User created successfully',
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
  const { email, password, role = '', vendorType = '' } = req.body;

  console.log('LOGIN received body:', { email, role, vendorType, hasPassword: Boolean(password) });

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    console.log('LOGIN User.findOne({ email }) result:', user ? {
      id: user._id,
      email: user.email,
      role: user.role,
      vendorType: user.vendorType,
    } : null);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    console.log('LOGIN password match result:', passwordMatches);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful',
      user: serializeUser(user),
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Unable to log in' });
  }
});

router.post('/google', async (req, res) => {
  const { idToken, role = 'customer', vendorType = '' } = req.body;

  console.log('Google token received:', {
    type: typeof idToken,
    length: typeof idToken === 'string' ? idToken.length : 0,
    segments: typeof idToken === 'string' ? idToken.split('.').length : 0,
  });

  if (!idToken) {
    return res.status(400).json({ error: 'Google authentication token is required' });
  }

  if (!['customer', 'vendor', 'advert', 'logistic', 'blackmarket'].includes(role)) {
    return res.status(400).json({ error: 'Choose a valid account type' });
  }

  if (role === 'vendor' && !vendorTypes.includes(vendorType)) {
    return res.status(400).json({ error: 'Choose a valid vendor type' });
  }

  try {
    const firebaseUser = await getFirebaseAuth().verifyIdToken(idToken);
    const email = String(firebaseUser.email || '').toLowerCase();
    if (!email || !firebaseUser.email_verified) {
      return res.status(401).json({ error: 'A verified Google account is required' });
    }

    let user;
    try {
      user = await getUserByEmail(email);
    } catch (error) {
      if (error.message === 'SHARED_ACCOUNT_STORE_MISSING' || error.message === 'SHARED_ACCOUNT_STORE_UNAVAILABLE') {
        return res.status(503).json({ error: 'Account storage is not available. Please connect the backend to MongoDB so the same account can be used across devices.' });
      }
      throw error;
    }

    if (!user) {
      const fullName = firebaseUser.name || email.split('@')[0];
      try {
        user = await createUserRecord({
          fullName,
          username: email.split('@')[0],
          email,
          password: await bcrypt.hash(`google:${firebaseUser.uid}`, 10),
          role,
          vendorType: role === 'vendor' ? vendorType : '',
          isApproved: true,
          shopName: '',
          phoneNumber: '',
          businessName: '',
          deliveryAddress: '',
          shopAddress: '',
          countryCode: '',
          advertSocials: {},
        });
      } catch (error) {
        if (error.message === 'SHARED_ACCOUNT_STORE_MISSING' || error.message === 'SHARED_ACCOUNT_STORE_UNAVAILABLE') {
          return res.status(503).json({ error: 'Account storage is not available. Please connect the backend to MongoDB so the same account can be used across devices.' });
        }
        throw error;
      }
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
