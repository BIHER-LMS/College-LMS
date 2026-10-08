import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";;
import type { DashboardData, Department, Faculty, Program, Batch, ClassItem, Student, Subject, AcademicYear, Semester, HODProfile, AttendanceSummary, CurriculumItem, AnnouncementItem, StudentAcademicAlert } from "../../types/hod.types";;
import { hodApi } from '../../api/hodApi';

interface HODState {
  dashboard: DashboardData | null;
  department: Department | null;
  faculty: Faculty[];
  selectedFaculty: Faculty | null;
  programs: Program[];
  batches: Batch[];
  classes: ClassItem[];
  selectedClass: ClassItem | null;
  students: Student[];
  subjects: Subject[];
  academicYears: AcademicYear[];
  semesters: Semester[];
  profile: HODProfile | null;
  attendanceSummary: AttendanceSummary | null;
  curriculum: CurriculumItem[];
  announcements: AnnouncementItem[];
  alerts: StudentAcademicAlert[];
  loading: boolean;
  error: string | null;
}

const initialState: HODState = {
  dashboard: null,
  department: null,
  faculty: [],
  selectedFaculty: null,
  programs: [],
  batches: [],
  classes: [],
  selectedClass: null,
  students: [],
  subjects: [],
  academicYears: [],
  semesters: [],
  profile: null,
  attendanceSummary: null,
  curriculum: [],
  announcements: [],
  alerts: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchHODDashboard = createAsyncThunk(
  'hod/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      return await hodApi.getDashboard();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch dashboard data');
    }
  }
);

export const fetchDepartment = createAsyncThunk(
  'hod/fetchDepartment',
  async (_, { rejectWithValue }) => {
    try {
      return await hodApi.getDepartment();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch department');
    }
  }
);

export const fetchFaculty = createAsyncThunk(
  'hod/fetchFaculty',
  async (
    params: { search?: string; page?: number; limit?: number } | void,
    { rejectWithValue }
  ) => {
    try {
      return await hodApi.getFaculty(params || undefined);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch faculty list');
    }
  }
);

export const fetchClasses = createAsyncThunk(
  'hod/fetchClasses',
  async (
    params: { search?: string; page?: number; limit?: number } | void,
    { rejectWithValue }
  ) => {
    try {
      return await hodApi.getClasses(params || undefined);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch classes list');
    }
  }
);

export const assignClassIncharge = createAsyncThunk(
  'hod/assignClassIncharge',
  async (
    { classId, facultyUid }: { classId: string; facultyUid: string },
    { rejectWithValue }
  ) => {
    try {
      return await hodApi.assignClassIncharge(classId, facultyUid);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to assign class incharge');
    }
  }
);

export const fetchStudents = createAsyncThunk(
  'hod/fetchStudents',
  async (
    params: { search?: string; classId?: string; page?: number; limit?: number } | void,
    { rejectWithValue }
  ) => {
    try {
      return await hodApi.getStudents(params || undefined);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch students');
    }
  }
);

export const fetchPrograms = createAsyncThunk(
  'hod/fetchPrograms',
  async (_, { rejectWithValue }) => {
    try {
      return await hodApi.getPrograms();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch programs');
    }
  }
);

export const fetchBatches = createAsyncThunk(
  'hod/fetchBatches',
  async (_, { rejectWithValue }) => {
    try {
      return await hodApi.getBatches();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch batches');
    }
  }
);

export const fetchSubjects = createAsyncThunk(
  'hod/fetchSubjects',
  async (_, { rejectWithValue }) => {
    try {
      return await hodApi.getSubjects();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch subjects');
    }
  }
);

export const fetchAcademicYears = createAsyncThunk(
  'hod/fetchAcademicYears',
  async (_, { rejectWithValue }) => {
    try {
      return await hodApi.getAcademicYears();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch academic years');
    }
  }
);

export const fetchSemesters = createAsyncThunk(
  'hod/fetchSemesters',
  async (_, { rejectWithValue }) => {
    try {
      return await hodApi.getSemesters();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch semesters');
    }
  }
);

export const fetchHODProfile = createAsyncThunk(
  'hod/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await hodApi.getProfile();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch HOD profile');
    }
  }
);

export const updateHODProfile = createAsyncThunk(
  'hod/updateProfile',
  async (data: Partial<HODProfile>, { rejectWithValue }) => {
    try {
      return await hodApi.updateProfile(data);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update HOD profile');
    }
  }
);

export const fetchAttendanceSummary = createAsyncThunk(
  'hod/fetchAttendanceSummary',
  async (_, { rejectWithValue }) => {
    try {
      return await hodApi.getAttendanceSummary();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch attendance summary');
    }
  }
);

export const fetchCurriculum = createAsyncThunk(
  'hod/fetchCurriculum',
  async (_, { rejectWithValue }) => {
    try {
      return await hodApi.getCurriculum();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch curriculum data');
    }
  }
);

