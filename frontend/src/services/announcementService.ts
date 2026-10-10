import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export type TargetAudienceType = 'HOD' | 'FACULTY' | 'CLASS_INCHARGE' | 'STUDENT' | 'ALL';

export interface Announcement {
  id: string;
  college_id: string;
  title: string;
  description: string;
  image_url: string | null;
  target_audience: TargetAudienceType[];
  category: 'GENERAL' | 'ACADEMIC' | 'URGENT' | 'EVENT' | 'EXAMINATION' | 'ADMINISTRATIVE';
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  is_pinned: boolean;
  is_active: boolean;
  expires_at?: string | null;
  created_by_uid?: string | null;
  created_by_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAnnouncementPayload {
  college_id: string;
  title: string;
  description: string;
  image_url?: string | null;
  target_audience: TargetAudienceType[];
  category?: 'GENERAL' | 'ACADEMIC' | 'URGENT' | 'EVENT' | 'EXAMINATION' | 'ADMINISTRATIVE';
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  is_pinned?: boolean;
  is_active?: boolean;
  expires_at?: string | null;
  author_name?: string;
}

export interface UpdateAnnouncementPayload {
  title?: string;
  description?: string;
  image_url?: string | null;
  target_audience?: TargetAudienceType[];
  category?: 'GENERAL' | 'ACADEMIC' | 'URGENT' | 'EVENT' | 'EXAMINATION' | 'ADMINISTRATIVE';
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  is_pinned?: boolean;
  is_active?: boolean;
  expires_at?: string | null;
}

// Local storage seed for demo and offline persistence across tabs
const STORAGE_KEY = 'college_lms_announcements_cache';

const INITIAL_DEMO_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-demo-001',
    college_id: 'default',
    title: 'Semester End Examination Schedule & Hall Ticket Issuance',
    description: 'The controller of examinations has published the final timetable for the upcoming End Semester Examinations. All department heads and subject faculties are requested to finalize internal assessments by next Friday. Students must clear library dues before collecting hall tickets from the administrative office.',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    target_audience: ['HOD', 'FACULTY', 'STUDENT'],
    category: 'EXAMINATION',
    priority: 'HIGH',
    is_pinned: true,
    is_active: true,
    created_by_name: 'Controller of Examinations',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'ann-demo-002',
    college_id: 'default',
    title: 'Mandatory Class Incharge Briefing: Attendance Condonation & Defaulters',
    description: 'All appointed Class Incharges are required to attend an urgent review session in Conference Hall A this Thursday at 3:30 PM. We will review student attendance registers, condonation medical affidavits, and issue formal notices to students holding below 75% aggregate attendance.',
    image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    target_audience: ['CLASS_INCHARGE'],
    category: 'ADMINISTRATIVE',
    priority: 'URGENT',
    is_pinned: true,
    is_active: true,
    created_by_name: 'Academic Dean Office',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'ann-demo-003',
    college_id: 'default',
    title: 'HOD Council Meeting: Curriculum Revision & Lab Infrastructure Upgrade',
    description: 'A meeting of the Board of Studies and Department Heads is scheduled for Monday at 10:00 AM in the Principal Conference Suite. Agenda includes reviewing autonomous syllabus updates, AI & ML computing lab procurement, and faculty performance appraisals.',
    image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    target_audience: ['HOD'],
    category: 'ACADEMIC',
    priority: 'NORMAL',
    is_pinned: false,
    is_active: true,
    created_by_name: 'Office of the Principal',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'ann-demo-004',
    college_id: 'default',
    title: 'Annual Technical Symposium & Hackathon Registrations Open',
    description: 'Registrations are now open for the Annual Inter-College Technical Symposium & 24-Hour AI Hackathon. Cash prizes up to ₹1,50,000 to be won. Teams of 2 to 4 students can register through the student portal before October 25th.',
    image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    target_audience: ['STUDENT'],
    category: 'EVENT',
    priority: 'NORMAL',
    is_pinned: false,
    is_active: true,
    created_by_name: 'Student Affairs Council',
    created_at: new Date(Date.now() - 3600000 * 60).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 60).toISOString(),
  },
  {
    id: 'ann-demo-005',
    college_id: 'default',
    title: 'Faculty Research Grant Applications for Academic Year 2026-27',
    description: 'Internal Research Promotion Grants of up to ₹5,00,000 per project are now invited from all full-time faculty members. Proposals in emerging technological domains, interdisciplinary sciences, and educational pedagogies must be submitted to the R&D cell by month end.',
    image_url: null,
    target_audience: ['FACULTY'],
    category: 'ACADEMIC',
    priority: 'NORMAL',
    is_pinned: false,
    is_active: true,
    created_by_name: 'R&D Directorate',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
];

function getStoredAnnouncements(): Announcement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read announcements from localStorage', e);
  }
  return INITIAL_DEMO_ANNOUNCEMENTS;
}

function saveStoredAnnouncements(list: Announcement[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to write announcements to localStorage', e);
  }
}

async function getAuthToken(): Promise<string | null> {
  try {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
  } catch (e) {
    console.warn('Could not get Firebase token for announcement request', e);
  }
  return null;
}

