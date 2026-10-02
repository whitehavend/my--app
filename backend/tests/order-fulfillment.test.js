const test = require('node:test');
const assert = require('node:assert/strict');
const { canVendorFulfillOrder, FULFILLMENT_DELAY_MS } = require('../services/orderFulfillmentService');

test('vendor fulfillment requires collection officer acceptance', () => {
  const order = { status: 'pending', createdAt: new Date(Date.now() - FULFILLMENT_DELAY_MS - 1000) };
  assert.equal(canVendorFulfillOrder(order), false);
  assert.equal(canVendorFulfillOrder({ ...order, collectionOfficerAcceptedAt: new Date() }), true);
});

test('vendor fulfillment remains blocked until the delay expires or order leaves pending', () => {
  const createdAt = new Date('2026-10-02T10:00:00.000Z');
  const acceptedOrder = { status: 'pending', createdAt, collectionOfficerAcceptedAt: createdAt };
  assert.equal(canVendorFulfillOrder(acceptedOrder, createdAt.getTime() + FULFILLMENT_DELAY_MS - 1), false);
  assert.equal(canVendorFulfillOrder(acceptedOrder, createdAt.getTime() + FULFILLMENT_DELAY_MS), true);
  assert.equal(canVendorFulfillOrder({ ...acceptedOrder, status: 'delivering' }, createdAt.getTime() + FULFILLMENT_DELAY_MS), false);
});