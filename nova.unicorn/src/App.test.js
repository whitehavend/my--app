import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from './App';
import store from './Store/store';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: { products: [] } })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
  },
}));

test('renders the app shell', async () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /a market filled with unlimited opportunities/i })).toBeInTheDocument();
  });
  expect(screen.getByRole('link', { name: /saved items and cart/i })).toHaveAttribute('href', '/saved-items');
});
