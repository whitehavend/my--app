const fs = require('fs');
const path = require('path');

const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000/api/vendors';

const divider = (title) => {
  console.log(`\n\x1b[1;36m${'='.repeat(78)}\x1b[0m`);
  console.log(`\x1b[1;37m${title}\x1b[0m`);
  console.log(`\x1b[1;36m${'='.repeat(78)}\x1b[0m`);
};

const createVendorPayload = (vendorType, phonePrefix, businessName, label) => {
  const runId = Date.now().toString().slice(-6);
  return {
    vendorType,
    email: `${label}-${runId}@example.com`,
    phoneNumber: `${phonePrefix}${runId}`,
    businessName,
  };
};

const request = async (label, url, options) => {
  console.log(`\n${'-'.repeat(72)}`);
  console.log(label);
  console.log(`${options.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    let body;

    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = { raw: text };
    }

    if (!response.ok) {
      const details = body.details || body.error || body.message || body;
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(details)}`);
    }

    console.log(`SUCCESS (${response.status})`);
    return body;
  } catch (error) {
    console.error(`FAILED: ${error.message}`);
    throw error;
  }
};

const assertUploadedFile = async (label, filePath) => {
  if (!filePath) throw new Error(`${label} did not return a saved file path`);
  if (!fs.existsSync(filePath)) throw new Error(`${label} was not saved at ${filePath}`);

  const fileName = path.basename(filePath);
  const fileResponse = await fetch(`${baseUrl.replace('/api/vendors', '')}/uploads/${encodeURIComponent(fileName)}`);
  if (!fileResponse.ok) throw new Error(`${label} is not reachable from the uploads endpoint`);
  console.log(`${label} saved and publicly reachable: ${fileName}`);
};

