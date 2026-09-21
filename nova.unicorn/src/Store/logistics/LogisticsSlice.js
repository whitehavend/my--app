import { createSlice } from "@reduxjs/toolkit";
import { getAvailableLogistics, getLogisticRequests, getVendorLogisticRequests, removeLogisticRequest, requestLogistic, updateLogisticAvailability, updateLogisticRequestStatus } from "../thunk";

const initialState = { logistics: [], requests: [], vendorRequests: [], status: "idle", error: "" };

const LogisticsSlice = createSlice({
  name: "logistics",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(getAvailableLogistics.pending, (state) => { state.status = "loading"; state.error = ""; })
      .addCase(getAvailableLogistics.fulfilled, (state, action) => { state.status = "success"; state.logistics = action.payload?.logistics || []; })
      .addCase(getAvailableLogistics.rejected, (state, action) => { state.status = "failed"; state.error = action.payload || "Unable to fetch available logistics"; })
      .addCase(requestLogistic.fulfilled, (state) => { state.status = "success"; state.error = ""; })
      .addCase(requestLogistic.rejected, (state, action) => { state.status = "failed"; state.error = action.payload || "Unable to request logistic"; })
      .addCase(getLogisticRequests.pending, (state) => { state.status = "loading"; state.error = ""; })
      .addCase(getLogisticRequests.fulfilled, (state, action) => { state.status = "success"; state.requests = action.payload?.requests || []; })
      .addCase(getLogisticRequests.rejected, (state, action) => { state.status = "failed"; state.error = action.payload || "Unable to fetch pickup requests"; })
      .addCase(getVendorLogisticRequests.fulfilled, (state, action) => { state.vendorRequests = action.payload?.requests || []; state.error = ""; })
      .addCase(updateLogisticRequestStatus.fulfilled, (state, action) => {
        const updatedRequest = action.payload?.request;
        if (updatedRequest) state.requests = state.requests.map((request) => request._id === updatedRequest._id ? updatedRequest : request);
        state.error = "";
      })
      .addCase(updateLogisticRequestStatus.rejected, (state, action) => { state.error = action.payload || "Unable to update pickup request"; })
      .addCase(removeLogisticRequest.fulfilled, (state, action) => { state.vendorRequests = state.vendorRequests.filter((request) => request._id !== action.payload?.requestId); })
      .addCase(updateLogisticAvailability.rejected, (state, action) => { state.status = "failed"; state.error = action.payload || "Unable to update availability"; });
  },
});

export default LogisticsSlice.reducer;
