const vendorVerificationRequirements = {
  retailshopvendor: ['kyc', 'kra', 'financialSettlement'],
  realestate: ['kyc'],
  cardealer: ['kyc'],
  pharmacy: ['kyc', 'kra', 'financialGateway', 'professionalLicense', 'premisesLicense', 'financialSettlement'],
  agrovet: ['kyc', 'kra', 'financialGateway', 'professionalLicense', 'premisesLicense', 'financialSettlement'],
  uberdriver: [],
};

const normalizeVendorType = (vendorType = '') => String(vendorType).trim().toLowerCase();

const getRequiredVerificationChecks = (vendorType) => {
  const key = normalizeVendorType(vendorType);
  return vendorVerificationRequirements[key] || [];
};

const buildVerificationState = (vendorType, verificationData = {}) => {
  const required = getRequiredVerificationChecks(vendorType);
  const normalized = verificationData || {};

  const state = {
    kycVerified: Boolean(normalized.kycVerified),
    kraVerified: Boolean(normalized.kraVerified),
    financialGatewayVerified: Boolean(normalized.financialGatewayVerified),
    professionalLicenseVerified: Boolean(normalized.professionalLicenseVerified),
    premisesLicenseVerified: Boolean(normalized.premisesLicenseVerified),
    financialSettlementVerified: Boolean(normalized.financialSettlementVerified),
  };

  return required.reduce((acc, check) => {
    acc[check] = state[`${check.endsWith('License') ? 'professionalLicenseVerified' : check === 'kyc' ? 'kycVerified' : check === 'kra' ? 'kraVerified' : check === 'financialGateway' ? 'financialGatewayVerified' : check === 'premisesLicense' ? 'premisesLicenseVerified' : check === 'financialSettlement' ? 'financialSettlementVerified' : 'kycVerified'}`] || false;
    return acc;
  }, {});
};

const validateSettlementInfo = (settlementInfo = null) => {
  if (!settlementInfo) {
    throw new Error('Financial settlement info is required before account creation');
  }

  const payoutMethod = String(settlementInfo.payoutMethod || '').toLowerCase();
  if (!payoutMethod) {
    throw new Error('Financial settlement payout method is required');
  }

  const requiredFields = {
    bank: ['accountHolderName', 'accountNumber', 'bankName', 'currency'],
    mpesa: ['accountHolderName', 'phoneNumber', 'currency'],
    wallet: ['accountHolderName', 'walletId', 'currency'],
  };

  const allowedMethods = Object.keys(requiredFields);
  if (!allowedMethods.includes(payoutMethod)) {
    throw new Error('Unsupported payout method. Use bank, mpesa, or wallet');
  }

  const missing = requiredFields[payoutMethod].filter((field) => !String(settlementInfo[field] || '').trim());
  if (missing.length) {
    throw new Error(`Financial settlement info is incomplete: missing ${missing.join(', ')}`);
  }
};

const validateVendorPreAccountRequirements = (vendorType, verificationData = {}) => {
  const requiredChecks = getRequiredVerificationChecks(vendorType);
  if (!requiredChecks.length) {
    return true;
  }

  const normalized = verificationData || {};

  if (requiredChecks.includes('kyc') && !normalized.kycVerified) {
    throw new Error('KYC verification is required before account creation');
  }

  if (requiredChecks.includes('kra') && !normalized.kraVerified) {
    throw new Error('KRA verification is required before account creation');
  }

  if (requiredChecks.includes('financialGateway') && !normalized.financialGatewayVerified) {
    throw new Error('Financial gateway verification is required before account creation');
  }

  if (requiredChecks.includes('professionalLicense') && !normalized.professionalLicenseVerified) {
    throw new Error('Professional license verification is required before account creation');
  }

  if (requiredChecks.includes('premisesLicense') && !normalized.premisesLicenseVerified) {
    throw new Error('Premises license verification is required before account creation');
  }

  if (requiredChecks.includes('financialSettlement')) {
    validateSettlementInfo(normalized.settlementInfo);
  }

  return true;
};

module.exports = {
  vendorVerificationRequirements,
  getRequiredVerificationChecks,
  buildVerificationState,
  validateVendorPreAccountRequirements,
  validateSettlementInfo,
};
