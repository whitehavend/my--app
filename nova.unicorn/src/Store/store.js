import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./products/ProductSlice";
import cartReducer from "./cart/CartSlice";
import categoriesReducer from "./categories/CategoriesSlice";
import authReducer from "./auth/AuthSlice";
import ordersReducer from "./orders/OrdersSlice";

const store = configureStore({
  reducer: {
    products: productReducer,
    carts: cartReducer,
    categories: categoriesReducer,
    auth: authReducer,
    orders: ordersReducer,
  },
});

export default store;
