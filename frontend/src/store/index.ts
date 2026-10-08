import { configureStore } from '@reduxjs/toolkit';
import facultyReducer from '../modules/faculty/slices/facultySlice';
import hodReducer from '../modules/hod/store/slices/hodSlice';

import studentReducer from '../modules/student/slices/studentSlice';

export const store = configureStore({
  reducer: {
    faculty: facultyReducer,
    hod: hodReducer,
    student: studentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
