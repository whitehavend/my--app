import { createSlice } from "@reduxjs/toolkit";
import { getAllCategories } from "../thunk";

const initialState = {
  categories: [],
  status: 'idle',
  error: ''
};

const CategoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllCategories.pending, (state) => {
        state.status = 'loading';
        state.error = 'nil';
      })
      .addCase(getAllCategories.fulfilled, (state, action) => {
        state.status = "success";
        state.categories = action.payload;  
        state.error = 'nil';
      })
      .addCase(getAllCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to get categories, Please try again later";  
      });
  }
});

export default CategoriesSlice.reducer;
