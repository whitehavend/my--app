const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getRequiredVerificationChecks,
  validateVendorPreAccountRequirements,
} = require('../src/utils/vendorCompliance');

test('real estate and car dealership require only KYC before creation', () => {
  assert.deepEqual(getRequiredVerificationChecks('realestate'), ['kyc']);
  assert.deepEqual(getRequiredVerificationChecks('cardealer'), ['kyc']);

  assert.doesNotThrow(() => validateVendorPreAccountRequirements('realestate', {
    kycVerified: true,
  }));

  assert.throws(() => validateVendorPreAccountRequirements('realestate', {
    kycVerified: false,
  }), /KYC verification/i);
});

test('pharmacy and agrovet require full compliance before creation', () => {
  assert.deepEqual(getRequiredVerificationChecks('pharmacy'), [
    'kyc',
    'kra',
    'financialGateway',
    'professionalLicense',
    'premisesLicense',
    'financialSettlement',
  ]);

  assert.doesNotThrow(() => validateVendorPreAccountRequirements('pharmacy', {
    kycVerified: true,
    kraVerified: true,
    financialGatewayVerified: true,
    professionalLicenseVerified: true,
    premisesLicenseVerified: true,
    settlementInfo: {
      payoutMethod: 'bank',
      accountHolderName: 'Test Pharmacy',
      accountNumber: '1234567890',
      bankName: 'KCB',
      currency: 'KES',
    },
  }));

  assert.throws(() => validateVendorPreAccountRequirements('agrovet', {
    kycVerified: true,
    kraVerified: true,
    financialGatewayVerified: true,
    professionalLicenseVerified: true,
    premisesLicenseVerified: false,
    settlementInfo: { payoutMethod: 'bank' },
  }), /premises/i);
});

test('retail vendors require KYC, KRA and settlement info before creation', () => {
  assert.deepEqual(getRequiredVerificationChecks('retailshopvendor'), ['kyc', 'kra', 'financialSettlement']);

  assert.doesNotThrow(() => validateVendorPreAccountRequirements('retailshopvendor', {
    kycVerified: true,
    kraVerified: true,
    settlementInfo: {
      payoutMethod: 'mpesa',
      accountHolderName: 'Retail Shop',
      phoneNumber: '+254700000000',
      currency: 'KES',
    },
  }));
});

test('uber drivers can create accounts without pre-verification requirements', () => {
  assert.deepEqual(getRequiredVerificationChecks('uberdriver'), []);

  assert.doesNotThrow(() => validateVendorPreAccountRequirements('uberdriver', {
    kycVerified: false,
    settlementInfo: null,
  }));
});
