const express = require('express');
const Vendor = require('../models/vendor');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');
const { initiateMpesaStkPush, verifyIdentity } = require('../../services/verificationService');

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Administrator access is required' });
  return next();
};

router.get('/', authMiddleware, requireAdmin, (req, res) => {
  Vendor.find({}).sort({ createdAt: -1 }).lean()
    .then((vendors) => res.status(200).json({ vendors }))
    .catch((error) => res.status(500).json({ error: 'Unable to retrieve vendors', details: error.message }));
});

const getCallbackUrl = (req) => {
  const configuredBase = String(process.env.CALLBACK_URL_BASE || '').trim().replace(/\/$/, '');
  const baseUrl = configuredBase || `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/api/vendors/mpesa-callback`;
};

router.post('/mpesa-callback', async (req, res) => {
  try {
    const callback = req.body?.Body?.stkCallback || req.body?.stkCallback || req.body || {};
    const checkoutRequestId = callback.CheckoutRequestID || callback.checkoutRequestId || callback.referenceId;
    if (!checkoutRequestId) return res.status(400).json({ error: 'CheckoutRequestID is required' });

    const vendor = await Vendor.findOne({ 'financialGatewayVerification.referenceId': checkoutRequestId });
    if (!vendor) return res.status(404).json({ error: 'Vendor financial verification not found' });

    const resultCode = Number(callback.ResultCode ?? callback.resultCode);
    vendor.financialGatewayVerification.status = resultCode === 0 ? 'VERIFIED' : 'FAILED';
    vendor.financialGatewayVerification.errorMessage = resultCode === 0 ? '' : (callback.ResultDesc || callback.resultDescription || 'M-Pesa payment was not completed');
    vendor.financialGatewayVerification.updatedAt = new Date();
    await vendor.save();
    return res.status(200).json({ success: true, vendor });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to process M-Pesa callback', details: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, phoneNumber, businessName, vendorType } = req.body;
    const vendor = await Vendor.create({
      email,
      phoneNumber,
      businessName,
      vendorType,
      businessDocumentation: vendorType === 'RETAIL' ? {} : undefined,
      professionalLicenseVerification: vendorType === 'HEALTH_AGRO' ? {} : undefined,
      premisesLicenseVerification: vendorType === 'HEALTH_AGRO' ? {} : undefined,
    });

    return res.status(201).json({ vendor });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'A vendor with this email or phone number already exists' });
    return res.status(400).json({ error: error.message });
  }
});

router.post('/:id/verify-kyc', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    const result = await verifyIdentity(req.body);
    vendor.kycVerification = {
      status: 'VERIFIED',
      referenceId: result.job_id || result.user_id || result.referenceId || '',
      updatedAt: new Date(),
    };
    await vendor.save();
    return res.status(200).json({ vendor, kycVerification: vendor.kycVerification });
  } catch (error) {
    await Vendor.findByIdAndUpdate(req.params.id, {
      'kycVerification.status': 'FAILED',
      'kycVerification.errorMessage': error.response?.data?.message || error.message,
      'kycVerification.updatedAt': new Date(),
    }).catch(() => {});
    return res.status(502).json({ error: 'KYC verification failed', details: error.response?.data || error.message });
  }
});

router.post('/:id/verify-financial', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    const result = await initiateMpesaStkPush({
      phoneNumber: vendor.phoneNumber,
      amount: req.body.amount || 1,
      accountReference: vendor.businessName,
      callbackUrl: getCallbackUrl(req),
    });
    const checkoutId = result.CheckoutRequestID || result.checkoutRequestId || result.checkoutId || result.referenceId || '';
    vendor.financialGatewayVerification = {
      status: checkoutId ? 'PENDING' : 'FAILED',
      referenceId: checkoutId,
      errorMessage: checkoutId ? '' : (result.ResponseDescription || 'No checkout reference returned'),
      updatedAt: new Date(),
    };
    await vendor.save();
    return res.status(200).json({ vendor, checkoutId, financialGatewayVerification: vendor.financialGatewayVerification });
  } catch (error) {
    await Vendor.findByIdAndUpdate(req.params.id, {
      'financialGatewayVerification.status': 'FAILED',
      'financialGatewayVerification.errorMessage': error.response?.data?.errorMessage || error.message,
      'financialGatewayVerification.updatedAt': new Date(),
    }).catch(() => {});
    return res.status(502).json({ error: 'Financial verification failed', details: error.response?.data || error.message });
  }
});

