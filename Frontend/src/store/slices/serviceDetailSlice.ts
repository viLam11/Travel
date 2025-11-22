import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ServiceDetail } from '../../types/serviceDetail.types';
import { serviceDetailApi } from '../../api/serviceDetailApi';

interface ServiceDetailState {
  data: ServiceDetail | null;
  loading: boolean;
  error: string | null;
}

const initialState: ServiceDetailState = {
  data: null,
  loading: false,
  error: null
};

// Async thunk to load service detail
export const loadServiceDetail = createAsyncThunk(
  'serviceDetail/load',
  async (params: { destination: string; serviceType: string; id: string }) => {
    const response = await serviceDetailApi.getServiceDetail(
      params.destination,
      params.serviceType,
      params.id
    );
    return response;
  }
);

const serviceDetailSlice = createSlice({
  name: 'serviceDetail',
  initialState,
  reducers: {
    clearServiceDetail: (state) => {
      state.data = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadServiceDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadServiceDetail.fulfilled, (state, action: PayloadAction<ServiceDetail>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(loadServiceDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load service detail';
      });
  }
});

export const { clearServiceDetail } = serviceDetailSlice.actions;
export default serviceDetailSlice.reducer;