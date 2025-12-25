import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RegionData } from '../../types/destination.types';
import { fetchDestinationData } from '../../api/destinationApi';

interface DestinationState {
  currentDestination: string | null;
  data: RegionData | null;
  loading: boolean;
  error: string | null;
}

const initialState: DestinationState = {
  currentDestination: null,
  data: null,
  loading: false,
  error: null
};

/**
 * Async thunk để fetch destination data
 */
export const loadDestination = createAsyncThunk(
  'destination/load',
  async (destination: string, { rejectWithValue }) => {
    try {
      const response = await fetchDestinationData(destination);
      
      if (response.success && response.data) {
        return {
          destination,
          data: response.data
        };
      } else {
        return rejectWithValue(response.error || 'Lỗi không xác định');
      }
    } catch (error) {
      return rejectWithValue('Không thể tải dữ liệu');
    }
  }
);

const destinationSlice = createSlice({
  name: 'destination',
  initialState,
  reducers: {
    // Reset state
    clearDestination: (state) => {
      state.currentDestination = null;
      state.data = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Đang load
      .addCase(loadDestination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Load thành công
      .addCase(loadDestination.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDestination = action.payload.destination;
        state.data = action.payload.data;
        state.error = null;
      })
      // Load thất bại
      .addCase(loadDestination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearDestination } = destinationSlice.actions;
export default destinationSlice.reducer;