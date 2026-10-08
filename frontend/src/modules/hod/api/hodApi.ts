import type { DashboardData, Department, Faculty, Program, Batch, ClassItem, Student, Subject, AcademicYear, Semester, HODProfile, AttendanceSummary, CurriculumItem, AnnouncementItem, StudentAcademicAlert } from "../types/hod.types";
import { auth } from '../../../config/firebase';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

async function getAuthToken(): Promise<string> {
  await auth.authStateReady();
  if (!auth.currentUser) throw new Error('Firebase sign-in required');
  return auth.currentUser.getIdToken();
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  headers['Authorization'] = `Bearer ${token}`;

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const json = await response.json();

  if (!response.ok || json.success === false) {
    throw new Error(json.message || `Request failed with status ${response.status}`);
  }

  return json.data !== undefined ? json.data : json;
}

export const hodApi = {
  getMe: async () => {
    return request<any>('/auth/me');
  },

  // 1. Shuban — Dashboard & Department
  getDashboard: async (): Promise<DashboardData> => {
    return request<DashboardData>('/hod/dashboard');
  },

  getDepartment: async (): Promise<Department> => {
    return request<Department>('/hod/department');
  },

  // 2. Thejus — Faculty Management
  getFaculty: async (params?: { search?: string }): Promise<Faculty[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return request<Faculty[]>(`/hod/faculty${qs ? `?${qs}` : ''}`);
  },

  getPendingFaculty: async (): Promise<any[]> => {
    return request<any[]>('/hod/faculty/pending');
  },

  approveFaculty: async (uid: string, action: 'APPROVE' | 'REJECT', subjectId?: string, classId?: string): Promise<any> => {
    return request<any>(`/hod/faculty/pending/${uid}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action, subjectId, classId }),
    });
  },

  getFacultyById: async (facultyUid: string): Promise<Faculty> => {
    return request<Faculty>(`/hod/faculty/${facultyUid}`);
  },

  // 3. Raivathy — Program & Batch Management
  getPrograms: async (): Promise<Program[]> => {
    return request<Program[]>('/hod/programs');
  },

  createProgram: async (data: { name: string; degree?: string; durationYears: number }): Promise<Program> => {
    return request<Program>('/hod/programs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProgram: async (programId: string, data: Partial<Program>): Promise<Program> => {
    return request<Program>(`/hod/programs/${programId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getBatches: async (): Promise<Batch[]> => {
    return request<Batch[]>('/hod/batches');
  },

  createBatch: async (data: { programId: string; startYear: number; endYear: number }): Promise<Batch> => {
    return request<Batch>('/hod/batches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateBatch: async (batchId: string, data: Partial<Batch>): Promise<Batch> => {
    return request<Batch>(`/hod/batches/${batchId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // 4. Jeffy — Class Management & Class Incharge Assignment
  getClasses: async (params?: { search?: string }): Promise<ClassItem[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return request<ClassItem[]>(`/hod/classes${qs ? `?${qs}` : ''}`);
  },

  getClassById: async (classId: string): Promise<ClassItem> => {
    return request<ClassItem>(`/hod/classes/${classId}`);
  },

  createClass: async (data: { batchId: string; name: string; currentSemester?: number; facultyUid?: string }): Promise<ClassItem> => {
    return request<ClassItem>('/hod/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateClass: async (classId: string, data: Partial<ClassItem>): Promise<ClassItem> => {
    return request<ClassItem>(`/hod/classes/${classId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  assignClassIncharge: async (classId: string, facultyUid: string | null): Promise<any> => {
    return request<any>(`/hod/classes/${classId}/faculty`, {
      method: 'PATCH',
      body: JSON.stringify({ facultyUid }),
    });
  },

  assignSubjectToClass: async (classId: string, subjectId: string, facultyUid?: string): Promise<any> => {
    return request<any>(`/hod/classes/${classId}/subjects`, {
      method: 'POST',
      body: JSON.stringify({ subjectId, facultyUid }),
    });
  },

  assignSubjectTeacher: async (classId: string, subjectId: string, facultyUid: string): Promise<any> => {
    return request<any>(`/hod/classes/${classId}/subjects/${subjectId}/faculty`, {
      method: 'PATCH',
      body: JSON.stringify({ facultyUid }),
    });
  },

  assignFacultySubjects: async (facultyUid: string, classIds: string[], subjectIds: string[]): Promise<any> => {
    return request<any>(`/hod/faculty/${facultyUid}/subjects`, {
      method: 'POST',
      body: JSON.stringify({ classIds, subjectIds }),
    });
  },

  unassignFacultySubject: async (facultyUid: string, classId: string, subjectId: string): Promise<any> => {
    return request<any>(`/hod/faculty/${facultyUid}/classes/${classId}/subjects/${subjectId}`, {
      method: 'DELETE',
    });
  },

  // 5. Sai Preethi — Students, Subjects & Academic Information
  getStudents: async (params?: { search?: string; classId?: string }): Promise<Student[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.classId) query.append('classId', params.classId);
    const qs = query.toString();
    return request<Student[]>(`/hod/students${qs ? `?${qs}` : ''}`);
  },

  getStudentById: async (studentId: string): Promise<Student> => {
    return request<Student>(`/hod/students/${studentId}`);
  },

  getSubjects: async (params?: { semester?: number }): Promise<Subject[]> => {
    const query = new URLSearchParams();
    if (params?.semester) query.append('semester', params.semester.toString());
    const qs = query.toString();
    return request<Subject[]>(`/hod/subjects${qs ? `?${qs}` : ''}`);
  },

  createSubject: async (data: { name: string; code: string; credits?: number; semesterNumber: number }): Promise<Subject> => {
    return request<Subject>('/hod/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSubject: async (subjectId: string, data: Partial<Subject>): Promise<Subject> => {
    return request<Subject>(`/hod/subjects/${subjectId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getAcademicYears: async (): Promise<AcademicYear[]> => {
    return request<AcademicYear[]>('/hod/academic-years');
  },

  getSemesters: async (): Promise<Semester[]> => {
    return request<Semester[]>('/hod/semesters');
  },

  // 6. Profile
  getProfile: async (): Promise<HODProfile> => {
    return request<HODProfile>('/hod/profile');
  },

  updateProfile: async (data: Partial<HODProfile>): Promise<HODProfile> => {
    return request<HODProfile>('/hod/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Supporting modules
  // Supporting modules
  getAttendanceSummary: async (): Promise<AttendanceSummary> => {
    return request<AttendanceSummary>('/hod/attendance-summary');
  },

  getCurriculum: async (): Promise<CurriculumItem[]> => {
    return request<CurriculumItem[]>('/hod/curriculum');
  },

  getAnnouncements: async (): Promise<AnnouncementItem[]> => {
    return request<AnnouncementItem[]>('/hod/announcements');
  },

  createAnnouncement: async (data: any): Promise<AnnouncementItem> => {
    return request<AnnouncementItem>('/hod/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAcademicAlerts: async (): Promise<StudentAcademicAlert[]> => {
    return request<StudentAcademicAlert[]>('/hod/academic-alerts');
  },
};