router.post('/:id/verify-tax', async (req, res) => {
  try {
    const { kraPin } = req.body;
    if (!kraPin || !String(kraPin).trim()) {
      return res.status(400).json({ error: 'kraPin is required' });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    vendor.kraPinVerification = {
      status: 'VERIFIED',
      referenceId: 'MOCK_KRA_REF_12345',
      errorMessage: '',
      updatedAt: new Date(),
    };
    await vendor.save();
    return res.status(200).json({ vendor });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to verify KRA PIN', details: error.message });
  }
});

router.post('/:id/verify-professional', upload.withUploadErrors(upload.fields([
  { name: 'profLicense', maxCount: 1 },
  { name: 'premisesDoc', maxCount: 1 },
])), async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    if (vendor.vendorType !== 'HEALTH_AGRO') {
      return res.status(400).json({ error: 'Professional verification is only available for HEALTH_AGRO vendors' });
    }

    const professionalFile = req.files?.profLicense?.[0];
    const premisesFile = req.files?.premisesDoc?.[0];
    vendor.professionalLicenseVerification = {
      status: 'PENDING',
      referenceId: professionalFile?.filename || 'MOCK_PROFESSIONAL_LICENSE_REF_12345',
      errorMessage: 'Awaiting compliance team review',
      filePath: professionalFile?.path || vendor.professionalLicenseVerification?.filePath || '',
      updatedAt: new Date(),
    };
    vendor.premisesLicenseVerification = {
      status: 'PENDING',
      referenceId: premisesFile?.filename || 'MOCK_PREMISES_LICENSE_REF_12345',
      errorMessage: 'Awaiting compliance team review',
      filePath: premisesFile?.path || vendor.premisesLicenseVerification?.filePath || '',
      updatedAt: new Date(),
    };
    await vendor.save();
    return res.status(200).json({ vendor });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to verify professional and premises licenses', details: error.message });
  }
});

router.post('/:id/verify-documents', upload.withUploadErrors(upload.single('businessDoc')), async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    if (vendor.vendorType !== 'RETAIL') {
      return res.status(400).json({ error: 'Document verification is only available for RETAIL vendors' });
    }

    const businessFile = req.file;
    vendor.businessDocumentation = {
      status: 'PENDING',
      referenceId: businessFile?.filename || 'MOCK_BUSINESS_DOCUMENT_REF_12345',
      errorMessage: 'Awaiting compliance team review',
      filePath: businessFile?.path || vendor.businessDocumentation?.filePath || '',
      updatedAt: new Date(),
    };
    await vendor.save();
    return res.status(200).json({ vendor });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to verify business documents', details: error.message });
  }
});

router.patch('/:id/review', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { check, status, reason = '' } = req.body || {};
    const reviewableChecks = {
      businessDocument: 'businessDocumentation',
      professionalLicense: 'professionalLicenseVerification',
      premisesDoc: 'premisesLicenseVerification',
    };
    const field = reviewableChecks[check];

    if (!field || !['VERIFIED', 'FAILED'].includes(status)) {
      return res.status(400).json({ error: 'A valid manual check and review status are required' });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    if (!vendor[field]) return res.status(400).json({ error: 'This manual check has not been submitted' });

    vendor[field].status = status;
    vendor[field].errorMessage = status === 'FAILED' ? String(reason || 'Document was not accepted') : '';
    vendor[field].updatedAt = new Date();
    await vendor.save();

    return res.status(200).json({ vendor, review: { check, status, reason: vendor[field].errorMessage } });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to update manual review', details: error.message });
  }
});

module.exports = router;