export const fetchAnnouncements = createAsyncThunk(
  'hod/fetchAnnouncements',
  async (_, { rejectWithValue }) => {
    try {
      return await hodApi.getAnnouncements();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch announcements');
    }
  }
);

export const createAnnouncement = createAsyncThunk(
  'hod/createAnnouncement',
  async (
    data: { title: string; message: string; scope: string; classification: string },
    { rejectWithValue }
  ) => {
    try {
      return await hodApi.createAnnouncement(data);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create announcement');
    }
  }
);

export const fetchAcademicAlerts = createAsyncThunk(
  'hod/fetchAcademicAlerts',
  async (_, { rejectWithValue }) => {
    try {
      return await hodApi.getAcademicAlerts();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch academic alerts');
    }
  }
);

const hodSlice = createSlice({
  name: 'hod',
  initialState,
  reducers: {
    clearHODState: () => initialState,
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedClass: (state, action: PayloadAction<ClassItem | null>) => {
      state.selectedClass = action.payload;
    },
    setSelectedFaculty: (state, action: PayloadAction<Faculty | null>) => {
      state.selectedFaculty = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(fetchHODDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHODDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
        if (action.payload.department) {
          state.department = action.payload.department;
        }
      })
      .addCase(fetchHODDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch dashboard data';
      })

      // Department
      .addCase(fetchDepartment.fulfilled, (state, action) => {
        state.department = action.payload;
      })
      .addCase(fetchDepartment.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to fetch department';
      })

      // Faculty
      .addCase(fetchFaculty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFaculty.fulfilled, (state, action) => {
        state.loading = false;
        state.faculty = action.payload;
      })
      .addCase(fetchFaculty.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch faculty list';
      })

      // Classes
      .addCase(fetchClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = action.payload;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch classes list';
      })

      // Class Incharge Assignment (Immediate State Synchronization)
      .addCase(assignClassIncharge.fulfilled, (state, action) => {
        const updatedClass = action.payload;
        const index = state.classes.findIndex((c) => c.id === updatedClass.id);
        if (index !== -1) {
          state.classes[index] = updatedClass;
        }

        // Synchronize faculty items: clear previous assignment if needed, and assign new class
        state.faculty = state.faculty.map((f) => {
          if (f.uid === updatedClass.facultyUid) {
            return {
              ...f,
              isClassIncharge: true,
              assignedClassName: updatedClass.name,
            };
          } else if (f.assignedClassName === updatedClass.name) {
            return {
              ...f,
              isClassIncharge: false,
              assignedClassName: undefined,
            };
          }
          return f;
        });

        // Update dashboard statistics if present
        if (state.dashboard) {
          state.dashboard.statistics.classCount = state.classes.length;
        }
      })
      .addCase(assignClassIncharge.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to assign class incharge';
      })

      // Students
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.students = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to fetch students';
      })

      // Programs
      .addCase(fetchPrograms.fulfilled, (state, action) => {
        state.programs = action.payload;
      })
      .addCase(fetchPrograms.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to fetch programs';
      })

      // Batches
      .addCase(fetchBatches.fulfilled, (state, action) => {
        state.batches = action.payload;
      })
      .addCase(fetchBatches.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to fetch batches';
      })

      // Subjects
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.subjects = action.payload;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to fetch subjects';
      })

      // Academic Years
      .addCase(fetchAcademicYears.fulfilled, (state, action) => {
        state.academicYears = action.payload;
      })
      .addCase(fetchAcademicYears.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to fetch academic years';
      })

      // Semesters
      .addCase(fetchSemesters.fulfilled, (state, action) => {
        state.semesters = action.payload;
      })
      .addCase(fetchSemesters.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to fetch semesters';
      })

      // Profile
      .addCase(fetchHODProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(fetchHODProfile.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to fetch profile';
      })
      .addCase(updateHODProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        if (state.department && action.payload.departmentName) {
          state.department.name = action.payload.departmentName;
        }
      })
      .addCase(updateHODProfile.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to update profile';
      })

      // Attendance Summary
      .addCase(fetchAttendanceSummary.fulfilled, (state, action) => {
        state.attendanceSummary = action.payload;
      })
      .addCase(fetchAttendanceSummary.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to fetch attendance summary';
      })

      // Curriculum
      .addCase(fetchCurriculum.fulfilled, (state, action) => {
        state.curriculum = action.payload;
      })
      .addCase(fetchCurriculum.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to fetch curriculum';
      })

      // Announcements
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.announcements = action.payload;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to fetch announcements';
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.announcements.unshift(action.payload);
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to publish announcement';
      })

      // Academic Alerts
      .addCase(fetchAcademicAlerts.fulfilled, (state, action) => {
        state.alerts = action.payload;
      })
      .addCase(fetchAcademicAlerts.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to fetch academic alerts';
      });
  },
});

export const { clearHODState, setError, setSelectedClass, setSelectedFaculty } = hodSlice.actions;
export default hodSlice.reducer;