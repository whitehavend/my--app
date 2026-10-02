import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

import VendorProductUpload from './VendorProductUpload';

const createTestStore = () => configureStore({
  reducer: {
    auth: (state = {
      user: {
        role: 'vendor',
        shopName: 'Test Shop',
        vendorType: 'retailshopvendor',
      },
    }) => state,
    products: (state = {
      productStatus: 'idle',
      productError: '',
    }) => state,
  },
});

test('renders the product description field for vendor uploads', () => {
  render(
    <Provider store={createTestStore()}>
      <MemoryRouter>
        <VendorProductUpload vendorType="retailshopvendor" />
      </MemoryRouter>
    </Provider>
  );

  expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
});
