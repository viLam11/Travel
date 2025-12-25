import { configureStore } from '@reduxjs/toolkit';
import destinationReducer from './slices/destinationSlice';
import serviceDetailReducer from './slices/serviceDetailSlice';
export const store = configureStore({
  reducer: {
    destination: destinationReducer,
    serviceDetail: serviceDetailReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
