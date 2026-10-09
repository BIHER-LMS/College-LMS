import { secureDataApi } from './api/secureDataApi';

export interface CollegeRecord {
  id: string;
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
  adminEmail?: string | null;
  adminName?: string | null;
  adminUid?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthedUserRecord {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  provider: string;
  lastLogin: string;
  role?: string;
  college_id?: string | null;
  department_id?: string | null;
  class_id?: string | null;
  subject_id?: string | null;
  register_number?: string | null;
  requested_role?: string | null;
  approval_status?: string | null;
}

export interface DepartmentRecord {
  id: string;
  college_id: string;
  name: string;
  code: string;
  hod_uid?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProgramRecord {
  id: string;
  department_id: string;
  name: string;
  type: string;
  duration_years: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BatchRecord {
  id: string;
  program_id: string;
  start_year: number;
  end_year: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClassRecord {
  id: string;
  batch_id: string;
  name: string;
  current_semester?: number | null;
  faculty_uid?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SubjectRecord {
  id: string;
  department_id: string;
  name: string;
  code: string;
  credits?: number | null;
  semester_number: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const LOCAL_COLLEGES_KEY = 'lms_colleges_cache';
const LOCAL_USERS_KEY = 'lms_authed_users_cache';

export function getLocalColleges(): CollegeRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_COLLEGES_KEY);
    if (!raw) return [];
    const parsed: CollegeRecord[] = JSON.parse(raw);
    // Purge any legacy dummy seed data
    const cleaned = parsed.filter(c => c.id !== 'col-101' && c.id !== 'col-102');
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(LOCAL_COLLEGES_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (e) {
    return [];
  }
}

export function saveLocalColleges(colleges: CollegeRecord[]) {
  localStorage.setItem(LOCAL_COLLEGES_KEY, JSON.stringify(colleges));
}

export async function fetchColleges(): Promise<CollegeRecord[]> {
  try {
    const data = await secureDataApi.listColleges();
    const formatted: CollegeRecord[] = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      domain: item.domain,
      address: item.address,
      city: item.city,
      state: item.state,
      country: item.country,
      phone: item.phone,
      email: item.email,
      website: item.website,
      logoUrl: item.logoUrl,
      adminEmail: item.adminEmail,
      adminName: item.adminName,
      adminUid: item.adminUid,
      isActive: item.isActive,
      createdAt: item.createdAt,
    }));
    saveLocalColleges(formatted);
    return formatted;
  } catch (err) {
    console.warn('Secure data fetch failed, using local storage cache:', err);
    return getLocalColleges();
  }
}

export async function fetchPublicColleges(): Promise<Partial<CollegeRecord>[]> {
  try {
    const data = await secureDataApi.getPublicColleges();
    return data;
  } catch (err) {
    console.warn('Secure data fetch failed:', err);
    return [];
  }
}

export async function createCollege(
  college: Omit<CollegeRecord, 'id' | 'createdAt'>
): Promise<CollegeRecord> {
  const newId = `col-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const record: CollegeRecord = {
    ...college,
    id: newId,
    createdAt: new Date().toISOString(),
  };

  // 1. Save in local cache first for instant UI response
  const current = getLocalColleges();
  const updated = [record, ...current];
  saveLocalColleges(updated);

  // 2. Sync via secure backend
  try {
    await secureDataApi.createCollege({
      name: record.name,
      code: record.code,
      domain: record.domain,
      address: record.address,
      city: record.city,
      state: record.state,
      country: record.country,
      phone: record.phone,
      email: record.email,
      website: record.website,
      logoUrl: record.logoUrl,
      adminEmail: record.adminEmail,
      adminName: record.adminName,
      isActive: record.isActive,
    });
  } catch (error) {
    console.error('Secure data create error:', error);
    throw error;
  }

  return record;
}

export async function updateCollege(
  id: string,
  updates: Partial<CollegeRecord>
): Promise<CollegeRecord[]> {
  const current = getLocalColleges();
  const index = current.findIndex(c => c.id === id);
  if (index !== -1) {
    current[index] = { ...current[index], ...updates, updatedAt: new Date().toISOString() };
    saveLocalColleges([...current]);
  }

  // Attempt secure backend update
  try {
    await secureDataApi.updateCollege(id, {
      name: updates.name,
      code: updates.code,
      domain: updates.domain,
      address: updates.address,
      city: updates.city,
      state: updates.state,
      country: updates.country,
      phone: updates.phone,
      email: updates.email,
      website: updates.website,
      logoUrl: updates.logoUrl,
      adminEmail: updates.adminEmail,
      adminName: updates.adminName,
      isActive: updates.isActive,
    });
  } catch (error) {
    console.error('Secure data update error:', error);
    throw error;
  }

  return current;
}

export async function deleteCollege(id: string): Promise<CollegeRecord[]> {
  const current = getLocalColleges();
  const filtered = current.filter(c => c.id !== id);
  saveLocalColleges(filtered);

  try {
    await secureDataApi.deleteCollege(id);
  } catch (error) {
    console.error('Secure data delete error:', error);
    throw error;
  }

  return filtered;
}

// ─── AUTHENTICATED USERS (FOR COLLEGE ADMIN ASSIGNMENT) ──────────

export function getLocalAuthedUsers(): AuthedUserRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

const inFlightSync = new Map<string, Promise<AuthedUserRecord>>();

export async function recordAuthedUser(user: AuthedUserRecord, token?: string): Promise<AuthedUserRecord> {
  let finalUser = { ...user, role: 'USER' };

  if (token) {
    const syncKey = `${user.uid}_${user.email.toLowerCase()}`;
    if (inFlightSync.has(syncKey)) {
      return inFlightSync.get(syncKey)!;
    }

    const syncPromise = (async () => {
      // Sync via secure backend route to handle dummy student mapping and PK updates properly
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(user)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        console.error('Auth sync error:', errJson);
        const errorMsg = errJson?.error?.message || errJson?.message || 'Failed to map user authentication securely.';
        throw new Error(errorMsg);
      }

      const { data } = await response.json();
      if (data) {
        finalUser = {
          ...finalUser,
          role: data.role || finalUser.role,
          college_id: data.college_id,
          approval_status: data.approval_status,
          requested_role: data.requested_role,
          department_id: data.department_id,
          class_id: data.class_id,
          subject_id: data.subject_id,
          register_number: data.register_number,
        };
      }
      return finalUser;
    })();

    inFlightSync.set(syncKey, syncPromise);
    try {
      return await syncPromise;
    } finally {
      inFlightSync.delete(syncKey);
    }
  } else {
    // Fallback if token is missing (which shouldn't happen for active sessions)
    // Cannot sync directly to Supabase anymore - must use backend
    throw new Error('Firebase token required for user sync');
  }
}

export async function getAuthedUserProfile(params: { uid?: string; email?: string }): Promise<AuthedUserRecord | null> {
  try {
    const identity = await secureDataApi.getOwnIdentity();
    if (!identity) return null;
    
    // If a specific uid/email is requested and it matches, return it
    if (params.uid && identity.uid !== params.uid) return null;
    if (params.email && identity.email.toLowerCase() !== params.email.toLowerCase()) return null;
    
    return {
      uid: identity.uid,
      email: identity.email,
      displayName: identity.display_name,
      photoURL: null,
      provider: 'google',
      lastLogin: identity.created_at,
      role: identity.role,
      college_id: identity.college_id,
      department_id: identity.department_id,
      class_id: identity.class_id,
      register_number: identity.register_number,
      requested_role: identity.requested_role,
      approval_status: identity.approval_status,
    } as AuthedUserRecord;
  } catch (err) {
    console.error('getAuthedUserProfile error:', err);
    return null;
  }
}

export async function fetchAuthedUsers(): Promise<AuthedUserRecord[]> {
  try {
    // This is only for SUPER_ADMIN - list all users
    // For other roles, use listUsers with role filter
    const data = await secureDataApi.listUsers({});
    const formatted: AuthedUserRecord[] = data.map((d: any) => ({
      uid: d.uid,
      email: d.email,
      displayName: d.display_name,
      photoURL: null,
      provider: 'google',
      lastLogin: d.created_at,
      role: d.role,
      college_id: d.college_id,
    }));
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(formatted));
    return formatted;
  } catch (err) {
    console.warn('Secure data fetch authed users error:', err);
    return getLocalAuthedUsers();
  }
}

export async function deleteAuthedUser(uid: string): Promise<void> {
  try {
    // Use secure API to update user (mark as deleted/rejected)
    await secureDataApi.assignUser(uid, { department_id: null, class_id: null });
  } catch (err) {
    console.warn('Secure data delete authed user failed:', err);
  }
  const users = getLocalAuthedUsers().filter(u => u.uid !== uid);
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

// ====== College Admin: Departments ======

export const fetchDepartments = async (collegeId: string): Promise<DepartmentRecord[]> => {
  try {
    const data = await secureDataApi.listStructure('departments', collegeId);
    return data as DepartmentRecord[];
  } catch (err) {
    try {
      const publicData = await secureDataApi.getPublicDepartments(collegeId);
      return publicData as DepartmentRecord[];
    } catch {
      console.error('Error fetching departments:', err);
      return [];
    }
  }
};

export const fetchPublicDepartments = async (collegeId: string): Promise<DepartmentRecord[]> => {
  try {
    const data = await secureDataApi.getPublicDepartments(collegeId);
    return data as DepartmentRecord[];
  } catch (err) {
    console.error('Error fetching public departments:', err);
    return [];
  }
};

export const submitOnboardingRequest = async (data: {
  college_id: string;
  requested_role: string;
  department_id?: string | null;
}) => {
  return secureDataApi.submitOnboardingRequest(data);
};

export const createDepartment = async (department: Omit<DepartmentRecord, 'id' | 'created_at' | 'updated_at'>) => {
  const data = await secureDataApi.createStructure('departments', department.college_id, {
    name: department.name,
    code: department.code,
    hod_uid: department.hod_uid,
    is_active: department.is_active,
  });
  return data;
};

export const fetchEligibleHODs = async (_collegeId?: string): Promise<AuthedUserRecord[]> => {
  try {
    // Filter HODs that are unassigned (no department_id)
    const data = await secureDataApi.listUsers({ role: 'HOD', department_id: undefined, pending: false });
    return data.filter((h: any) => h.department_id === null) as unknown as AuthedUserRecord[];
  } catch (err) {
    console.error('Error fetching eligible HODs:', err);
    return [];
  }
};

export const updateDepartment = async (id: string, updates: Partial<DepartmentRecord>) => {
  const data = await secureDataApi.updateStructure('departments', id, {
    name: updates.name,
    code: updates.code,
    hod_uid: updates.hod_uid,
    is_active: updates.is_active,
  });
  return data;
};

export const deleteDepartment = async (id: string) => {
  await secureDataApi.deleteStructure('departments', id);
};

// ====== College Admin: Programs ======

export const fetchPrograms = async (departmentId: string): Promise<ProgramRecord[]> => {
  try {
    const data = await secureDataApi.listStructure('programs', departmentId);
    return data as ProgramRecord[];
  } catch (err) {
    console.error('Error fetching programs:', err);
    return [];
  }
};

export const createProgram = async (programData: Omit<ProgramRecord, 'id' | 'created_at'>) => {
  const data = await secureDataApi.createStructure('programs', programData.department_id, {
    name: programData.name,
    type: programData.type,
    duration_years: programData.duration_years,
    is_active: programData.is_active,
  });
  return data;
};

// ====== College Admin: Batches ======

export const fetchBatches = async (programId: string): Promise<BatchRecord[]> => {
  try {
    const data = await secureDataApi.listStructure('batches', programId);
    return data as BatchRecord[];
  } catch (err) {
    console.error('Error fetching batches:', err);
    return [];
  }
};

export const createBatch = async (batchData: Omit<BatchRecord, 'id' | 'created_at'>) => {
  const data = await secureDataApi.createStructure('batches', batchData.program_id, {
    start_year: batchData.start_year,
    end_year: batchData.end_year,
    is_active: batchData.is_active,
  });
  return data;
};

// ====== College Admin: Classes ======

export const fetchClasses = async (batchId: string): Promise<ClassRecord[]> => {
  try {
    const data = await secureDataApi.listStructure('classes', batchId);
    return data as ClassRecord[];
  } catch (err) {
    console.error('Error fetching classes:', err);
    return [];
  }
};

export const createClass = async (classData: Omit<ClassRecord, 'id' | 'created_at'>) => {
  const data = await secureDataApi.createStructure('classes', classData.batch_id, {
    name: classData.name,
    current_semester: classData.current_semester,
    faculty_uid: classData.faculty_uid,
    is_active: classData.is_active,
  });
  return data;
};

// ====== College Admin: Subjects ======

export const fetchSubjects = async (departmentId: string): Promise<SubjectRecord[]> => {
  try {
    const data = await secureDataApi.listStructure('subjects', departmentId);
    return data as SubjectRecord[];
  } catch (err) {
    console.error('Error fetching subjects:', err);
    return [];
  }
};

export const fetchAllCollegeSubjects = async (collegeId: string): Promise<SubjectRecord[]> => {
  try {
    // Get all departments for this college, then fetch subjects in parallel
    const departments = await fetchDepartments(collegeId);
    if (!departments.length) return [];

    const subjectArrays = await Promise.all(departments.map((dept) => fetchSubjects(dept.id)));
    const allSubjects = subjectArrays.flat();
    return allSubjects.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error('Error in fetchAllCollegeSubjects:', err);
    return [];
  }
};

export const fetchAllCollegeClasses = async (collegeId: string): Promise<ClassRecord[]> => {
  try {
    // Parallelize tree traversal: departments -> programs -> batches -> classes
    const departments = await fetchDepartments(collegeId);
    if (!departments.length) return [];

    const programsArrays = await Promise.all(departments.map((dept) => fetchPrograms(dept.id)));
    const allPrograms = programsArrays.flat();
    if (!allPrograms.length) return [];

    const batchesArrays = await Promise.all(allPrograms.map((prog) => fetchBatches(prog.id)));
    const allBatches = batchesArrays.flat();
    if (!allBatches.length) return [];

    const classesArrays = await Promise.all(allBatches.map((batch) => fetchClasses(batch.id)));
    const allClasses = classesArrays.flat();

    return allClasses.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error('Error in fetchAllCollegeClasses:', err);
    return [];
  }
};

export const assignFacultyClassIncharge = async (facultyUid: string, classId: string | null) => {
  try {
    // This is a complex operation - first unassign from any current class
    // then assign to new class. The secure API handles this in updateStructure.
    const data = await secureDataApi.updateStructure('classes', classId || '', {
      faculty_uid: classId ? facultyUid : null,
    });
    return data;
  } catch (err) {
    console.error('Error assigning class incharge:', err);
    throw err;
  }
};

export const assignFacultySubject = async (facultyUid: string, subjectId: string | null) => {
  try {
    const data = await secureDataApi.updateStructure('subjects', subjectId || '', {
      faculty_uid: subjectId ? facultyUid : null,
    });
    return data;
  } catch (err) {
    console.error('Error assigning faculty subject:', err);
    throw err;
  }
};

export const createSubject = async (subjectData: Omit<SubjectRecord, 'id' | 'created_at'>) => {
  const data = await secureDataApi.createStructure('subjects', subjectData.department_id, {
    name: subjectData.name,
    code: subjectData.code,
    credits: subjectData.credits,
    semester_number: subjectData.semester_number,
    is_active: subjectData.is_active,
  });
  return data;
};

// ====== College Admin: Users ======

export interface UserFilters {
  college_id: string;
  role: 'HOD' | 'FACULTY' | 'STUDENT';
  department_id?: string;
}

// Map backend user shape to frontend AuthedUserRecord
function mapToAuthedUserRecord(d: any): AuthedUserRecord {
  return {
    uid: d.uid,
    email: d.email,
    displayName: d.display_name,
    photoURL: null,
    provider: 'google',
    lastLogin: d.created_at,
    role: d.role,
    college_id: d.college_id,
    department_id: d.department_id,
    class_id: d.class_id,
    subject_id: d.subject_id,
    register_number: d.register_number,
    requested_role: d.requested_role,
    approval_status: d.approval_status,
  };
}

export const fetchUsers = async (filters: UserFilters): Promise<AuthedUserRecord[]> => {
  try {
    const data = await secureDataApi.listUsers({
      role: filters.role,
      department_id: filters.department_id,
      pending: false,
    });
    return data.map(mapToAuthedUserRecord);
  } catch (err) {
    console.error(`Error fetching ${filters.role}s:`, err);
    return [];
  }
};

export const fetchPendingUsers = async (_collegeId: string, requestedRole: string): Promise<AuthedUserRecord[]> => {
  try {
    const data = await secureDataApi.listUsers({
      role: requestedRole as any,
      department_id: undefined,
      pending: true,
    });
    return data.map(mapToAuthedUserRecord);
  } catch (err) {
    console.error('Error fetching pending users:', err);
    return [];
  }
};

export const updateUserProfile = async (identifier: string, updates: any) => {
  try {
    // If identifier is email, we need to find the uid first
    // For now, assume it's a uid
    const data = await secureDataApi.assignUser(identifier, {
      department_id: updates.department_id,
      class_id: updates.class_id,
      subject_id: updates.subject_id,
      register_number: updates.register_number,
    });
    return data;
  } catch (err) {
    console.error('Error updating user profile:', err);
    throw err;
  }
};

// ====== Dashboard Stats ======

export const fetchCollegeStats = async (_collegeId?: string) => {
  try {
    const data = await secureDataApi.getStats();
    return {
      students: data.students,
      faculty: data.faculty,
      hods: data.hods,
      departments: data.departments,
      programs: data.programs,
      subjects: data.subjects
    };
  } catch (err) {
    console.error('Error fetching college stats:', err);
    return {
      students: 0,
      faculty: 0,
      hods: 0,
      departments: 0,
      programs: 0,
      subjects: 0
    };
  }
};