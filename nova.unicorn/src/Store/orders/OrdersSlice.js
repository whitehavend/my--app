import { createSlice } from "@reduxjs/toolkit";
import { cancelOrder, confirmOrderArrived, createOrder, fulfillOrder, getUserOrders, getVendorOrders } from "../thunk";

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
      })
      .addCase(fulfillOrder.fulfilled, (state, action) => {
        state.status = "success";
        state.error = "";
        const updatedOrder = action.payload?.order;
        if (updatedOrder) {
          state.orders = state.orders.map((order) => order._id === updatedOrder._id ? updatedOrder : order);
        }
      })
      .addCase(fulfillOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to fulfill order";
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.status = "success";
        state.error = "";
        const updatedOrder = action.payload?.order;
        if (updatedOrder) {
          state.orders = state.orders.map((order) => order._id === updatedOrder._id ? updatedOrder : order);
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to cancel order";
      })
      .addCase(confirmOrderArrived.fulfilled, (state, action) => {
        state.status = "success";
        state.error = "";
        const updatedOrder = action.payload?.order;
        if (updatedOrder) state.orders = state.orders.map((order) => order._id === updatedOrder._id ? updatedOrder : order);
      })
      .addCase(confirmOrderArrived.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to confirm delivery";
      });
  },
});

export const { resetOrderNotify } = OrdersSlice.actions;
export default OrdersSlice.reducer;
