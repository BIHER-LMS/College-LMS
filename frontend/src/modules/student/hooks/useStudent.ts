import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../store';
import {
  fetchDashboard,
  fetchProfile,
  updateProfile,
  fetchClass,
  fetchBatch,
  fetchProgram,
  fetchDepartment,
  fetchSubjects,
  fetchClassIncharge,
  fetchAcademicCalendar,
  fetchTimetable,
  fetchAttendance,
  clearSuccessMessage,
  clearError,
} from '../slices/studentSlice';
import type { StudentUpdateProfileDTO } from '../types/student.types';
import { useCallback } from 'react';

export function useStudent() {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((root: RootState) => root.student);

  const loadDashboard = useCallback(() => {
    return dispatch(fetchDashboard());
  }, [dispatch]);

  const loadProfile = useCallback(() => {
    return dispatch(fetchProfile());
  }, [dispatch]);

  const saveProfile = useCallback(
    (dto: StudentUpdateProfileDTO) => {
      return dispatch(updateProfile(dto));
    },
    [dispatch]
  );

  const loadClass = useCallback(() => {
    return dispatch(fetchClass());
  }, [dispatch]);

  const loadBatch = useCallback(() => {
    return dispatch(fetchBatch());
  }, [dispatch]);

  const loadProgram = useCallback(() => {
    return dispatch(fetchProgram());
  }, [dispatch]);

  const loadDepartment = useCallback(() => {
    return dispatch(fetchDepartment());
  }, [dispatch]);

  const loadSubjects = useCallback(
    (semesterNumber?: number) => {
      return dispatch(fetchSubjects(semesterNumber));
    },
    [dispatch]
  );

  const loadClassIncharge = useCallback(() => {
    return dispatch(fetchClassIncharge());
  }, [dispatch]);

  const loadAcademicCalendar = useCallback(() => {
    return dispatch(fetchAcademicCalendar());
  }, [dispatch]);

  const loadTimetable = useCallback(() => {
    return dispatch(fetchTimetable());
  }, [dispatch]);

  const loadAttendance = useCallback(
    (date?: string) => {
      return dispatch(fetchAttendance(date));
    },
    [dispatch]
  );

  const dismissSuccess = useCallback(() => {
    dispatch(clearSuccessMessage());
  }, [dispatch]);

  const dismissError = useCallback(
    (key: keyof RootState['student']['errors']) => {
      dispatch(clearError(key));
    },
    [dispatch]
  );

  return {
    ...state,
    loadDashboard,
    loadProfile,
    saveProfile,
    loadClass,
    loadBatch,
    loadProgram,
    loadDepartment,
    loadSubjects,
    loadClassIncharge,
    loadAcademicCalendar,
    loadTimetable,
    loadAttendance,
    dismissSuccess,
    dismissError,
  };
}
