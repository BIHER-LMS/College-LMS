import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { studentApi } from '../api/studentApi';
import type {
  StudentDashboardData,
  StudentProfile,
  StudentUpdateProfileDTO,
  ClassInfo,
  BatchInfo,
  ProgramInfo,
  DepartmentInfo,
  SubjectInfo,
  ClassInchargeInfo,
  AcademicYearInfo,
  SemesterInfo,
  ClassTimetableSlot,
  StudentAttendanceResponse,
} from '../types/student.types';

interface StudentState {
  dashboard: StudentDashboardData | null;
  profile: StudentProfile | null;
  classData: ClassInfo | null;
  batchData: BatchInfo | null;
  programData: ProgramInfo | null;
  departmentData: DepartmentInfo | null;
  subjects: SubjectInfo[];
  classIncharge: ClassInchargeInfo | null;
  academicYears: AcademicYearInfo[];
  semesters: SemesterInfo[];
  timetable: ClassTimetableSlot[];
  attendance: StudentAttendanceResponse | null;
  loading: {
    dashboard: boolean;
    profile: boolean;
    updateProfile: boolean;
    class: boolean;
    batch: boolean;
    program: boolean;
    department: boolean;
    subjects: boolean;
    classIncharge: boolean;
    calendar: boolean;
    timetable: boolean;
    attendance: boolean;
  };
  errors: {
    dashboard: string | null;
    profile: string | null;
    updateProfile: string | null;
    class: string | null;
    batch: string | null;
    program: string | null;
    department: string | null;
    subjects: string | null;
    classIncharge: string | null;
    calendar: string | null;
    timetable: string | null;
    attendance: string | null;
  };
  successMessage: string | null;
}

const initialState: StudentState = {
  dashboard: null,
  profile: null,
  classData: null,
  batchData: null,
  programData: null,
  departmentData: null,
  subjects: [],
  classIncharge: null,
  academicYears: [],
  semesters: [],
  timetable: [],
  attendance: null,
  loading: {
    dashboard: false,
    profile: false,
    updateProfile: false,
    class: false,
    batch: false,
    program: false,
    department: false,
    subjects: false,
    classIncharge: false,
    calendar: false,
    timetable: false,
    attendance: false,
  },
  errors: {
    dashboard: null,
    profile: null,
    updateProfile: null,
    class: null,
    batch: null,
    program: null,
    department: null,
    subjects: null,
    classIncharge: null,
    calendar: null,
    timetable: null,
    attendance: null,
  },
  successMessage: null,
};

// Async Thunks
export const fetchDashboard = createAsyncThunk(
  'student/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      return await studentApi.getDashboard();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to load student dashboard');
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as any;
      if (state.student?.loading?.dashboard) {
        return false;
      }
    },
  }
);

export const fetchProfile = createAsyncThunk(
  'student/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await studentApi.getProfile();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to load profile');
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as any;
      if (state.student?.loading?.profile) {
        return false;
      }
    },
  }
);

export const updateProfile = createAsyncThunk(
  'student/updateProfile',
  async (dto: StudentUpdateProfileDTO, { rejectWithValue }) => {
    try {
      return await studentApi.updateProfile(dto);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update profile');
    }
  }
);

export const fetchClass = createAsyncThunk('student/fetchClass', async (_, { rejectWithValue }) => {
  try {
    return await studentApi.getClass();
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to load class information');
  }
});

export const fetchBatch = createAsyncThunk('student/fetchBatch', async (_, { rejectWithValue }) => {
  try {
    return await studentApi.getBatch();
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to load batch information');
  }
});

export const fetchProgram = createAsyncThunk('student/fetchProgram', async (_, { rejectWithValue }) => {
  try {
    return await studentApi.getProgram();
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to load program information');
  }
});

export const fetchDepartment = createAsyncThunk('student/fetchDepartment', async (_, { rejectWithValue }) => {
  try {
    return await studentApi.getDepartment();
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to load department information');
  }
});

export const fetchSubjects = createAsyncThunk(
  'student/fetchSubjects',
  async (semesterNumber: number | undefined, { rejectWithValue }) => {
    try {
      return await studentApi.getSubjects(semesterNumber);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to load subjects');
    }
  }
);

export const fetchClassIncharge = createAsyncThunk('student/fetchClassIncharge', async (_, { rejectWithValue }) => {
  try {
    return await studentApi.getClassIncharge();
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to load Class Incharge details');
  }
});

export const fetchAcademicCalendar = createAsyncThunk('student/fetchAcademicCalendar', async (_, { rejectWithValue }) => {
  try {
    const [years, semesters] = await Promise.all([
      studentApi.getAcademicYears(),
      studentApi.getSemesters(),
    ]);
    return { years, semesters };
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to load academic calendar');
  }
});

export const fetchTimetable = createAsyncThunk('student/fetchTimetable', async (_, { rejectWithValue }) => {
  try {
    return await studentApi.getTimetable();
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to load class timetable');
  }
});

export const fetchAttendance = createAsyncThunk(
  'student/fetchAttendance',
  async (date: string | undefined, { rejectWithValue }) => {
    try {
      return await studentApi.getAttendance(date);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to load attendance');
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as any;
      if (state.student?.loading?.attendance) {
        return false;
      }
    },
  }
);