const registerVendor = async (label, payload) => {
  const registration = await request(`${label}: Register vendor`, `${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const vendorId = registration.vendor?._id;
  if (!vendorId) throw new Error('Registration succeeded but no vendor _id was returned');
  console.log(`Created vendor _id: ${vendorId}`);
  return vendorId;
};

const runHealthAgroSuite = async () => {
  divider('SUITE A: HEALTH_AGRO - PHARMACIST / AGROVET');
  const vendorId = await registerVendor('HEALTH_AGRO', createVendorPayload('HEALTH_AGRO', '0712', 'John Doe Pharmacy', 'pharmacist'));

  const kyc = await request('HEALTH_AGRO: KYC verification', `${baseUrl}/${vendorId}/verify-kyc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idNumber: '12345678',
      idType: 'KENYA_NATIONAL_ID',
      firstName: 'John',
      lastName: 'Doe',
    }),
  });
  console.log(`KYC verification status: ${kyc.kycVerification?.status || kyc.vendor?.kycVerification?.status || 'UNKNOWN'}`);

  const financial = await request('HEALTH_AGRO: Initiate M-Pesa verification', `${baseUrl}/${vendorId}/verify-financial`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 1 }),
  });
  const checkoutId = financial.checkoutId || financial.financialGatewayVerification?.referenceId;
  console.log(`M-Pesa checkoutId: ${checkoutId || 'NOT_RETURNED'}`);

  const callback = await request('HEALTH_AGRO: Simulate Safaricom M-Pesa webhook', `${baseUrl}/mpesa-callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Body: {
        stkCallback: {
          CheckoutRequestID: checkoutId,
          ResultCode: 0,
          ResultDesc: 'The service request is processed successfully.',
        },
      },
    }),
  });
  console.log(`Financial verification status: ${callback.vendor?.financialGatewayVerification?.status || 'UNKNOWN'}`);

  const tax = await request('HEALTH_AGRO: Verify KRA tax registration', `${baseUrl}/${vendorId}/verify-tax`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kraPin: 'A123456789X' }),
  });
  console.log(`KRA verification status: ${tax.vendor?.kraPinVerification?.status || 'UNKNOWN'}`);

  const professionalForm = new FormData();
  professionalForm.append('profLicense', new Blob(['Mock Pharmacy and Poisons Board license'], { type: 'application/pdf' }), 'pharmacy-license.pdf');
  professionalForm.append('premisesDoc', new Blob(['Mock premises compliance certificate'], { type: 'image/png' }), 'premises-certificate.png');
  const professional = await request('HEALTH_AGRO: Verify professional and premises licenses', `${baseUrl}/${vendorId}/verify-professional`, {
    method: 'POST',
    body: professionalForm,
  });
  console.log(`Professional license status: ${professional.vendor?.professionalLicenseVerification?.status || 'UNKNOWN'}`);
  console.log(`Premises license status: ${professional.vendor?.premisesLicenseVerification?.status || 'UNKNOWN'}`);
  if (professional.vendor?.professionalLicenseVerification?.status !== 'VERIFIED') throw new Error('Professional license was not verified');
  if (professional.vendor?.premisesLicenseVerification?.status !== 'VERIFIED') throw new Error('Premises license was not verified');
  await assertUploadedFile('Professional license', professional.vendor.professionalLicenseVerification.filePath);
  await assertUploadedFile('Premises document', professional.vendor.premisesLicenseVerification.filePath);
};

const runRetailSuite = async () => {
  divider('SUITE B: RETAIL - STANDARD MERCHANT');
  const vendorId = await registerVendor('RETAIL', createVendorPayload('RETAIL', '0722', 'Fresh Market Retail Store', 'retail'));
  const documentsForm = new FormData();
  documentsForm.append('businessDoc', new Blob(['Mock retail business registration and trade permit'], { type: 'application/pdf' }), 'business-registration.pdf');
  const documents = await request('RETAIL: Verify business documents', `${baseUrl}/${vendorId}/verify-documents`, {
    method: 'POST',
    body: documentsForm,
  });
  console.log(`Business documentation status: ${documents.vendor?.businessDocumentation?.status || 'UNKNOWN'}`);
  if (documents.vendor?.businessDocumentation?.status !== 'VERIFIED') throw new Error('Business documentation was not verified');
  await assertUploadedFile('Business documentation', documents.vendor.businessDocumentation.filePath);
};

const runAssetDealershipSuite = async () => {
  divider('SUITE C: REAL_ESTATE_CAR - ASSET DEALERSHIP');
  const vendorId = await registerVendor('REAL_ESTATE_CAR', createVendorPayload('REAL_ESTATE_CAR', '0733', 'Summit Motors and Properties', 'asset-dealer'));
  const kyc = await request('REAL_ESTATE_CAR: KYC verification', `${baseUrl}/${vendorId}/verify-kyc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idNumber: '87654321',
      idType: 'KENYA_NATIONAL_ID',
      firstName: 'Jane',
      lastName: 'Wanjiku',
    }),
  });
  console.log(`Asset dealer KYC status: ${kyc.kycVerification?.status || kyc.vendor?.kycVerification?.status || 'UNKNOWN'}`);
};

const runSuite = async (name, suite) => {
  try {
    await suite();
    console.log(`\x1b[1;32mPASS: ${name}\x1b[0m`);
    return true;
  } catch (error) {
    console.error(`\x1b[1;31mFAIL: ${name} - ${error.message}\x1b[0m`);
    return false;
  }
};

const run = async () => {
  console.log('\x1b[1;37mVendor industry verification test harness\x1b[0m');
  console.log(`Base URL: ${baseUrl}`);

  const results = [
    await runSuite('HEALTH_AGRO', runHealthAgroSuite),
    await runSuite('RETAIL', runRetailSuite),
    await runSuite('REAL_ESTATE_CAR', runAssetDealershipSuite),
  ];

  divider('FINAL INDUSTRY SUITE RESULTS');
  console.log(`HEALTH_AGRO: ${results[0] ? 'PASS' : 'FAIL'}`);
  console.log(`RETAIL: ${results[1] ? 'PASS' : 'FAIL'}`);
  console.log(`REAL_ESTATE_CAR: ${results[2] ? 'PASS' : 'FAIL'}`);
  if (results.every(Boolean)) console.log('\x1b[1;32mALL INDUSTRY SUITES PASSED\x1b[0m');
  else throw new Error('One or more industry suites failed');
};

run().catch((error) => {
  console.error(`\n\x1b[1;31mEND-TO-END VERIFICATION FAILED: ${error.message}\x1b[0m`);
  process.exitCode = 1;
});
