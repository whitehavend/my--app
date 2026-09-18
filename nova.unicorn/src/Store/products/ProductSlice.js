import { createSlice } from "@reduxjs/toolkit";
import { createProduct, deleteVendorProduct, getAllProducts, getProductByCategory, getVendorProducts } from "../thunk";

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
      })
      .addCase(getVendorProducts.pending, (state) => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(getVendorProducts.fulfilled, (state, action) => {
        state.status = 'success';
        state.products = action.payload?.products || [];
        state.error = '';
      })
      .addCase(getVendorProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unable to fetch uploaded products';
      })
      .addCase(deleteVendorProduct.pending, (state) => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(deleteVendorProduct.fulfilled, (state, action) => {
        state.status = 'success';
        state.error = '';
        const productId = String(action.payload?.productId || '');
        state.products = state.products.filter((product) => String(product._id || product.id) !== productId);
      })
      .addCase(deleteVendorProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unable to delete product';
      });
  }
});

export default ProductsSlice.reducer;
