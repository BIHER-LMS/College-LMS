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

// In-flight promise cache to coalesce simultaneous identical requests
const inFlightRequests = new Map<string, Promise<any>>();

// Client-side short-lived memory cache with timestamp
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
const clientCache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string): T | null {
  const entry = clientCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    clientCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached<T>(key: string, data: T, ttlMs = 30000): void {
  clientCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function clearClientCache(pattern?: RegExp): void {
  if (!pattern) {
    clientCache.clear();
    return;
  }
  for (const key of clientCache.keys()) {
    if (pattern.test(key)) {
      clientCache.delete(key);
    }
  }
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
      adminName?: string | null;
      adminEmail?: string | null;
      adminUid?: string | null;
      isActive?: boolean;
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

  assignCollegeAdmin: (collegeId: string, uid: string) =>
    request<{ college: any; user: any }>(
      `/secure-data/colleges/${encodeURIComponent(collegeId)}/assign-admin`,
      {
        method: 'POST',
        body: JSON.stringify({ uid }),
      }
    ),

  unassignCollegeAdmin: (collegeId: string, uid?: string) =>
    request<{ college: any }>(
      `/secure-data/colleges/${encodeURIComponent(collegeId)}/unassign-admin`,
      {
        method: 'POST',
        body: JSON.stringify({ uid }),
      }
    ),

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
  getAllCollegeClasses: (collegeId: string) => {
    const cacheKey = `college-classes:${collegeId}`;
    const cached = getCached<any[]>(cacheKey);
    if (cached) return Promise.resolve(cached);

    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey)!;
    }

    const promise = request<
      Array<{
        id: string;
        name: string;
        current_semester?: number;
        faculty_uid?: string | null;
        is_active?: boolean;
        batch_id?: string;
        created_at?: string;
        batch?: any;
      }>
    >(`/secure-data/colleges/${encodeURIComponent(collegeId)}/classes`)
      .then((data) => {
        setCached(cacheKey, data, 30000);
        inFlightRequests.delete(cacheKey);
        return data;
      })
      .catch((err) => {
        inFlightRequests.delete(cacheKey);
        throw err;
      });

    inFlightRequests.set(cacheKey, promise);
    return promise;
  },

  getAllCollegeSubjects: (collegeId: string) => {
    const cacheKey = `college-subjects:${collegeId}`;
    const cached = getCached<any[]>(cacheKey);
    if (cached) return Promise.resolve(cached);

    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey)!;
    }

    const promise = request<
      Array<{
        id: string;
        name: string;
        code?: string;
        credits?: number;
        semester_number?: number;
        is_active?: boolean;
        department_id?: string;
        created_at?: string;
      }>
    >(`/secure-data/colleges/${encodeURIComponent(collegeId)}/subjects`)
      .then((data) => {
        setCached(cacheKey, data, 30000);
        inFlightRequests.delete(cacheKey);
        return data;
      })
      .catch((err) => {
        inFlightRequests.delete(cacheKey);
        throw err;
      });

    inFlightRequests.set(cacheKey, promise);
    return promise;
  },

  listStructure: (
    type: 'departments' | 'programs' | 'batches' | 'classes' | 'subjects',
    parentId: string
  ) => {
    const cacheKey = `struct:${type}:${parentId}`;
    const cached = getCached<any[]>(cacheKey);
    if (cached) return Promise.resolve(cached);

    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey)!;
    }

    const search = new URLSearchParams({ parentId });
    const promise = request<
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
    >(`/secure-data/structure/${type}?${search.toString()}`)
      .then((data) => {
        setCached(cacheKey, data, 30000);
        inFlightRequests.delete(cacheKey);
        return data;
      })
      .catch((err) => {
        inFlightRequests.delete(cacheKey);
        throw err;
      });

    inFlightRequests.set(cacheKey, promise);
    return promise;
  },

  createStructure: (
    type: 'departments' | 'programs' | 'batches' | 'classes' | 'subjects',
    parentId: string,
    data: Record<string, unknown>
  ) => {
    clearClientCache(/^struct:/);
    clearClientCache(/^college-/);
    return request<any>(`/secure-data/structure/${type}?parentId=${encodeURIComponent(parentId)}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStructure: (
    type: 'departments' | 'programs' | 'batches' | 'classes' | 'subjects',
    id: string,
    data: Record<string, unknown>
  ) => {
    clearClientCache(/^struct:/);
    clearClientCache(/^college-/);
    return request<any>(`/secure-data/structure/${type}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteStructure: (
    type: 'departments' | 'programs' | 'batches' | 'classes' | 'subjects',
    id: string
  ) => {
    clearClientCache(/^struct:/);
    clearClientCache(/^college-/);
    return request<{ deleted: boolean }>(`/secure-data/structure/${type}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

export default secureDataApi;