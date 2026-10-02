import { fireEvent, render, screen } from '@testing-library/react';
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
import { categoryTaxonomy, toCategorySlug } from '../data/categoryTaxonomy';

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

test.each(Object.entries(categoryTaxonomy))('vendor subcategories for %s match the customer categories', (taxonomyVendorType, groups) => {
  const vendorType = taxonomyVendorType === 'shopvendor' ? 'retailshopvendor' : taxonomyVendorType;
  const { container } = render(
    <Provider store={createTestStore()}>
      <MemoryRouter>
        <VendorProductUpload vendorType={vendorType} />
      </MemoryRouter>
    </Provider>
  );
  const categorySelect = container.querySelector('select[name="category"]');
  const firstGroup = groups[0];

  fireEvent.change(categorySelect, { target: { value: toCategorySlug(firstGroup.title) } });

  const subcategorySelect = container.querySelector('select[name="subcategory"]');
  expect([...subcategorySelect.options].slice(1).map((option) => option.value)).toEqual(firstGroup.items);
});
