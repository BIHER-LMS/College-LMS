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
  ApiResponse,
  ClassTimetableSlot,
  StudentAttendanceResponse,
} from '../types/student.types';
import type {
  StudentChatRequest,
  StudentChatResponseData,
  CanonicalToolMeta,
  ToolExecutionResult,
} from '../types/studentAi.types';
import { auth } from '../../../config/firebase';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/** A token is accepted only from the current Firebase session, never localStorage. */
export async function getAuthToken(): Promise<string> {
  if (!auth.currentUser) {
    await auth.authStateReady();
  }
  if (!auth.currentUser) throw new Error('Firebase sign-in required');
  return auth.currentUser.getIdToken();
}

// In-flight GET request deduplication
const inFlightStudentGets = new Map<string, Promise<any>>();

async function executeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const body: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    data: null as any,
    error: {
      code: 'PARSE_ERROR',
      message: 'Failed to parse response from server',
    },
  }));

  if (!response.ok || !body.success) {
    const errorMsg = body.error?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg) as Error & { code?: string; status?: number };
    error.code = body.error?.code;
    error.status = response.status;
    throw error;
  }

  return body.data;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  if (method === 'GET') {
    const existing = inFlightStudentGets.get(endpoint);
    if (existing) return existing as Promise<T>;

    const promise = executeRequest<T>(endpoint, options).finally(() => {
      inFlightStudentGets.delete(endpoint);
    });
    inFlightStudentGets.set(endpoint, promise);
    return promise;
  }

  return executeRequest<T>(endpoint, options);
}

export const studentApi = {
  // 1. Dashboard
  getDashboard: () => request<StudentDashboardData>('/student/dashboard'),

  // 2. Profile
  getProfile: () => request<StudentProfile>('/student/profile'),
  updateProfile: (data: StudentUpdateProfileDTO) =>
    request<StudentProfile>('/student/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // 3. Class
  getClass: () => request<ClassInfo>('/student/class'),

  // 4. Batch
  getBatch: () => request<BatchInfo>('/student/batch'),

  // 5. Program
  getProgram: () => request<ProgramInfo>('/student/program'),

  // 6. Department
  getDepartment: () => request<DepartmentInfo>('/student/department'),

  // 7. Subjects
  getSubjects: (semesterNumber?: number) => {
    const query = semesterNumber ? `?semester=${semesterNumber}` : '';
    return request<SubjectInfo[]>(`/student/subjects${query}`);
  },

  // 8. Class Incharge
  getClassIncharge: () => request<ClassInchargeInfo>('/student/class-incharge'),

  // 9. Academic Years
  getAcademicYears: () => request<AcademicYearInfo[]>('/student/academic-years'),

  // 10. Semesters
  getSemesters: () => request<SemesterInfo[]>('/student/semesters'),

  // 11. Class Master Timetable (Real schedule from Class Incharge)
  getTimetable: () => request<ClassTimetableSlot[]>('/student/timetable'),

  // 12. Attendance & Daily Verification Logs
  getAttendance: (date?: string) => {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return request<StudentAttendanceResponse>(`/student/attendance${query}`);
  },

  // 13. Assignments
  getAssignments: () => request<any[]>('/student/assignments'),
  submitAssignment: (assignmentId: string, data: { attachmentUrl?: string; file?: File }) => {
    if (data.file) {
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.attachmentUrl) {
        formData.append('attachmentUrl', data.attachmentUrl);
      }
      return request<any>(`/student/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: formData,
      });
    }
    return request<any>(`/student/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 14. Universal Cloudinary Storage Upload
  uploadFile: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    return request<{ url: string; secureUrl: string; publicId: string }>('/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // 15. Learning Content Management & Telemetry APIs
  getLearningContents: () => request<any[]>('/student/content'),
  getContentDetails: (id: string) => request<any>(`/student/content/${id}`),
  recordLearningEvent: (id: string, payload: any) =>
    request<any>(`/student/content/${id}/events`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getAuthorizedDownload: (id: string) =>
    request<{ fileUrl: string; fileName: string; contentType: string }>(`/student/content/${id}/download`),

  submitAssignmentVersion: (assignmentId: string, file: File, studentNotes?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (studentNotes) formData.append('studentNotes', studentNotes);
    return request<any>(`/student/assignments/${assignmentId}/submit-version`, {
      method: 'POST',
      body: formData,
    });
  },

  // 16. Student AI Assistant Endpoints
  sendChatMessage: (data: StudentChatRequest) =>
    request<StudentChatResponseData>('/student/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAiTools: () =>
    request<{ tools: CanonicalToolMeta[] }>('/student/ai/tools'),

  executeAiTool: (toolName: string, args: Record<string, any> = {}) =>
    request<ToolExecutionResult>('/student/ai/tools/execute', {
      method: 'POST',
      body: JSON.stringify({ toolName, args }),
    }),
};
