const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const SettlementInfo = require('../models/SettlementInfo');
const { isValidPhoneForCountry } = require('../utils/phoneValidation');
const { normalizeEmail, isValidEmail } = require('../utils/emailValidation');
const {
  getRequiredVerificationChecks,
  validateVendorPreAccountRequirements,
} = require('../utils/vendorCompliance');

const router = express.Router();
const vendorTypes = ['retailshopvendor', 'cardealer', 'realestate', 'pharmacy', 'agrovet'];

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access is required' });
  }

  return next();
};

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
  firstName: user.firstName || '',
  secondName: user.secondName || '',
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
  logisticAvailable: user.logisticAvailable ?? false,
  logisticRequests: user.logisticRequests || [],
  deliveryAddress: user.deliveryAddress || '',
  shopAddress: user.shopAddress || '',
  verificationRequired: user.verificationRequired || [],
  verificationStatus: user.verificationStatus || {},
  advertSocials: user.advertSocials
    ? user.advertSocials instanceof Map
      ? Object.fromEntries(user.advertSocials)
      : user.advertSocials
    : {},
});

router.post('/signup', async (req, res) => {
  const {
    firstName,
    secondName,
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
    verification = {},
    settlementInfo,
  } = req.body;

  const normalizedEmail = normalizeEmail(email);

  if (!firstName || !secondName || !username || !normalizedEmail || !password) {
    return res.status(400).json({ error: 'First name, second name, username, email, and password are required' });
  }

  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  if (!['customer', 'vendor', 'advert', 'logistic', 'blackmarket'].includes(role)) {
    return res.status(400).json({ error: 'This role cannot be created through public signup' });
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

  if (role === 'customer' && !deliveryAddress) {
    return res.status(400).json({ error: 'Delivery address is required for this account' });
  }

  if (role === 'vendor' && !shopAddress) {
    return res.status(400).json({ error: 'Shop address is required for vendor registration' });
  }

  if (role === 'advert' && (typeof advertSocials !== 'object' || Array.isArray(advertSocials))) {
    return res.status(400).json({ error: 'Advert social media details are invalid' });
  }

  if (role === 'vendor') {
    try {
      validateVendorPreAccountRequirements(vendorType, { ...verification, settlementInfo });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
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
      const existingUser = await getUserByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }
    } catch (error) {
      if (error.message === 'SHARED_ACCOUNT_STORE_MISSING' || error.message === 'SHARED_ACCOUNT_STORE_UNAVAILABLE') {
        return res.status(503).json({ error: 'Account storage is not available. Please connect the backend to MongoDB so the same account can be used across devices.' });
      }
      throw error;
    }

    const vendorVerificationRequired = role === 'vendor' ? getRequiredVerificationChecks(vendorType) : [];
    const settlementRecord = role === 'vendor' && settlementInfo ? await SettlementInfo.create({
      vendorType: String(vendorType).trim(),
      payoutMethod: String(settlementInfo.payoutMethod || '').trim(),
      accountHolderName: String(settlementInfo.accountHolderName || '').trim(),
      accountNumber: String(settlementInfo.accountNumber || '').trim(),
      bankName: String(settlementInfo.bankName || '').trim(),
      phoneNumber: String(settlementInfo.phoneNumber || '').trim(),
      walletId: String(settlementInfo.walletId || '').trim(),
      currency: String(settlementInfo.currency || 'KES').trim(),
    }) : null;

    const userData = {
      firstName: String(firstName).trim(),
      secondName: String(secondName).trim(),
      fullName: `${String(firstName).trim()} ${String(secondName).trim()}`,
      username: String(username).trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(String(password), 10),
      role,
      vendorType: role === 'vendor' ? String(vendorType).trim() : '',
      isApproved: role !== 'vendor',
      verificationRequired: vendorVerificationRequired,
      verificationStatus: {
        kycVerified: Boolean(role === 'vendor' ? verification?.kycVerified : false),
        kraVerified: Boolean(role === 'vendor' ? verification?.kraVerified : false),
        financialGatewayVerified: Boolean(role === 'vendor' ? verification?.financialGatewayVerified : false),
        professionalLicenseVerified: Boolean(role === 'vendor' ? verification?.professionalLicenseVerified : false),
        premisesLicenseVerified: Boolean(role === 'vendor' ? verification?.premisesLicenseVerified : false),
        financialSettlementVerified: Boolean(role === 'vendor' ? verification?.financialSettlementVerified : false),
        lastUpdated: new Date(),
      },
      settlementInfo: settlementRecord ? settlementRecord._id : null,
      shopName: role === 'vendor' ? String(shopName || '').trim() : '',
      phoneNumber: normalizedPhone,
      businessName: role === 'vendor' ? String(businessName || '').trim() : '',
      deliveryAddress: ['customer', 'blackmarket'].includes(role) ? String(deliveryAddress || '').trim() : '',
      shopAddress: role === 'vendor' ? String(shopAddress || '').trim() : '',
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
    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    const user = await User.findOne({ email: normalizedEmail });

    console.log('LOGIN User.findOne({ email }) result:', user ? {
      id: user._id,
      email: user.email,
      role: user.role,
      vendorType: user.vendorType,
    } : null);

    if (!user) {
      return res.status(404).json({ error: 'User not found. Please create an account first.' });
    }

    if (user.role === 'vendor' && user.isApproved === false) {
      return res.status(403).json({ error: 'Vendor account is still pending verification approval.' });
    }

    const passwordMatches = await bcrypt.compare(String(password), user.password);
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

router.get('/debug-users', async (req, res) => {
  try {
    const users = await User.find({}).select('email role vendorType fullName username').limit(20).lean();
    res.json({ count: users.length, users });
  } catch (error) {
    console.error('debug-users error:', error);
    res.status(500).json({ error: 'Unable to fetch users' });
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

router.patch('/me', authMiddleware, async (req, res) => {
  try {
    const allowedFields = ['firstName', 'secondName', 'username', 'phoneNumber', 'countryCode', 'deliveryAddress', 'shopAddress', 'shopName', 'businessName'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = String(req.body[field] || '').trim();
      }
    });

    if (updates.firstName !== undefined || updates.secondName !== undefined) {
      const currentUser = await getUserById(req.user.id);
      const firstName = updates.firstName ?? currentUser.firstName ?? '';
      const secondName = updates.secondName ?? currentUser.secondName ?? '';
      updates.fullName = `${firstName} ${secondName}`.trim();
    }

    if (updates.username !== undefined && !updates.username) {
      return res.status(400).json({ error: 'Username cannot be empty' });
    }

    if (req.body.password) {
      if (String(req.body.password).length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      updates.password = await bcrypt.hash(String(req.body.password), 10);
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json({ message: 'Account settings updated successfully', user: serializeUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'Username or email is already in use' });
    console.error('Update account settings error:', error);
    return res.status(500).json({ error: 'Unable to update account settings' });
  }
});

router.get('/vendors/pending', authMiddleware, requireAdmin, async (req, res) => {
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

router.patch('/vendors/:id/approve', authMiddleware, requireAdmin, async (req, res) => {
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
    vendor.verificationStatus = {
      ...(vendor.verificationStatus || {}),
      lastUpdated: new Date(),
    };

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

router.patch('/vendors/:id/reject', authMiddleware, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { reason = 'Verification documents were not accepted' } = req.body || {};

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

    vendor.isApproved = false;
    vendor.verificationStatus = {
      ...(vendor.verificationStatus || {}),
      lastUpdated: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      await vendor.save();
    }

    return res.status(200).json({
      message: 'Vendor rejected successfully',
      reason,
      user: serializeUser(vendor),
    });
  } catch (error) {
    console.error('Reject vendor error:', error);
    return res.status(500).json({ error: 'Unable to reject vendor', details: error.message });
  }
});

router.get('/logistics/available', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ error: 'Only vendors can view available logistics' });
    }

    const logistics = await User.find({ role: 'logistic', logisticAvailable: true })
      .select('fullName phoneNumber countryCode email logisticAvailable')
      .sort({ fullName: 1 });

    return res.status(200).json({ logistics: logistics.map(serializeUser) });
  } catch (error) {
    console.error('List available logistics error:', error);
    return res.status(500).json({ error: 'Unable to retrieve available logistics' });
  }
});

router.patch('/logistics/availability', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'logistic') {
      return res.status(403).json({ error: 'Only logistics can update availability' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { logisticAvailable: Boolean(req.body.available) },
      { new: true },
    );

    if (!user) return res.status(404).json({ error: 'Logistic account not found' });
    return res.status(200).json({ user: serializeUser(user) });
  } catch (error) {
    console.error('Update logistic availability error:', error);
    return res.status(500).json({ error: 'Unable to update availability' });
  }
});

router.get('/logistics/requests', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'logistic') {
      return res.status(403).json({ error: 'Only logistics can view pickup requests' });
    }

    const user = await User.findById(req.user.id).select('logisticRequests');
    return res.status(200).json({ requests: (user?.logisticRequests || []).filter((request) => request.status !== 'rejected') });
  } catch (error) {
    console.error('List logistic requests error:', error);
    return res.status(500).json({ error: 'Unable to retrieve pickup requests' });
  }
});

