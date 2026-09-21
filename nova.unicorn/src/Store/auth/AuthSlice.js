import { createSlice } from "@reduxjs/toolkit";
import { approveVendor, getCurrentUser, getPendingVendors, handleGoogleLogin, handleLogin, handleSignup, rejectVendor, updateAccountSettings } from "../thunk";

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
          firstName: user.firstName || "",
          secondName: user.secondName || "",
          email: user.email,
          displayName: user.fullName || user.displayName,
          username: user.username || "",
          role: user.role || "customer",
          vendorType: user.vendorType || "",
          shopName: user.shopName || "",
          businessName: user.businessName || "",
          isApproved: user.isApproved ?? true,
          verificationRequired: user.verificationRequired || [],
          verificationStatus: user.verificationStatus || {},
          phoneNumber: user.phoneNumber || "",
          countryCode: user.countryCode || "",
          advertSocials: user.advertSocials || {},
          deliveryAddress: user.deliveryAddress || "",
          shopAddress: user.shopAddress || "",
          logisticAvailable: user.logisticAvailable ?? false,
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
          firstName: user.firstName || "",
          secondName: user.secondName || "",
          email: user.email,
          displayName: user.fullName || user.displayName,
          username: user.username || "",
          role: user.role || "customer",
          vendorType: user.vendorType || "",
          shopName: user.shopName || "",
          businessName: user.businessName || "",
          isApproved: user.isApproved ?? true,
          verificationRequired: user.verificationRequired || [],
          verificationStatus: user.verificationStatus || {},
          phoneNumber: user.phoneNumber || "",
          countryCode: user.countryCode || "",
          advertSocials: user.advertSocials || {},
          deliveryAddress: user.deliveryAddress || "",
          shopAddress: user.shopAddress || "",
          logisticAvailable: user.logisticAvailable ?? false,
          accessToken: action.payload?.token || user.accessToken || "",
        };
      })
      .addCase(handleSignup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to sign up, Please try again later";
      })
      .addCase(updateAccountSettings.fulfilled, (state, action) => {
        const user = action.payload?.user;
        if (user && state.user) {
          state.user = { ...state.user, ...user, uid: user.id || user.uid, displayName: user.fullName || state.user.displayName };
        }
        state.status = "success";
        state.auth = action.payload?.message || "Account settings updated successfully";
        state.error = "nil";
        state.notify = true;
      })
      .addCase(updateAccountSettings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to update account settings";
      })

      .addCase(handleGoogleLogin.pending, (state) => {
        state.status = "loading";
        state.error = "nil";
      })
      .addCase(handleGoogleLogin.fulfilled, (state, action) => {
        const user = action.payload?.user || {};
        state.status = "success";
        state.auth = action.payload?.message || "Google login successful";
        state.error = "nil";
        state.notify = true;
        state.user = {
          uid: user.id || user.uid,
          firstName: user.firstName || "",
          secondName: user.secondName || "",
          email: user.email,
          displayName: user.fullName || user.displayName,
          username: user.username || "",
          role: user.role || "customer",
          vendorType: user.vendorType || "",
          shopName: user.shopName || "",
          businessName: user.businessName || "",
          isApproved: user.isApproved ?? true,
          verificationRequired: user.verificationRequired || [],
          verificationStatus: user.verificationStatus || {},
          phoneNumber: user.phoneNumber || "",
          countryCode: user.countryCode || "",
          advertSocials: user.advertSocials || {},
          deliveryAddress: user.deliveryAddress || "",
          shopAddress: user.shopAddress || "",
          logisticAvailable: user.logisticAvailable ?? false,
          accessToken: action.payload?.token || "",
        };
      })
      .addCase(handleGoogleLogin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to log in with Google";
      })

      .addCase(getCurrentUser.fulfilled, (state, action) => {
        const user = action.payload?.user || {};
        state.user = {
          uid: user.id || user.uid,
          firstName: user.firstName || "",
          secondName: user.secondName || "",
          email: user.email,
          displayName: user.fullName || user.displayName,
          username: user.username || "",
          role: user.role || "customer",
          vendorType: user.vendorType || "",
          shopName: user.shopName || "",
          businessName: user.businessName || "",
          isApproved: user.isApproved ?? true,
          verificationRequired: user.verificationRequired || [],
          verificationStatus: user.verificationStatus || {},
          phoneNumber: user.phoneNumber || "",
          countryCode: user.countryCode || "",
          advertSocials: user.advertSocials || {},
          deliveryAddress: user.deliveryAddress || "",
          shopAddress: user.shopAddress || "",
          logisticAvailable: user.logisticAvailable ?? false,
          accessToken: action.payload?.token || "",
        };
        state.status = "success";
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.status = "loading";
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
      })

      .addCase(rejectVendor.pending, (state) => {
        state.status = "loading";
      })
      .addCase(rejectVendor.fulfilled, (state, action) => {
        const rejectedVendor = action.payload?.user || {};
        const rejectedId = rejectedVendor.id || rejectedVendor._id;

        state.status = "success";
        state.auth = action.payload?.message || "Vendor rejected successfully";
        state.notify = true;
        state.pendingVendors = state.pendingVendors.filter(
          (vendor) => (vendor.id || vendor._id) !== rejectedId
        );
      })
      .addCase(rejectVendor.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to reject vendor";
      });
  },
});

export const { resetNotify, logout } = AuthSlice.actions;
export default AuthSlice.reducer;
