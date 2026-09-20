import { createSlice } from "@reduxjs/toolkit";
import { getAvailableLogistics, getLogisticRequests, requestLogistic, updateLogisticAvailability } from "../thunk";

const initialState = { logistics: [], requests: [], status: "idle", error: "" };

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
      .addCase(updateLogisticAvailability.rejected, (state, action) => { state.status = "failed"; state.error = action.payload || "Unable to update availability"; });
  },
});

export default LogisticsSlice.reducer;
