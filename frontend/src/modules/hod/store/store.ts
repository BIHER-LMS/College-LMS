import { configureStore } from '@reduxjs/toolkit';
import hodReducer from './slices/hodSlice';

export const store = configureStore({
  reducer: {
    hod: hodReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;