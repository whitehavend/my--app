import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import authReducer from "../Store/auth/AuthSlice";
import AdvertPage from "./AdvertPage";

test("shows the advert promo code and USD wallet balance", async () => {
  axios.get.mockResolvedValue({ data: { promoCode: "NOVA-2026", balance: 12.5, currency: "USD", commissionCount: 1 } });
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: {
          role: "advert",
          promoCode: "NOVA-2026",
        },
      },
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter>
        <AdvertPage />
      </MemoryRouter>
    </Provider>
  );

  expect(await screen.findByText("NOVA-2026")).toBeInTheDocument();
  expect(await screen.findByText("$ 12.5")).toBeInTheDocument();
});