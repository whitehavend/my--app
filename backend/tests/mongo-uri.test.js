const test = require('node:test');
const assert = require('node:assert/strict');
const getMongoUri = require('../src/config/mongoUri');

test('prefers MONGO_URI when both supported variables are set', () => {
  assert.equal(getMongoUri({ MONGO_URI: 'mongodb://primary', MONGODB_URI: 'mongodb://legacy' }), 'mongodb://primary');
});

test('supports MONGODB_URI when MONGO_URI is not configured', () => {
  assert.equal(getMongoUri({ MONGODB_URI: 'mongodb://legacy' }), 'mongodb://legacy');
});

test('returns an empty URI when neither variable is configured', () => {
  assert.equal(getMongoUri({}), '');
});