router.post('/logistics/:id/request', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ error: 'Only vendors can request logistics' });
    }

    const logistic = await User.findOne({ _id: req.params.id, role: 'logistic', logisticAvailable: true });
    if (!logistic) return res.status(404).json({ error: 'Available logistic not found' });

    const vendor = await User.findById(req.user.id).select('fullName shopName phoneNumber countryCode shopAddress');
    if (!vendor) return res.status(404).json({ error: 'Vendor account not found' });

    const orderId = req.body.orderId ? String(req.body.orderId) : '';
    let customerId = '';
    if (orderId) {
      const Order = require('../models/Order');
      const Product = require('../models/Product');
      const vendorProducts = await Product.find({ vendorId: String(req.user.id) }).select('_id');
      const vendorProductIds = new Set(vendorProducts.map((product) => String(product._id)));
      const order = await Order.findOne({ _id: orderId, status: { $in: ['pending', 'delivering'] } });
      if (!order || !order.items.some((item) => vendorProductIds.has(String(item.productId)))) {
        return res.status(400).json({ error: 'Select one of your active orders for pickup' });
      }
      customerId = String(order.userId);
    }

    const existingRequest = logistic.logisticRequests.find((request) => (
      String(request.vendorId) === String(req.user.id) && request.status === 'pending'
    ));
    if (existingRequest) return res.status(409).json({ error: 'This logistic has already been requested' });

    logistic.logisticRequests.push({
      orderId,
      customerId,
      vendorId: req.user.id,
      vendorFullName: vendor.fullName || '',
      vendorShopName: vendor.shopName || '',
      vendorPhoneNumber: `${vendor.countryCode || ''} ${vendor.phoneNumber || ''}`.trim(),
      vendorShopAddress: vendor.shopAddress || '',
    });
    await logistic.save();

    return res.status(201).json({ message: 'Pickup request sent successfully' });
  } catch (error) {
    console.error('Request logistic error:', error);
    return res.status(500).json({ error: 'Unable to request logistic' });
  }
});

