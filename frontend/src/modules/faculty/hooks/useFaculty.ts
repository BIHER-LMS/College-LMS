import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../store';
import {
  fetchFacultyDashboard,
  fetchFacultyProfile,
  updateFacultyProfile,
  fetchAssignedClasses,
  fetchClassDetails,
  fetchClassStudents,
  fetchDepartment,
  fetchSubjects,
  fetchAcademicInfo,
  clearError,
} from '../slices/facultySlice';
import type { FacultyProfileUpdateInput } from '../types/faculty.types';

export const useFaculty = () => {
  const dispatch = useDispatch<AppDispatch>();
  const facultyState = useSelector((state: RootState) => state.faculty);

  return {
    ...facultyState,
    loadDashboard: (force: boolean = false) => {
      if (force || !facultyState.dashboard) {
        dispatch(fetchFacultyDashboard());
      }
    },
    loadProfile: (force: boolean = false) => {
      if (force || !facultyState.profile) {
        dispatch(fetchFacultyProfile());
      }
    },
    saveProfile: (data: FacultyProfileUpdateInput) => dispatch(updateFacultyProfile(data)),
    loadClasses: (force: boolean = false) => {
      if (force || facultyState.classes.length === 0) {
        dispatch(fetchAssignedClasses());
      }
    },
    loadClassDetails: (classId: string) => dispatch(fetchClassDetails(classId)),
    loadClassStudents: (classId: string) => dispatch(fetchClassStudents(classId)),
    loadDepartment: (force: boolean = false) => {
      if (force || !facultyState.department) {
        dispatch(fetchDepartment());
      }
    },
    loadSubjects: (semester?: number) => dispatch(fetchSubjects(semester)),
    loadAcademicInfo: (force: boolean = false) => {
      if (force || facultyState.academicYears.length === 0) {
        dispatch(fetchAcademicInfo());
      }
    },
    resetError: () => dispatch(clearError()),
  };
};
