import { createSlice } from "@reduxjs/toolkit";
import { createOrder, getUserOrders, getVendorOrders } from "../thunk";

const initialState = {
  orders: [],
  status: "idle",
  error: "",
  notify: false,
};

const OrdersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    resetOrderNotify: (state) => {
      state.notify = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.status = "success";
        state.notify = true;
        state.error = "";
        const newOrder = action.payload?.order;
        if (newOrder) {
          state.orders = [newOrder, ...state.orders];
        }
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to place order";
      })
      .addCase(getUserOrders.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.status = "success";
        state.orders = action.payload?.orders || [];
        state.error = "";
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to fetch your orders";
      })
      .addCase(getVendorOrders.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(getVendorOrders.fulfilled, (state, action) => {
        state.status = "success";
        state.orders = action.payload?.orders || [];
        state.error = "";
      })
      .addCase(getVendorOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to fetch fulfillment orders";
      });
  },
});

export const { resetOrderNotify } = OrdersSlice.actions;
export default OrdersSlice.reducer;
