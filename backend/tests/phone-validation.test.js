const assert = require('node:assert/strict');
const { isValidPhoneForCountry } = require('../src/utils/phoneValidation');

assert.equal(isValidPhoneForCountry('+234', '8031234567'), true);
assert.equal(isValidPhoneForCountry('+234', '1234567890'), false);
assert.equal(isValidPhoneForCountry('+1', '4155552671'), true);
assert.equal(isValidPhoneForCountry('+44', '12345'), false);

console.log('phone validation tests passed');
