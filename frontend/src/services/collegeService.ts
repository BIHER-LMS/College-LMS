import { supabase } from '../config/supabase';
import type { CollegeRecord, AuthedUserRecord } from '../config/supabase';

export type { CollegeRecord, AuthedUserRecord };

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
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch failed, using local storage cache:', error.message || error);
      return getLocalColleges();
    }
    
    if (!data || data.length === 0) {
      saveLocalColleges([]);
      return [];
    }
    
    // Format any snake_case columns if present
    const formatted: CollegeRecord[] = data.map((item: any) => ({
      id: item.id || `col-${Date.now()}`,
      name: item.name || '',
      code: item.code || '',
      domain: item.domain || null,
      address: item.address || null,
      city: item.city || null,
      state: item.state || null,
      country: item.country || 'India',
      phone: item.phone || null,
      email: item.email || null,
      website: item.website || null,
      logoUrl: item.logo_url || item.logoUrl || null,
      adminEmail: item.admin_email || item.adminEmail || null,
      adminName: item.admin_name || item.adminName || null,
      adminUid: item.admin_uid || item.adminUid || null,
      isActive: item.is_active !== undefined ? item.is_active : (item.isActive ?? true),
      createdAt: item.created_at || item.createdAt || new Date().toISOString(),
    }));

    saveLocalColleges(formatted);
    return formatted;
  } catch (err) {
    console.warn('Supabase fetch failed, using local storage cache:', err);
    return getLocalColleges();
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

  // 2. Sync to Supabase
  const { error } = await supabase.from('colleges').insert([
    {
      id: record.id,
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
      logo_url: record.logoUrl,
      admin_email: record.adminEmail,
      admin_name: record.adminName,
      admin_uid: record.adminUid,
      is_active: record.isActive,
      updated_at: new Date().toISOString(),
    }
  ]);

  if (error) {
    console.error('Supabase insert error:', error.message);
    throw new Error(error.message);
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

  // Attempt Supabase update
  const supabasePayload: Record<string, any> = {};
  if (updates.name !== undefined) supabasePayload.name = updates.name;
  if (updates.code !== undefined) supabasePayload.code = updates.code;
  if (updates.domain !== undefined) supabasePayload.domain = updates.domain;
  if (updates.address !== undefined) supabasePayload.address = updates.address;
  if (updates.city !== undefined) supabasePayload.city = updates.city;
  if (updates.state !== undefined) supabasePayload.state = updates.state;
  if (updates.country !== undefined) supabasePayload.country = updates.country;
  if (updates.phone !== undefined) supabasePayload.phone = updates.phone;
  if (updates.email !== undefined) supabasePayload.email = updates.email;
  if (updates.website !== undefined) supabasePayload.website = updates.website;
  if (updates.logoUrl !== undefined) supabasePayload.logo_url = updates.logoUrl;
  if (updates.adminEmail !== undefined) supabasePayload.admin_email = updates.adminEmail;
  if (updates.adminName !== undefined) supabasePayload.admin_name = updates.adminName;
  if (updates.adminUid !== undefined) supabasePayload.admin_uid = updates.adminUid;
  if (updates.isActive !== undefined) supabasePayload.is_active = updates.isActive;

  const { error } = await supabase.from('colleges').update(supabasePayload).eq('id', id);
  if (error) {
    console.error('Supabase update error:', error.message);
    throw new Error(error.message);
  }

  return current;
}

export async function deleteCollege(id: string): Promise<CollegeRecord[]> {
  const current = getLocalColleges();
  const filtered = current.filter(c => c.id !== id);
  saveLocalColleges(filtered);

  const { error } = await supabase.from('colleges').delete().eq('id', id);
  if (error) {
    console.error('Supabase delete error:', error.message);
    throw new Error(error.message);
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

export async function recordAuthedUser(user: AuthedUserRecord): Promise<AuthedUserRecord> {
  const users = getLocalAuthedUsers();
  const existingIndex = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
  
  let finalUser = { ...user, role: 'USER' };

  // Sync to Supabase authed_users
  const { error: upsertError } = await supabase.from('authed_users').upsert([
    {
      uid: user.uid,
      email: user.email,
      display_name: user.displayName,
      photo_url: user.photoURL,
      provider: user.provider,
      last_login: user.lastLogin,
    }
  ], { onConflict: 'uid' });

  if (!upsertError) {
    // Fetch the user back to get their server-side role and college_id
    const { data } = await supabase.from('authed_users').select('role, college_id').eq('uid', user.uid).single();
    if (data) {
      if (data.role) finalUser.role = data.role;
      if (data.college_id) (finalUser as any).college_id = data.college_id;
    }
  } else {
    console.error('Supabase authed_user record error:', upsertError.message);
    if (upsertError.code === '23505') {
      throw new Error('Email already exists with a different UID. Please ask a Super Admin to delete your old record before logging in again.');
    }
    throw new Error('Failed to record user in database: ' + upsertError.message);
  }

  // Update local storage with the final user (including role)
  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...finalUser, lastLogin: new Date().toISOString() };
  } else {
    users.unshift(finalUser);
  }
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

  return finalUser;
}

export async function fetchAuthedUsers(): Promise<AuthedUserRecord[]> {
  try {
    const { data, error } = await supabase.from('authed_users').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      const formatted: AuthedUserRecord[] = data.map((d: any) => ({
        uid: d.uid || d.id,
        email: d.email,
        displayName: d.display_name || d.displayName || null,
        photoURL: d.photo_url || d.photoURL || null,
        provider: d.provider || 'google',
        lastLogin: d.last_login || d.lastLogin || new Date().toISOString(),
        role: d.role,
        college_id: d.college_id
      }));
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(formatted));
      return formatted;
    }
  } catch (err) {
    console.warn('Supabase fetch authed users error:', err);
  }
  return getLocalAuthedUsers();
}

