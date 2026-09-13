import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  carts: [], 
  status: 'idle',
  error: '',
  notify: false,
};

const CartSlice = createSlice({
  name: "carts",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity } = action.payload;  
      const existingProductIndex = state.carts.findIndex(item => item.id === product.id);

      if (existingProductIndex !== -1) {
        state.carts[existingProductIndex].quantity += quantity;
      } else {
        state.carts.push({
          ...product,         
          quantity: quantity  
        });
      }

      state.status = "product added to cart successfully";
      state.error = '';
      state.notify = true;
    },
    updateCart: (state, action) => {
      const { productId, quantity } = action.payload;
      const productIndex = state.carts.findIndex(item => item.id === productId);

      if (productIndex !== -1) {
        if (quantity > 0) {
          state.carts[productIndex].quantity = quantity;
          state.status = "cart updated successfully";
          state.notify = true;
        } 
      } else {
        state.error = "Product not found in cart";
      }
    },
    deleteFromCart: (state, action) => {
      const { productId } = action.payload;
      const productIndex = state.carts.findIndex(item => item.id === productId);

      if (productIndex !== -1) {
        state.carts.splice(productIndex, 1);
        state.notify = true;
        state.status = "product removed from cart successfully";
      } else {
        state.error = "Product not found in cart";
      }
    },
    getCart: (state) => {
      state.status = "cart retrieved successfully";
      state.error = '';
    },
    clearCart: (state) => {
      state.carts = [];
      state.status = "Thanks for doing business with us! Come back soon!!";
      state.notify = true;
      state.error = '';
    },
    resetNotify: (state) => {
      state.notify = false;
    }
  }
});

export const { addToCart, updateCart, deleteFromCart, getCart, clearCart, resetNotify } = CartSlice.actions;

export default CartSlice.reducer;