router.get('/logistics/vendor-requests', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') return res.status(403).json({ error: 'Only vendors can view logistic requests' });

    const logistics = await User.find({ 'logisticRequests.vendorId': String(req.user.id) }).select('fullName logisticRequests');
    const requests = logistics.flatMap((logistic) => logistic.logisticRequests
      .filter((request) => String(request.vendorId) === String(req.user.id))
      .map((request) => ({ ...request.toObject(), logisticId: String(logistic._id), logisticName: logistic.fullName })));
    return res.status(200).json({ requests });
  } catch (error) {
    console.error('List vendor logistic requests error:', error);
    return res.status(500).json({ error: 'Unable to retrieve logistic requests' });
  }
});

router.patch('/logistics/requests/:requestId/status', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'logistic') return res.status(403).json({ error: 'Only logistics can update pickup requests' });
    const { status } = req.body;
    if (!['accepted', 'rejected', 'picked_up'].includes(status)) return res.status(400).json({ error: 'Invalid pickup request status' });

    const user = await User.findOne({ _id: req.user.id, 'logisticRequests._id': req.params.requestId });
    const request = user?.logisticRequests.id(req.params.requestId);
    if (!user || !request) return res.status(404).json({ error: 'Pickup request not found' });
    if (status === 'accepted' && request.status !== 'pending') return res.status(400).json({ error: 'Only pending requests can be accepted' });
    if (status === 'picked_up' && request.status !== 'accepted') return res.status(400).json({ error: 'Accept the request before marking goods picked up' });

    request.status = status;
    if (status === 'picked_up') {
      request.pickedUpAt = new Date();
      if (request.orderId) {
        const Order = require('../models/Order');
        await Order.findOneAndUpdate({ _id: request.orderId, userId: request.customerId }, { status: 'picked_up' });
      }
    }
    await user.save();
    return res.status(200).json({ request });
  } catch (error) {
    console.error('Update pickup request error:', error);
    return res.status(500).json({ error: 'Unable to update pickup request' });
  }
});

router.delete('/logistics/:id/request/:requestId', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') return res.status(403).json({ error: 'Only vendors can remove logistic requests' });
    const logistic = await User.findOne({ _id: req.params.id, 'logisticRequests._id': req.params.requestId });
    const request = logistic?.logisticRequests.id(req.params.requestId);
    if (!logistic || !request || String(request.vendorId) !== String(req.user.id)) return res.status(404).json({ error: 'Logistic request not found' });
    request.deleteOne();
    await logistic.save();
    return res.status(200).json({ message: 'Logistic removed from your pickup list' });
  } catch (error) {
    console.error('Remove logistic request error:', error);
    return res.status(500).json({ error: 'Unable to remove logistic' });
  }
});

module.exports = router;
