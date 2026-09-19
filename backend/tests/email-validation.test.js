const assert = require('node:assert/strict');
const { normalizeEmail, isValidEmail } = require('../src/utils/emailValidation');

assert.equal(normalizeEmail('  User.Name+tag@Example.com  '), 'user.name+tag@example.com');
assert.equal(isValidEmail('user.name+tag@example.com'), true);
assert.equal(isValidEmail('username@localhost'), false);
assert.equal(isValidEmail('not-an-email'), false);
assert.equal(isValidEmail('username@example'), false);

console.log('email validation tests passed');