export const announcementService = {
  /**
   * Fetch announcements for a given college and audience criteria
   */
  async getAnnouncements(params: {
    college_id?: string;
    role?: 'COLLEGE_ADMIN' | 'HOD' | 'FACULTY' | 'STUDENT' | string;
    isClassIncharge?: boolean;
    targetAudience?: string;
    category?: string;
    search?: string;
    includeInactive?: boolean;
  }): Promise<Announcement[]> {
    const collegeId = params.college_id || 'default';
    const query = new URLSearchParams();
    query.append('college_id', collegeId);
    if (params.role) query.append('role', params.role);
    if (params.isClassIncharge) query.append('isClassIncharge', 'true');
    if (params.targetAudience) query.append('targetAudience', params.targetAudience);
    if (params.category && params.category !== 'ALL') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.includeInactive) query.append('includeInactive', 'true');

    try {
      const token = await getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/announcements?${query.toString()}`, {
        method: 'GET',
        headers,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          // Merge with local storage for seamless sync
          const local = getStoredAnnouncements();
          const serverIds = new Set(json.data.map((a: Announcement) => a.id));
          const uniqueLocal = local.filter((a) => !serverIds.has(a.id));
          const combined = [...json.data, ...uniqueLocal];
          saveStoredAnnouncements(combined);
          return combined;
        }
      }
    } catch (err) {
      console.warn('Network request to /api/announcements failed, falling back to local storage cache:', err);
    }

    // Local filter fallback
    const all = getStoredAnnouncements();
    return all.filter((a) => {
      // Filter by active status
      if (!params.includeInactive && !a.is_active) return false;

      // Filter by role / target audience
      const role = params.role?.toUpperCase();
      if (role && role !== 'COLLEGE_ADMIN' && role !== 'SUPER_ADMIN') {
        if (role === 'HOD') {
          return a.target_audience.includes('HOD') || a.target_audience.includes('ALL');
        }
        if (role === 'FACULTY') {
          if (params.isClassIncharge) {
            return (
              a.target_audience.includes('FACULTY') ||
              a.target_audience.includes('CLASS_INCHARGE') ||
              a.target_audience.includes('ALL')
            );
          }
          // Non-class-incharge faculty:
          return a.target_audience.includes('FACULTY') || a.target_audience.includes('ALL');
        }
        if (role === 'STUDENT') {
          return a.target_audience.includes('STUDENT') || a.target_audience.includes('ALL');
        }
      }

      if (params.targetAudience && params.targetAudience !== 'ALL') {
        if (!a.target_audience.includes(params.targetAudience as TargetAudienceType)) return false;
      }

      if (params.category && params.category !== 'ALL') {
        if (a.category !== params.category) return false;
      }

      if (params.search) {
        const q = params.search.toLowerCase();
        return a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
      }

      return true;
    });
  },

  /**
   * Create an announcement
   */
  async createAnnouncement(payload: CreateAnnouncementPayload): Promise<Announcement> {
    const token = await getAuthToken();
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/announcements`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const created = json.data as Announcement;
          const current = getStoredAnnouncements();
          saveStoredAnnouncements([created, ...current]);
          return created;
        }
      }
    } catch (e) {
      console.warn('Network call to create announcement failed, falling back to local persistence:', e);
    }

    // Local fallback creation
    const newRecord: Announcement = {
      id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      college_id: payload.college_id,
      title: payload.title.trim(),
      description: payload.description.trim(),
      image_url: payload.image_url || null,
      target_audience: payload.target_audience,
      category: payload.category || 'GENERAL',
      priority: payload.priority || 'NORMAL',
      is_pinned: Boolean(payload.is_pinned),
      is_active: payload.is_active !== undefined ? Boolean(payload.is_active) : true,
      expires_at: payload.expires_at || null,
      created_by_name: payload.author_name || 'College Administration',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const current = getStoredAnnouncements();
    saveStoredAnnouncements([newRecord, ...current]);
    return newRecord;
  },

  /**
   * Update an announcement
   */
  async updateAnnouncement(id: string, payload: UpdateAnnouncementPayload, collegeId = 'default'): Promise<Announcement> {
    const token = await getAuthToken();
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ...payload, college_id: collegeId }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const updated = json.data as Announcement;
          const current = getStoredAnnouncements();
          const idx = current.findIndex((a) => a.id === id);
          if (idx !== -1) {
            current[idx] = updated;
            saveStoredAnnouncements(current);
          }
          return updated;
        }
      }
    } catch (e) {
      console.warn('Network call to update announcement failed, falling back to local persistence:', e);
    }

    // Local fallback update
    const current = getStoredAnnouncements();
    const idx = current.findIndex((a) => a.id === id);
    if (idx !== -1) {
      current[idx] = {
        ...current[idx],
        ...payload,
        updated_at: new Date().toISOString(),
      };
      saveStoredAnnouncements(current);
      return current[idx];
    }
    throw new Error('Announcement not found');
  },

  /**
   * Delete an announcement
   */
  async deleteAnnouncement(id: string, collegeId = 'default'): Promise<boolean> {
    const token = await getAuthToken();
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${API_BASE_URL}/announcements/${id}?college_id=${encodeURIComponent(collegeId)}`, {
        method: 'DELETE',
        headers,
      });
    } catch (e) {
      console.warn('Network call to delete announcement failed, continuing with local removal:', e);
    }

    const current = getStoredAnnouncements();
    const filtered = current.filter((a) => a.id !== id);
    saveStoredAnnouncements(filtered);
    return true;
  },

  /**
   * Upload an image to Cloudinary via backend upload endpoint
   */
  async uploadImage(file: File): Promise<string> {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'college_lms/announcements');

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      // Try fallback to /api/upload
      const res2 = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      if (!res2.ok) {
        throw new Error('Failed to upload image to server');
      }
      const json2 = await res2.json();
      return json2.data?.url || json2.data?.secureUrl;
    }

    const json = await res.json();
    return json.data?.url || json.data?.secureUrl;
  },
};