export const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearError: (state, action: PayloadAction<keyof StudentState['errors']>) => {
      state.errors[action.payload] = null;
    },
  },
  extraReducers: (builder) => {
    // Dashboard
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading.dashboard = true;
        state.errors.dashboard = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action: PayloadAction<StudentDashboardData>) => {
        state.loading.dashboard = false;
        state.dashboard = action.payload;
        state.profile = action.payload.student;
        state.classData = action.payload.class;
        state.batchData = action.payload.batch;
        state.programData = action.payload.program;
        state.departmentData = action.payload.department;
        state.classIncharge = action.payload.classIncharge;
        state.subjects = action.payload.subjects;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading.dashboard = false;
        state.errors.dashboard = action.payload as string;
      });

    // Profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading.profile = true;
        state.errors.profile = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<StudentProfile>) => {
        state.loading.profile = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.errors.profile = action.payload as string;
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading.updateProfile = true;
        state.errors.updateProfile = null;
        state.successMessage = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<StudentProfile>) => {
        state.loading.updateProfile = false;
        state.profile = action.payload;
        if (state.dashboard) {
          state.dashboard.student = action.payload;
        }
        state.successMessage = 'Profile updated successfully!';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading.updateProfile = false;
        state.errors.updateProfile = action.payload as string;
      });

    // Class
    builder
      .addCase(fetchClass.pending, (state) => {
        state.loading.class = true;
        state.errors.class = null;
      })
      .addCase(fetchClass.fulfilled, (state, action: PayloadAction<ClassInfo>) => {
        state.loading.class = false;
        state.classData = action.payload;
      })
      .addCase(fetchClass.rejected, (state, action) => {
        state.loading.class = false;
        state.errors.class = action.payload as string;
      });

    // Batch
    builder
      .addCase(fetchBatch.pending, (state) => {
        state.loading.batch = true;
        state.errors.batch = null;
      })
      .addCase(fetchBatch.fulfilled, (state, action: PayloadAction<BatchInfo>) => {
        state.loading.batch = false;
        state.batchData = action.payload;
      })
      .addCase(fetchBatch.rejected, (state, action) => {
        state.loading.batch = false;
        state.errors.batch = action.payload as string;
      });

    // Program
    builder
      .addCase(fetchProgram.pending, (state) => {
        state.loading.program = true;
        state.errors.program = null;
      })
      .addCase(fetchProgram.fulfilled, (state, action: PayloadAction<ProgramInfo>) => {
        state.loading.program = false;
        state.programData = action.payload;
      })
      .addCase(fetchProgram.rejected, (state, action) => {
        state.loading.program = false;
        state.errors.program = action.payload as string;
      });

    // Department
    builder
      .addCase(fetchDepartment.pending, (state) => {
        state.loading.department = true;
        state.errors.department = null;
      })
      .addCase(fetchDepartment.fulfilled, (state, action: PayloadAction<DepartmentInfo>) => {
        state.loading.department = false;
        state.departmentData = action.payload;
      })
      .addCase(fetchDepartment.rejected, (state, action) => {
        state.loading.department = false;
        state.errors.department = action.payload as string;
      });

    // Subjects
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.loading.subjects = true;
        state.errors.subjects = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action: PayloadAction<SubjectInfo[]>) => {
        state.loading.subjects = false;
        state.subjects = action.payload;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading.subjects = false;
        state.errors.subjects = action.payload as string;
      });

    // Class Incharge
    builder
      .addCase(fetchClassIncharge.pending, (state) => {
        state.loading.classIncharge = true;
        state.errors.classIncharge = null;
      })
      .addCase(fetchClassIncharge.fulfilled, (state, action: PayloadAction<ClassInchargeInfo>) => {
        state.loading.classIncharge = false;
        state.classIncharge = action.payload;
      })
      .addCase(fetchClassIncharge.rejected, (state, action) => {
        state.loading.classIncharge = false;
        state.errors.classIncharge = action.payload as string;
      });

    // Academic Calendar
    builder
      .addCase(fetchAcademicCalendar.pending, (state) => {
        state.loading.calendar = true;
        state.errors.calendar = null;
      })
      .addCase(fetchAcademicCalendar.fulfilled, (state, action) => {
        state.loading.calendar = false;
        state.academicYears = action.payload.years;
        state.semesters = action.payload.semesters;
      })
      .addCase(fetchAcademicCalendar.rejected, (state, action) => {
        state.loading.calendar = false;
        state.errors.calendar = action.payload as string;
      });

    // Timetable
    builder
      .addCase(fetchTimetable.pending, (state) => {
        state.loading.timetable = true;
        state.errors.timetable = null;
      })
      .addCase(fetchTimetable.fulfilled, (state, action: PayloadAction<ClassTimetableSlot[]>) => {
        state.loading.timetable = false;
        state.timetable = action.payload;
      })
      .addCase(fetchTimetable.rejected, (state, action) => {
        state.loading.timetable = false;
        state.errors.timetable = action.payload as string;
      });

    // Attendance
    builder
      .addCase(fetchAttendance.pending, (state) => {
        state.loading.attendance = true;
        state.errors.attendance = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action: PayloadAction<StudentAttendanceResponse>) => {
        state.loading.attendance = false;
        state.attendance = action.payload;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading.attendance = false;
        state.errors.attendance = action.payload as string;
      });
  },
});

export const { clearSuccessMessage, clearError } = studentSlice.actions;
export default studentSlice.reducer;
