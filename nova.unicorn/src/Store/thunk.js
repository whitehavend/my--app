import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const isLocalRuntime = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const defaultRemoteApiBaseUrl = isLocalRuntime ? "http://localhost:5001/api" : "https://my-app-1-ggdw.onrender.com/api";
const configuredBaseUrl = process.env.REACT_APP_BASEURL || defaultRemoteApiBaseUrl;
const normalizedBaseUrl = configuredBaseUrl.replace(/\/$/, "");
const apiBaseUrl = normalizedBaseUrl;

const normalizeEmailForRequest = (value) => {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
};

export const getAllProducts = createAsyncThunk(
  "getAllProducts",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/products`
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
        `${apiBaseUrl}/products/category/smartphones`
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
        `${apiBaseUrl}/products/category-list`
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
    const { email, password, role = "customer", vendorType = "" } = payload || {};
    const normalizedEmail = normalizeEmailForRequest(email);

    try {
      const response = await axios.post(
        `${apiBaseUrl}/auth/login`,
        { email: normalizedEmail, password, role, vendorType }
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
      firstName,
      secondName,
      username,
      email,
      password,
      role = "customer",
      vendorType = "",
      shopName,
      phoneNumber,
      businessName,
      deliveryAddress,
      shopAddress,
      countryCode,
      advertSocials,
      advertUsernames,
    } = payload || {};
    const normalizedEmail = normalizeEmailForRequest(email);

    const selectedAdvertSocials = Object.entries(advertSocials || {}).reduce((socials, [platform, selected]) => {
      if (selected) {
        socials[platform] = advertUsernames?.[platform] || "";
      }
      return socials;
    }, {});

    try {
      const response = await axios.post(
        `${apiBaseUrl}/auth/signup`,
        { firstName, secondName, username, email: normalizedEmail, password, role, vendorType, shopName, phoneNumber, businessName, countryCode, advertSocials: selectedAdvertSocials, deliveryAddress, shopAddress }
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

export const handleGoogleLogin = createAsyncThunk(
  "handleGoogleLogin",
  async ({ idToken, role = "customer", vendorType = "" }, thunkAPI) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/auth/google`, { idToken, role, vendorType });

      if (response.data?.token) {
        localStorage.setItem("unicorn_token", response.data.token);
      }

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message || "Google login failed");
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
        `${apiBaseUrl}/auth/me`,
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

export const deleteAccount = createAsyncThunk(
  "deleteAccount",
  async (_, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");

    try {
      const response = await axios.delete(
        `${apiBaseUrl}/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || error.message || "Unable to delete account"
      );
    }
  }
);

export const updateAccountSettings = createAsyncThunk(
  "updateAccountSettings",
  async (settings, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");
    try {
      const response = await axios.patch(`${apiBaseUrl}/auth/me`, settings, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message || "Unable to update account settings");
    }
  }
);

export const createProduct = createAsyncThunk(
  "createProduct",
  async (productData, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");

    try {
      const response = await axios.post(
        `${apiBaseUrl}/products`,
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

export const deleteVendorProduct = createAsyncThunk(
  "deleteVendorProduct",
  async (productId, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");

    try {
      const response = await axios.delete(
        `${apiBaseUrl}/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return { ...response.data, productId };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || error.message || "Unable to delete product"
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
        `${apiBaseUrl}/orders`,
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
        `${apiBaseUrl}/orders/my-orders`,
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

export const getVendorProducts = createAsyncThunk(
  "getVendorProducts",
  async (_, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");

    try {
      const response = await axios.get(`${apiBaseUrl}/products/vendor/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message || "Unable to fetch uploaded products");
    }
  }
);

export const getVendorOrders = createAsyncThunk(
  "getVendorOrders",
  async (_, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");

    try {
      const response = await axios.get(`${apiBaseUrl}/orders/vendor`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message || "Unable to fetch fulfillment orders");
    }
  }
);

export const fulfillOrder = createAsyncThunk(
  "fulfillOrder",
  async (orderId, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");

    try {
      const response = await axios.patch(`${apiBaseUrl}/orders/${orderId}/fulfill`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message || "Unable to fulfill order");
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "cancelOrder",
  async (orderId, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");

    try {
      const response = await axios.patch(`${apiBaseUrl}/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message || "Unable to cancel order");
    }
  }
);

export const confirmOrderArrived = createAsyncThunk(
  "confirmOrderArrived",
  async (orderId, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");
    try {
      const response = await axios.patch(`${apiBaseUrl}/orders/${orderId}/arrived`, {}, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message || "Unable to confirm delivery");
    }
  }
);

export const getAvailableLogistics = createAsyncThunk(
  "getAvailableLogistics",
  async (_, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");
    try {
      const response = await axios.get(`${apiBaseUrl}/auth/logistics/available`, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message || "Unable to fetch available logistics");
    }
  }
);

export const updateLogisticAvailability = createAsyncThunk(
  "updateLogisticAvailability",
  async (available, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");
    try {
      const response = await axios.patch(`${apiBaseUrl}/auth/logistics/availability`, { available }, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message || "Unable to update availability");
    }
  }
);

export const getLogisticRequests = createAsyncThunk(
  "getLogisticRequests",
  async (_, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");
    try {
      const response = await axios.get(`${apiBaseUrl}/auth/logistics/requests`, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message || "Unable to fetch pickup requests");
    }
  }
);

export const getVendorLogisticRequests = createAsyncThunk(
  "getVendorLogisticRequests",
  async (_, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");
    try {
      const response = await axios.get(`${apiBaseUrl}/auth/logistics/vendor-requests`, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message || "Unable to fetch logistic requests");
    }
  }
);

export const requestLogistic = createAsyncThunk(
  "requestLogistic",
  async ({ logisticId, orderId }, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");
    try {
      const response = await axios.post(`${apiBaseUrl}/auth/logistics/${logisticId}/request`, { orderId }, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message || "Unable to request logistic");
    }
  }
);

export const updateLogisticRequestStatus = createAsyncThunk(
  "updateLogisticRequestStatus",
  async ({ requestId, status }, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");
    try {
      const response = await axios.patch(`${apiBaseUrl}/auth/logistics/requests/${requestId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message || "Unable to update pickup request");
    }
  }
);

export const removeLogisticRequest = createAsyncThunk(
  "removeLogisticRequest",
  async ({ logisticId, requestId }, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");
    try {
      const response = await axios.delete(`${apiBaseUrl}/auth/logistics/${logisticId}/request/${requestId}`, { headers: { Authorization: `Bearer ${token}` } });
      return { ...response.data, requestId };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error || error.message || "Unable to remove logistic");
    }
  }
);

export const getPendingVendors = createAsyncThunk(
  "getPendingVendors",
  async (_, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");

    try {
      const response = await axios.get(
        `${apiBaseUrl}/auth/vendors/pending`,
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
        `${apiBaseUrl}/auth/vendors/${vendorId}/approve`,
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

export const rejectVendor = createAsyncThunk(
  "rejectVendor",
  async ({ vendorId, reason }, thunkAPI) => {
    const token = localStorage.getItem("unicorn_token");

    try {
      const response = await axios.patch(
        `${apiBaseUrl}/auth/vendors/${vendorId}/reject`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || error.message || "Unable to reject vendor"
      );
    }
  }
);
