import { auth } from '../../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/** A token is accepted only from the current Firebase session, never localStorage. */
export async function getAuthToken(): Promise<string> {
  await auth.authStateReady();
  if (!auth.currentUser) throw new Error('Firebase sign-in required');
  return auth.currentUser.getIdToken();
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const body = await response.json().catch(() => ({
    success: false,
    data: null as any,
    error: {
      code: 'PARSE_ERROR',
      message: 'Failed to parse response from server',
    },
  }));

  if (!response.ok || body.success === false) {
    const errorMsg = body.error?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg) as Error & { code?: string; status?: number };
    error.code = body.error?.code;
    error.status = response.status;
    throw error;
  }

  return body.data;
}

export const secureDataApi = {
  // Public discovery (no auth)
  getPublicColleges: () =>
    request<{ id: string; name: string; code: string }[]>(
      '/public/colleges'
    ),

  getPublicDepartments: (collegeId: string) =>
    request<{ id: string; name: string; code: string }[]>(
      `/public/colleges/${encodeURIComponent(collegeId)}/departments`
    ),

  // Authenticated user's own identity/approval status
  getOwnIdentity: () =>
    request<{
      uid: string;
      email: string;
      display_name: string | null;
      role: string | null;
      requested_role: string | null;
      approval_status: string | null;
      college_id: string | null;
      department_id: string | null;
      class_id: string | null;
      subject_id: string | null;
      register_number: string | null;
      created_at: string | null;
    }>('/secure-data/me'),

  submitOnboardingRequest: (data: {
    college_id: string;
    requested_role: string;
    department_id?: string | null;
  }) =>
    request<{
      uid: string;
      email: string;
      role: string | null;
      requested_role: string | null;
      approval_status: string | null;
      college_id: string | null;
      department_id: string | null;
    }>('/secure-data/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // SUPER_ADMIN only
  listColleges: () =>
    request<
      Array<{
        id: string;
        name: string;
        code: string;
        domain: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        country: string | null;
        phone: string | null;
        email: string | null;
        website: string | null;
        logoUrl: string | null;
        adminName: string | null;
        adminEmail: string | null;
        adminUid: string | null;
        isActive: boolean;
        createdAt: string;
      }>
    >('/secure-data/colleges'),

  createCollege: (data: {
    name: string;
    code: string;
    domain?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    logoUrl?: string | null;
    adminName?: string | null;
    adminEmail?: string | null;
    isActive?: boolean;
  }) =>
    request<{
      id: string;
      name: string;
      code: string;
      domain: string | null;
      address: string | null;
      city: string | null;
      state: string | null;
      country: string | null;
      phone: string | null;
      email: string | null;
      website: string | null;
      logoUrl: string | null;
      adminName: string | null;
      adminEmail: string | null;
      adminUid: string | null;
      isActive: boolean;
      createdAt: string;
    }>('/secure-data/colleges', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCollege: (
    collegeId: string,
    data: Partial<{
      name: string;
      code: string;
      domain: string | null;
      address: string | null;
      city: string | null;
      state: string | null;
      country: string | null;
      phone: string | null;
      email: string | null;
      website: string | null;
      logoUrl: string | null;
      adminName: string | null;
      adminEmail: string | null;
      isActive: boolean;
    }>
  ) =>
    request<{
      id: string;
      name: string;
      code: string;
      domain: string | null;
      address: string | null;
      city: string | null;
      state: string | null;
      country: string | null;
      phone: string | null;
      email: string | null;
      website: string | null;
      logoUrl: string | null;
      adminName: string | null;
      adminEmail: string | null;
      adminUid: string | null;
      isActive: boolean;
      createdAt: string;
    }>(`/secure-data/colleges/${encodeURIComponent(collegeId)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteCollege: (collegeId: string) =>
    request<{ deleted: boolean }>(`/secure-data/colleges/${encodeURIComponent(collegeId)}`, {
      method: 'DELETE',
    }),

  // COLLEGE_ADMIN / HOD / SUPER_ADMIN (scoped by role)
  listUsers: (params?: {
    role?: 'COLLEGE_ADMIN' | 'HOD' | 'FACULTY' | 'STUDENT';
    department_id?: string;
    pending?: boolean;
  }) => {
    const search = new URLSearchParams();
    if (params?.role) search.set('role', params.role);
    if (params?.department_id) search.set('department_id', params.department_id);
    if (params?.pending) search.set('pending', 'true');
    return request<
      Array<{
        uid: string;
        email: string;
        display_name: string | null;
        role: string | null;
        requested_role: string | null;
        approval_status: string | null;
        college_id: string | null;
        department_id: string | null;
        class_id: string | null;
        subject_id: string | null;
        register_number: string | null;
        created_at: string | null;
      }>
    >(`/secure-data/users?${search.toString()}`);
  },

  assignUser: (
    uid: string,
    data: {
      department_id?: string | null;
      class_id?: string | null;
      subject_id?: string | null;
      register_number?: string | null;
    }
  ) =>
    request<{
      uid: string;
      email: string;
      display_name: string | null;
      role: string | null;
      requested_role: string | null;
      approval_status: string | null;
      college_id: string | null;
      department_id: string | null;
      class_id: string | null;
      subject_id: string | null;
      register_number: string | null;
      created_at: string | null;
    }>(`/secure-data/users/${encodeURIComponent(uid)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  reviewApproval: (uid: string, decision: 'APPROVED' | 'REJECTED') =>
    request<{
      uid: string;
      email: string;
      display_name: string | null;
      role: string | null;
      requested_role: string | null;
      approval_status: string | null;
      college_id: string | null;
      department_id: string | null;
      class_id: string | null;
      subject_id: string | null;
      register_number: string | null;
      created_at: string | null;
    }>(`/secure-data/approvals/${encodeURIComponent(uid)}`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    }),

  // COLLEGE_ADMIN only
  getStats: () =>
    request<{
      students: number;
      faculty: number;
      hods: number;
      departments: number;
      programs: number;
      subjects: number;
    }>('/secure-data/stats'),

  // Academic structure - COLLEGE_ADMIN (and HOD for own dept)
  listStructure: (
    type: 'departments' | 'programs' | 'batches' | 'classes' | 'subjects',
    parentId: string
  ) => {
    const search = new URLSearchParams({ parentId });
    return request<
      Array<{
        id: string;
        college_id?: string;
        department_id?: string;
        program_id?: string;
        batch_id?: string;
        name: string;
        code?: string;
        type?: string;
        duration_years?: number;
        start_year?: number;
        end_year?: number;
        current_semester?: number;
        faculty_uid?: string | null;
        is_active?: boolean;
        hod_uid?: string | null;
        credits?: number;
        semester_number?: number;
        created_at?: string;
      }>
    >(`/secure-data/structure/${type}?${search.toString()}`);
  },

  createStructure: (
    type: 'departments' | 'programs' | 'batches' | 'classes' | 'subjects',
    parentId: string,
    data: Record<string, unknown>
  ) =>
    request<any>(`/secure-data/structure/${type}?parentId=${encodeURIComponent(parentId)}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStructure: (
    type: 'departments' | 'programs' | 'batches' | 'classes' | 'subjects',
    id: string,
    data: Record<string, unknown>
  ) =>
    request<any>(`/secure-data/structure/${type}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteStructure: (
    type: 'departments' | 'programs' | 'batches' | 'classes' | 'subjects',
    id: string
  ) =>
    request<{ deleted: boolean }>(`/secure-data/structure/${type}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
};

export default secureDataApi;