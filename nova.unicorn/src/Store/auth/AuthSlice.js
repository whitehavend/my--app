import { createSlice } from "@reduxjs/toolkit";
import { approveVendor, getCurrentUser, getPendingVendors, handleLogin, handleSignup } from "../thunk";

const initialState = {
  auth: "",
  status: "idle",
  error: "",
  notify: false,
  user: "",
  pendingVendors: [],
  pendingStatus: "idle",
};

const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetNotify: (state) => {
      state.notify = false;
    },
    logout: (state) => {
      state.auth = "";
      state.status = "idle";
      state.error = "";
      state.notify = false;
      state.user = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(handleLogin.pending, (state) => {
        state.status = "loading";
        state.error = "nil";
      })
      .addCase(handleLogin.fulfilled, (state, action) => {
        const user = action.payload?.user || {};
        state.status = "success";
        state.auth = action.payload?.message || "User logged in successfully";
        state.error = "nil";
        state.notify = true;
        state.user = {
          uid: user.id || user.uid,
          email: user.email,
          displayName: user.fullName || user.displayName,
          role: user.role || "customer",
          shopName: user.shopName || "",
          isApproved: user.isApproved ?? true,
          accessToken: action.payload?.token || user.accessToken || "",
        };
      })
      .addCase(handleLogin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to log in, Please try again later";
      })

      .addCase(handleSignup.pending, (state) => {
        state.status = "loading";
        state.error = "nil";
      })
      .addCase(handleSignup.fulfilled, (state, action) => {
        const user = action.payload?.user || {};
        state.status = "success";
        state.auth = action.payload?.message || "User signed up successfully";
        state.error = "nil";
        state.notify = true;
        state.user = {
          uid: user.id || user.uid,
          email: user.email,
          displayName: user.fullName || user.displayName,
          role: user.role || "customer",
          shopName: user.shopName || "",
          isApproved: user.isApproved ?? true,
          accessToken: action.payload?.token || user.accessToken || "",
        };
      })
      .addCase(handleSignup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to sign up, Please try again later";
      })

      .addCase(getCurrentUser.fulfilled, (state, action) => {
        const user = action.payload?.user || {};
        state.user = {
          uid: user.id || user.uid,
          email: user.email,
          displayName: user.fullName || user.displayName,
          role: user.role || "customer",
          shopName: user.shopName || "",
          isApproved: user.isApproved ?? true,
          accessToken: action.payload?.token || "",
        };
        state.status = "success";
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.user = "";
        state.status = "idle";
      })

      .addCase(getPendingVendors.pending, (state) => {
        state.pendingStatus = "loading";
        state.error = "nil";
      })
      .addCase(getPendingVendors.fulfilled, (state, action) => {
        state.pendingStatus = "success";
        state.pendingVendors = action.payload?.vendors || [];
        state.error = "nil";
      })
      .addCase(getPendingVendors.rejected, (state, action) => {
        state.pendingStatus = "failed";
        state.error = action.payload || "Unable to load pending vendors";
      })

      .addCase(approveVendor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(approveVendor.fulfilled, (state, action) => {
        const approvedVendor = action.payload?.user || {};
        const approvedId = approvedVendor.id || approvedVendor._id;

        state.status = "success";
        state.auth = action.payload?.message || "Vendor approved successfully";
        state.notify = true;
        state.pendingVendors = state.pendingVendors.filter(
          (vendor) => (vendor.id || vendor._id) !== approvedId
        );

        if (state.user && (state.user.uid === approvedId)) {
          state.user.isApproved = true;
        }
      })
      .addCase(approveVendor.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to approve vendor";
      });
  },
});

export const { resetNotify, logout } = AuthSlice.actions;
export default AuthSlice.reducer;
