import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { facultyApi } from '../api/facultyApi';
import type {
  FacultyDashboardData,
  FacultyProfile,
  FacultyProfileUpdateInput,
  FacultyClassSummary,
  ClassStudentSummary,
  DepartmentInfo,
  SubjectInfo,
  AcademicYearInfo,
  SemesterInfo,
} from '../types/faculty.types';

interface FacultyState {
  dashboard: FacultyDashboardData | null;
  profile: FacultyProfile | null;
  department: DepartmentInfo | null;
  classes: FacultyClassSummary[];
  selectedClass: FacultyClassSummary | null;
  classStudents: ClassStudentSummary[];
  subjects: SubjectInfo[];
  academicYears: AcademicYearInfo[];
  semesters: SemesterInfo[];
  loading: {
    dashboard: boolean;
    profile: boolean;
    classes: boolean;
    students: boolean;
    department: boolean;
    subjects: boolean;
    academic: boolean;
    updatingProfile: boolean;
  };
  error: string | null;
}

const initialState: FacultyState = {
  dashboard: null,
  profile: null,
  department: null,
  classes: [],
  selectedClass: null,
  classStudents: [],
  subjects: [],
  academicYears: [],
  semesters: [],
  loading: {
    dashboard: false,
    profile: false,
    classes: false,
    students: false,
    department: false,
    subjects: false,
    academic: false,
    updatingProfile: false,
  },
  error: null,
};

export const fetchFacultyDashboard = createAsyncThunk(
  'faculty/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      return await facultyApi.getDashboard();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to load dashboard');
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as any;
      if (state.faculty?.loading?.dashboard) {
        return false;
      }
    },
  }
);

export const fetchFacultyProfile = createAsyncThunk(
  'faculty/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await facultyApi.getProfile();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to load profile');
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as any;
      if (state.faculty?.loading?.profile) {
        return false;
      }
    },
  }
);

