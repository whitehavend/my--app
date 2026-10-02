import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import VendorShopPage from "./VendorShopPage";
import authReducer from "../Store/auth/AuthSlice";
import cartReducer from "../Store/cart/CartSlice";
import productReducer from "../Store/products/ProductSlice";
import SavedItems from "./SavedItems";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const shopProduct = {
  _id: "product-1",
  title: "Market-grown coffee",
  brand: "North Star",
  category: "groceries",
  description: "Fresh coffee from the black market seller.",
  price: 12,
  currency: "USD",
  stock: 5,
  vendorId: "seller-1",
  vendorName: "North Star Market",
  vendorType: "blackmarket",
  images: [],
};

const createTestStore = () => configureStore({
  reducer: {
    auth: authReducer,
    carts: cartReducer,
    products: productReducer,
  },
  preloadedState: {
    auth: { user: { uid: "customer-1", role: "customer" }, status: "success" },
    carts: { carts: [], status: "idle", error: "", notify: false },
    products: { products: [shopProduct], status: "success", error: "nil" },
  },
});

test("customers can save a black market vendor and item, and add the item to cart", async () => {
  localStorage.clear();
  axios.get.mockResolvedValue({ data: { products: [shopProduct] } });
  const store = createTestStore();

  const { unmount } = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/shop/seller-1"]}>
        <Routes>
          <Route path="/shop/:vendorId" element={<VendorShopPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

  expect(await screen.findByText("North Star Market")).toBeInTheDocument();
  expect(screen.getByText("Black market")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Save vendor" }));
  fireEvent.click(screen.getByRole("button", { name: "Save item" }));
  fireEvent.click(screen.getByRole("button", { name: "Add to cart" }));

  await waitFor(() => expect(store.getState().carts.carts).toHaveLength(1));
  expect(JSON.parse(localStorage.getItem("nova_saved_vendors_customer-1"))).toEqual([
    { vendorId: "seller-1", vendorName: "North Star Market", vendorType: "blackmarket" },
  ]);
  expect(JSON.parse(localStorage.getItem("nova_saved_customer-1"))).toEqual(["product-1"]);

  unmount();
  render(
    <Provider store={store}>
      <MemoryRouter>
        <SavedItems />
      </MemoryRouter>
    </Provider>
  );

  expect(await screen.findByRole("link", { name: "Visit black market" })).toHaveAttribute("href", "/shop/seller-1");
});