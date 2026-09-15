import { createSlice } from "@reduxjs/toolkit";
import { createProduct, getAllProducts, getProductByCategory } from "../thunk";

const initialState = {
  products: [],
  status: 'idle',
  error: '',
  productCategory: [],
  productStatus: 'idle',
  productError: '',
  createdProduct: null,
};

const ProductsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllProducts.pending, (state) => {
        state.status = 'loading';
        state.error = 'nil';
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.status = "success";
        const payload = action.payload;
        state.products = Array.isArray(payload?.products)
          ? payload.products
          : Array.isArray(payload)
            ? payload
            : [];
        state.error = 'nil';
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to get products, Please try again later";  
      })
      .addCase(getProductByCategory.pending, (state) => {
        state.status = 'loading';
        state.error = 'nil';
      })
      .addCase(getProductByCategory.fulfilled, (state, action) => {
        state.status = "success";
        const payload = action.payload;
        state.productCategory = Array.isArray(payload?.products)
          ? payload.products
          : Array.isArray(payload)
            ? payload
            : [];
        state.error = 'nil';
      })
      .addCase(getProductByCategory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to get products, Please try again later";  
      })
      .addCase(createProduct.pending, (state) => {
        state.productStatus = 'loading';
        state.productError = '';
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.productStatus = 'success';
        state.productError = '';
        state.createdProduct = action.payload?.product || null;
        if (action.payload?.product) {
          state.products = [action.payload.product, ...state.products];
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.productStatus = 'failed';
        state.productError = action.payload || 'Unable to create product';
      });
  }
});

export default ProductsSlice.reducer;