export const updateFacultyProfile = createAsyncThunk(
  'faculty/updateProfile',
  async (data: FacultyProfileUpdateInput, { rejectWithValue }) => {
    try {
      return await facultyApi.updateProfile(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to update profile');
    }
  }
);

export const fetchAssignedClasses = createAsyncThunk(
  'faculty/fetchClasses',
  async (_, { rejectWithValue }) => {
    try {
      return await facultyApi.getAssignedClasses();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to load classes');
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as any;
      if (state.faculty?.loading?.classes) {
        return false;
      }
    },
  }
);

export const fetchClassDetails = createAsyncThunk(
  'faculty/fetchClassDetails',
  async (classId: string, { rejectWithValue }) => {
    try {
      return await facultyApi.getClassDetails(classId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to load class details');
    }
  }
);

export const fetchClassStudents = createAsyncThunk(
  'faculty/fetchClassStudents',
  async (classId: string, { rejectWithValue }) => {
    try {
      return await facultyApi.getClassStudents(classId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to load students');
    }
  }
);

export const fetchDepartment = createAsyncThunk(
  'faculty/fetchDepartment',
  async (_, { rejectWithValue }) => {
    try {
      return await facultyApi.getDepartment();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to load department info');
    }
  }
);

export const fetchSubjects = createAsyncThunk(
  'faculty/fetchSubjects',
  async (semester: number | undefined, { rejectWithValue }) => {
    try {
      return await facultyApi.getSubjects(semester);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to load subjects');
    }
  }
);

export const fetchAcademicInfo = createAsyncThunk(
  'faculty/fetchAcademicInfo',
  async (_, { rejectWithValue }) => {
    try {
      const [years, sems] = await Promise.all([
        facultyApi.getAcademicYears(),
        facultyApi.getSemesters(),
      ]);
      return { years, sems };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to load academic data');
    }
  }
);

export const facultySlice = createSlice({
  name: 'faculty',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedClass: (state, action: PayloadAction<FacultyClassSummary | null>) => {
      state.selectedClass = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Dashboard
    builder
      .addCase(fetchFacultyDashboard.pending, (state) => {
        if (!state.dashboard) {
          state.loading.dashboard = true;
        }
        state.error = null;
      })
      .addCase(fetchFacultyDashboard.fulfilled, (state, action) => {
        state.loading.dashboard = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchFacultyDashboard.rejected, (state, action) => {
        state.loading.dashboard = false;
        state.error = action.payload as string;
      });

    // Profile
    builder
      .addCase(fetchFacultyProfile.pending, (state) => {
        if (!state.profile) {
          state.loading.profile = true;
        }
      })
      .addCase(fetchFacultyProfile.fulfilled, (state, action) => {
        state.loading.profile = false;
        state.profile = action.payload;
      })
      .addCase(fetchFacultyProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.error = action.payload as string;
      });

    // Update Profile
    builder
      .addCase(updateFacultyProfile.pending, (state) => {
        state.loading.updatingProfile = true;
      })
      .addCase(updateFacultyProfile.fulfilled, (state, action) => {
        state.loading.updatingProfile = false;
        state.profile = action.payload;
        if (state.dashboard) {
          state.dashboard.faculty.name = action.payload.displayName || state.dashboard.faculty.name;
          state.dashboard.faculty.phone = action.payload.phone;
          state.dashboard.faculty.profilePhoto = action.payload.profilePhoto;
        }
      })
      .addCase(updateFacultyProfile.rejected, (state, action) => {
        state.loading.updatingProfile = false;
        state.error = action.payload as string;
      });

    // Classes
    builder
      .addCase(fetchAssignedClasses.pending, (state) => {
        if (state.classes.length === 0) {
          state.loading.classes = true;
        }
      })
      .addCase(fetchAssignedClasses.fulfilled, (state, action) => {
        state.loading.classes = false;
        state.classes = action.payload;
      })
      .addCase(fetchAssignedClasses.rejected, (state, action) => {
        state.loading.classes = false;
        state.error = action.payload as string;
      });

    // Class Details
    builder
      .addCase(fetchClassDetails.fulfilled, (state, action) => {
        state.selectedClass = action.payload;
      });

    // Class Students
    builder
      .addCase(fetchClassStudents.pending, (state) => {
        if (state.classStudents.length === 0) {
          state.loading.students = true;
        }
      })
      .addCase(fetchClassStudents.fulfilled, (state, action) => {
        state.loading.students = false;
        state.classStudents = action.payload;
      })
      .addCase(fetchClassStudents.rejected, (state, action) => {
        state.loading.students = false;
        state.error = action.payload as string;
      });

    // Department
    builder
      .addCase(fetchDepartment.pending, (state) => {
        if (!state.department) {
          state.loading.department = true;
        }
      })
      .addCase(fetchDepartment.fulfilled, (state, action) => {
        state.loading.department = false;
        state.department = action.payload;
      })
      .addCase(fetchDepartment.rejected, (state, action) => {
        state.loading.department = false;
        state.error = action.payload as string;
      });

    // Subjects
    builder
      .addCase(fetchSubjects.pending, (state) => {
        if (state.subjects.length === 0) {
          state.loading.subjects = true;
        }
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading.subjects = false;
        state.subjects = action.payload;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading.subjects = false;
        state.error = action.payload as string;
      });

    // Academic Info
    builder
      .addCase(fetchAcademicInfo.pending, (state) => {
        if (state.academicYears.length === 0) {
          state.loading.academic = true;
        }
      })
      .addCase(fetchAcademicInfo.fulfilled, (state, action) => {
        state.loading.academic = false;
        state.academicYears = action.payload.years;
        state.semesters = action.payload.sems;
      })
      .addCase(fetchAcademicInfo.rejected, (state, action) => {
        state.loading.academic = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedClass } = facultySlice.actions;
export default facultySlice.reducer;
