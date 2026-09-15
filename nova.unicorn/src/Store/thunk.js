import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const getAllProducts = createAsyncThunk(
  "getAllProducts",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/products`
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Something went wrong"
      );
    }
  }
);

export const getProductByCategory = createAsyncThunk(
  "getAllProductsByCategory",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/products/category/smartphones`
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Something went wrong"
      );
    }
  }
);

export const getAllCategories = createAsyncThunk(
  "getAllCategories",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/products/category-list`
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Something went wrong"
      );
    }
  }
);

export const handleLogin = createAsyncThunk(
  "handleLogin",
  async ({ data }, thunkAPI) => {
    const payload = data?.data ?? data;
    const { email, password } = payload || {};

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASEURL}/auth/login`,
        { email, password }
      );

      if (response.data?.token) {
        localStorage.setItem("unicorn_token", response.data.token);
      }

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || error.message || "Login failed"
      );
    }
  }
);

export const handleSignup = createAsyncThunk(
  "handleSignup",
  async ({ data }, thunkAPI) => {
    const payload = data?.data ?? data;
    const {
      fullName,
      email,
      password,
      role = "customer",
      shopName,
      phoneNumber,
      businessName,
    } = payload || {};

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASEURL}/auth/signup`,
        { fullName, email, password, role, shopName, phoneNumber, businessName }
      );

      if (response.data?.token) {
        localStorage.setItem("unicorn_token", response.data.token);
      }

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || error.message || "Signup failed"
      );
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "getCurrentUser",
  async (_, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");

    if (!token) {
      return thunkAPI.rejectWithValue("No active session");
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return { ...response.data, token };
    } catch (error) {
      localStorage.removeItem("unicorn_token");
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || error.message || "Unable to restore session"
      );
    }
  }
);

export const createProduct = createAsyncThunk(
  "createProduct",
  async (productData, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASEURL}/products`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || error.message || "Unable to create product"
      );
    }
  }
);

export const createOrder = createAsyncThunk(
  "createOrder",
  async ({ items, totalAmount, shippingAddress, paymentMethod }, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASEURL}/orders`,
        { items, totalAmount, shippingAddress, paymentMethod },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || error.message || "Unable to place order"
      );
    }
  }
);

export const getUserOrders = createAsyncThunk(
  "getUserOrders",
  async (_, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || error.message || "Unable to get orders"
      );
    }
  }
);

export const getPendingVendors = createAsyncThunk(
  "getPendingVendors",
  async (_, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASEURL}/auth/vendors/pending`,
        token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : undefined
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || error.message || "Unable to get pending vendors"
      );
    }
  }
);

export const approveVendor = createAsyncThunk(
  "approveVendor",
  async (vendorId, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BASEURL}/auth/vendors/${vendorId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || error.message || "Unable to approve vendor"
      );
    }
  }
);
