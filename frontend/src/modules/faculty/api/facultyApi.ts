import axios from 'axios';
import type {
  FacultyDashboardData,
  FacultyProfile,
  FacultyProfileUpdateInput,
  FacultyClassSummary,
  ClassStudentSummary,
  StudentDetails,
  DepartmentInfo,
  SubjectInfo,
  AcademicYearInfo,
  SemesterInfo,
  FacultySearchResults,
  AttendanceSessionDetail,
  MarkAttendanceSessionInput,
  AttendanceSessionSummary,
  ClassAttendanceStatsResponse,
  TodayRemindersSummary,
  FacultyTimetableSlot,
  FacultyReminder,
  CreateReminderInput,
  BulkStudentUploadItem,
  ClassTimetableSlot,
  FacultySubjectClassPerformance,
  ClassRepresentativeInfo,
} from '../types/faculty.types';

import { auth } from '../../../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Only a fresh token from Firebase Auth can authenticate a faculty request.
api.interceptors.request.use(async (config) => {
  await auth.authStateReady();
  if (!auth.currentUser) throw new Error('Firebase sign-in required');
  config.headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  return config;
});

export const facultyApi = {
  // Dashboard
  getDashboard: async (): Promise<FacultyDashboardData> => {
    const res = await api.get<FacultyDashboardData>('/faculty/dashboard');
    return res.data;
  },

  // Profile
  getProfile: async (): Promise<FacultyProfile> => {
    const res = await api.get<FacultyProfile>('/faculty/profile');
    return res.data;
  },

  updateProfile: async (data: FacultyProfileUpdateInput): Promise<FacultyProfile> => {
    const res = await api.patch<FacultyProfile>('/faculty/profile', data);
    return res.data;
  },

  // Department
  getDepartment: async (): Promise<DepartmentInfo> => {
    const res = await api.get<DepartmentInfo>('/faculty/department');
    return res.data;
  },

  // Classes
  getAssignedClasses: async (): Promise<FacultyClassSummary[]> => {
    const res = await api.get<FacultyClassSummary[]>('/faculty/classes');
    return res.data;
  },

  getClassDetails: async (classId: string): Promise<FacultyClassSummary> => {
    const res = await api.get<FacultyClassSummary>(`/faculty/classes/${classId}`);
    return res.data;
  },

  getClassStudents: async (classId: string): Promise<ClassStudentSummary[]> => {
    const res = await api.get<ClassStudentSummary[]>(`/faculty/classes/${classId}/students`);
    return res.data;
  },

  // Students
  getStudentDetails: async (studentId: string): Promise<StudentDetails> => {
    const res = await api.get<StudentDetails>(`/faculty/students/${studentId}`);
    return res.data;
  },

  // Subjects
  getSubjects: async (semester?: number): Promise<SubjectInfo[]> => {
    const params = semester ? { semester } : {};
    const res = await api.get<SubjectInfo[]>('/faculty/subjects', { params });
    return res.data;
  },

  // Academic
  getAcademicYears: async (): Promise<AcademicYearInfo[]> => {
    const res = await api.get<AcademicYearInfo[]>('/faculty/academic-years');
    return res.data;
  },

  getSemesters: async (): Promise<SemesterInfo[]> => {
    const res = await api.get<SemesterInfo[]>('/faculty/semesters');
    return res.data;
  },

  // Global search
  search: async (query: string): Promise<FacultySearchResults> => {
    const res = await api.get<FacultySearchResults>('/faculty/search', {
      params: { q: query },
    });
    return res.data;
  },

  // Attendance
  getAttendanceSession: async (classId: string, date: string, period: string): Promise<AttendanceSessionDetail> => {
    const res = await api.get<AttendanceSessionDetail>('/faculty/attendance/session', {
      params: { classId, date, period },
    });
    return res.data;
  },

  saveAttendanceSession: async (input: MarkAttendanceSessionInput): Promise<{ success: boolean; count: number }> => {
    const res = await api.post<{ success: boolean; count: number }>('/faculty/attendance/session', input);
    return res.data;
  },

  getClassAttendanceStats: async (classId: string): Promise<ClassAttendanceStatsResponse> => {
    const res = await api.get<ClassAttendanceStatsResponse>(`/faculty/attendance/stats/${classId}`);
    return res.data;
  },

  getClassAttendanceHistory: async (classId: string): Promise<AttendanceSessionSummary[]> => {
    const res = await api.get<AttendanceSessionSummary[]>(`/faculty/attendance/history/${classId}`);
    return res.data;
  },

  // Today's Reminders
  getTodayReminders: async (): Promise<TodayRemindersSummary> => {
    const res = await api.get<TodayRemindersSummary>('/faculty/today-reminders');
    return res.data;
  },

  // Timetable Management
  getTimetable: async (): Promise<FacultyTimetableSlot[]> => {
    const res = await api.get<FacultyTimetableSlot[]>('/faculty/timetable');
    return res.data;
  },

  saveTimetableSlot: async (slot: Partial<FacultyTimetableSlot>): Promise<FacultyTimetableSlot> => {
    const res = await api.post<FacultyTimetableSlot>('/faculty/timetable', slot);
    return res.data;
  },

  bulkSaveTimetable: async (
    slots: Partial<FacultyTimetableSlot>[],
    replaceExisting: boolean = true
  ): Promise<{ count: number; slots: FacultyTimetableSlot[] }> => {
    const res = await api.post<{ count: number; slots: FacultyTimetableSlot[] }>('/faculty/timetable/bulk', {
      slots,
      replaceExisting,
    });
    return res.data;
  },

  deleteTimetableSlot: async (slotId: string): Promise<{ success: boolean }> => {
    const res = await api.delete<{ success: boolean }>(`/faculty/timetable/${slotId}`);
    return res.data;
  },

  // Reminders Management
  getReminders: async (filter?: { type?: string; status?: string }): Promise<FacultyReminder[]> => {
    const res = await api.get<FacultyReminder[]>('/faculty/reminders', { params: filter });
    return res.data;
  },

  createReminder: async (input: CreateReminderInput): Promise<FacultyReminder> => {
    const res = await api.post<FacultyReminder>('/faculty/reminders', input);
    return res.data;
  },

  updateReminder: async (
    id: string,
    input: Partial<CreateReminderInput & { status: string }>
  ): Promise<FacultyReminder> => {
    const res = await api.put<FacultyReminder>(`/faculty/reminders/${id}`, input);
    return res.data;
  },

  toggleReminderStatus: async (id: string): Promise<FacultyReminder> => {
    const res = await api.patch<FacultyReminder>(`/faculty/reminders/${id}/status`);
    return res.data;
  },

  deleteReminder: async (id: string): Promise<{ success: boolean }> => {
    const res = await api.delete<{ success: boolean }>(`/faculty/reminders/${id}`);
    return res.data;
  },

  // Dev user list
  getDevUsers: async () => {
    const res = await api.get('/auth/users-list');
    return res.data;
  },

  // Bulk Student Upload
  bulkUploadStudents: async (
    classId: string,
    students: BulkStudentUploadItem[]
  ): Promise<{ count: number; students: any[] }> => {
    const res = await api.post<{ count: number; students: any[] }>(
      `/faculty/classes/${classId}/students/bulk`,
      { students }
    );
    return res.data;
  },

  // Manually Add a Single Student
  addStudent: async (
    classId: string,
    student: BulkStudentUploadItem
  ): Promise<any> => {
    const res = await api.post(`/faculty/classes/${classId}/students`, student);
    return res.data;
  },

  // Delete / Remove Student from Class
  deleteStudent: async (
    classId: string,
    studentUid: string
  ): Promise<{ success: boolean; message?: string }> => {
    const res = await api.delete<{ success: boolean; message?: string }>(
      `/faculty/classes/${classId}/students/${studentUid}`
    );
    return res.data;
  },

  // Class Representative Assignment
  assignClassRepresentative: async (
    classId: string,
    studentUid: string | null
  ): Promise<{ classId: string; classRepUid: string | null; classRep: ClassRepresentativeInfo | null }> => {
    const res = await api.post<{ classId: string; classRepUid: string | null; classRep: ClassRepresentativeInfo | null }>(
      `/faculty/classes/${classId}/class-rep`,
      { studentUid }
    );
    return res.data;
  },

  // Class Master Timetable (Period-wise for Entire Class)
  getClassTimetable: async (classId: string): Promise<ClassTimetableSlot[]> => {
    const res = await api.get<ClassTimetableSlot[]>(`/faculty/classes/${classId}/timetable`);
    return res.data;
  },

  saveClassTimetableSlot: async (
    classId: string,
    slot: Partial<ClassTimetableSlot>
  ): Promise<ClassTimetableSlot> => {
    const res = await api.post<ClassTimetableSlot>(`/faculty/classes/${classId}/timetable`, slot);
    return res.data;
  },

  bulkSaveClassTimetable: async (
    classId: string,
    slots: Partial<ClassTimetableSlot>[],
    replaceExisting: boolean = true
  ): Promise<{ count: number; slots: ClassTimetableSlot[] }> => {
    const res = await api.post<{ count: number; slots: ClassTimetableSlot[] }>(
      `/faculty/classes/${classId}/timetable/bulk`,
      { slots, replaceExisting }
    );
    return res.data;
  },

  deleteClassTimetableSlot: async (classId: string, slotId: string): Promise<{ success: boolean }> => {
    const res = await api.delete<{ success: boolean }>(`/faculty/classes/${classId}/timetable/${slotId}`);
    return res.data;
  },

  // My Subjects & Class-wise Performance
  getMySubjectsPerformance: async (): Promise<FacultySubjectClassPerformance[]> => {
    const res = await api.get<FacultySubjectClassPerformance[]>('/faculty/my-subjects/performance');
    return res.data;
  },

  getMySubjects: async (): Promise<any[]> => {
    const res = await api.get<any[]>('/faculty/my-subjects');
    return res.data;
  },

  getAssignments: async (classSubjectId?: string): Promise<any[]> => {
    const res = await api.get<any[]>('/faculty/assignments', { params: { classSubjectId } });
    return res.data;
  },

  createAssignment: async (data: any): Promise<any> => {
    const res = await api.post<any>('/faculty/assignments', data);
    return res.data;
  },

  getAssignmentSubmissions: async (assignmentId: string): Promise<any[]> => {
    const res = await api.get<any[]>(`/faculty/assignments/${assignmentId}/submissions`);
    return res.data;
  },

  uploadFile: async (file: File, folder?: string): Promise<{ url: string; secureUrl: string; publicId: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data || res.data;
  },
};

export default api;