export async function deleteAuthedUser(uid: string): Promise<void> {
  try {
    const { error } = await supabase.from('authed_users').delete().eq('uid', uid);
    if (error) {
      console.warn('Supabase delete authed user warning:', error.message);
    }
  } catch (err) {
    console.warn('Supabase delete authed user failed:', err);
  }
  const users = getLocalAuthedUsers().filter(u => u.uid !== uid);
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

// ====== College Admin: Departments ======

export interface DepartmentRecord {
  id: string;
  college_id: string;
  name: string;
  code: string;
  hod_uid: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const fetchDepartments = async (collegeId: string): Promise<DepartmentRecord[]> => {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('college_id', collegeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
  return data || [];
};

export const createDepartment = async (department: Omit<DepartmentRecord, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('departments')
    .insert([department])
    .select();

  if (error) {
    console.error('Error creating department:', error);
    throw error;
  }
  return data ? data[0] : null;
};

export const updateDepartment = async (id: string, updates: Partial<DepartmentRecord>) => {
  updates.updated_at = new Date().toISOString();
  const { data, error } = await supabase
    .from('departments')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating department:', error);
    throw error;
  }
  return data ? data[0] : null;
};

// ====== College Admin: Programs ======

export interface ProgramRecord {
  id: string;
  department_id: string;
  name: string;
  type: string;
  duration_years: number;
  is_active: boolean;
  created_at?: string;
}

export const fetchPrograms = async (departmentId: string): Promise<ProgramRecord[]> => {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('department_id', departmentId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching programs:', error);
    return [];
  }
  return data || [];
};

export const createProgram = async (programData: Omit<ProgramRecord, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('programs')
    .insert([programData])
    .select();

  if (error) {
    console.error('Error creating program:', error);
    throw error;
  }
  return data ? data[0] : null;
};

// ====== College Admin: Batches ======

export interface BatchRecord {
  id: string;
  program_id: string;
  start_year: number;
  end_year: number;
  is_active: boolean;
  created_at?: string;
}

export const fetchBatches = async (programId: string): Promise<BatchRecord[]> => {
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .eq('program_id', programId)
    .order('start_year', { ascending: false });

  if (error) {
    console.error('Error fetching batches:', error);
    return [];
  }
  return data || [];
};

export const createBatch = async (batchData: Omit<BatchRecord, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('batches')
    .insert([batchData])
    .select();

  if (error) {
    console.error('Error creating batch:', error);
    throw error;
  }
  return data ? data[0] : null;
};

// ====== College Admin: Classes ======

export interface ClassRecord {
  id: string;
  batch_id: string;
  name: string;
  current_semester: number;
  faculty_uid: string | null;
  is_active: boolean;
  created_at?: string;
}

export const fetchClasses = async (batchId: string): Promise<ClassRecord[]> => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('batch_id', batchId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
  return data || [];
};

export const createClass = async (classData: Omit<ClassRecord, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('classes')
    .insert([classData])
    .select();

  if (error) {
    console.error('Error creating class:', error);
    throw error;
  }
  return data ? data[0] : null;
};

// ====== College Admin: Subjects ======

export interface SubjectRecord {
  id: string;
  department_id: string;
  name: string;
  code: string;
  credits: number;
  semester_number: number;
  is_active: boolean;
  created_at?: string;
}

export const fetchSubjects = async (departmentId: string): Promise<SubjectRecord[]> => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('department_id', departmentId)
    .order('semester_number', { ascending: true });

  if (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
  return data || [];
};

export const createSubject = async (subjectData: Omit<SubjectRecord, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('subjects')
    .insert([subjectData])
    .select();

  if (error) {
    console.error('Error creating subject:', error);
    throw error;
  }
  return data ? data[0] : null;
};

// ====== College Admin: Users ======

export interface UserFilters {
  college_id: string;
  role: 'HOD' | 'FACULTY' | 'STUDENT';
  department_id?: string;
}

export const fetchUsers = async (filters: UserFilters) => {
  let query = supabase
    .from('authed_users')
    .select('*')
    .eq('college_id', filters.college_id)
    .eq('role', filters.role);

  if (filters.department_id) {
    query = query.eq('department_id', filters.department_id);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) {
    console.error(`Error fetching ${filters.role}s:`, error);
    return [];
  }
  return data || [];
};

export const updateUserProfile = async (uid: string, updates: any) => {
  const { data, error } = await supabase
    .from('authed_users')
    .update(updates)
    .eq('uid', uid)
    .select();

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
  return data ? data[0] : null;
};

// ====== Dashboard Stats ======

export const fetchCollegeStats = async (collegeId: string) => {
  const [
    { count: students },
    { count: faculty },
    { count: hods },
    { count: depts },
  ] = await Promise.all([
    supabase.from('authed_users').select('uid', { count: 'exact', head: true }).eq('college_id', collegeId).eq('role', 'STUDENT'),
    supabase.from('authed_users').select('uid', { count: 'exact', head: true }).eq('college_id', collegeId).eq('role', 'FACULTY'),
    supabase.from('authed_users').select('uid', { count: 'exact', head: true }).eq('college_id', collegeId).eq('role', 'HOD'),
    supabase.from('departments').select('id', { count: 'exact', head: true }).eq('college_id', collegeId)
  ]);

  // Let's get department ids first if we need classes/programs
  const { data: deptData } = await supabase.from('departments').select('id').eq('college_id', collegeId);
  const deptIds = deptData?.map(d => d.id) || [];
  
  let programsCount = 0;
  let subjectsCount = 0;
  if (deptIds.length > 0) {
    const { count: pCount } = await supabase.from('programs').select('id', { count: 'exact', head: true }).in('department_id', deptIds);
    programsCount = pCount || 0;
    
    const { count: sCount } = await supabase.from('subjects').select('id', { count: 'exact', head: true }).in('department_id', deptIds);
    subjectsCount = sCount || 0;
  }

  return {
    students: students || 0,
    faculty: faculty || 0,
    hods: hods || 0,
    departments: depts || 0,
    programs: programsCount,
    subjects: subjectsCount
  };
};
