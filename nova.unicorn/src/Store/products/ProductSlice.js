import { createSlice } from "@reduxjs/toolkit";
import { getAllProducts, getProductByCategory } from "../thunk";

const initialState = {
  products: [],
  status: 'idle',
  error: '',
  productCategory: []
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
        state.products = action.payload.products;  
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
        state.productCategory = action.payload.products;  
        state.error = 'nil';
      })
      .addCase(getProductByCategory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to get products, Please try again later";  
      });
  }
});

export default ProductsSlice.reducer;
