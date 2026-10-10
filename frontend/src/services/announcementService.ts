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
  college_id?: string;
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

// Purge any residual demo dummy data from user's browser localStorage
try {
  const legacyKey = 'college_lms_announcements_cache';
  if (typeof window !== 'undefined' && window.localStorage) {
    const raw = localStorage.getItem(legacyKey);
    if (raw && raw.includes('ann-demo-')) {
      localStorage.removeItem(legacyKey);
    }
  }
} catch {
  // Ignore storage read errors
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
   * Fetch announcements directly from PostgreSQL database via API
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
    const query = new URLSearchParams();
    if (params.college_id && params.college_id !== 'undefined') {
      query.append('college_id', params.college_id);
    }
    if (params.role) query.append('role', params.role);
    if (params.isClassIncharge) query.append('isClassIncharge', 'true');
    if (params.targetAudience && params.targetAudience !== 'ALL') query.append('targetAudience', params.targetAudience);
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
        if (json.success && Array.isArray(json.data)) {
          return json.data as Announcement[];
        }
      } else {
        console.warn(`Failed to fetch announcements from DB: HTTP ${res.status}`);
      }
    } catch (err) {
      console.error('Network request to /api/announcements failed:', err);
    }

    return [];
  },

  /**
   * Create an announcement strictly in PostgreSQL database
   */
  async createAnnouncement(payload: CreateAnnouncementPayload): Promise<Announcement> {
    const token = await getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/announcements`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      throw new Error(errorJson?.message || `Failed to create announcement (HTTP ${res.status})`);
    }

    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.message || 'Server did not return created announcement');
    }

    return json.data as Announcement;
  },

  /**
   * Update an announcement in PostgreSQL database
   */
  async updateAnnouncement(id: string, payload: UpdateAnnouncementPayload, collegeId?: string): Promise<Announcement> {
    const token = await getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...payload, college_id: collegeId }),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      throw new Error(errorJson?.message || `Failed to update announcement (HTTP ${res.status})`);
    }

    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.message || 'Server did not return updated announcement');
    }

    return json.data as Announcement;
  },

  /**
   * Delete an announcement from PostgreSQL database
   */
  async deleteAnnouncement(id: string, collegeId?: string): Promise<boolean> {
    const token = await getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const query = collegeId ? `?college_id=${encodeURIComponent(collegeId)}` : '';
    const res = await fetch(`${API_BASE_URL}/announcements/${id}${query}`, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      throw new Error(errorJson?.message || `Failed to delete announcement (HTTP ${res.status})`);
    }

    return true;
  },

  /**
   * Upload an image to Cloudinary via backend storage endpoint
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
      // Fallback try to /api/upload
      const res2 = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res2.ok) {
        const errorJson = await res2.json().catch(() => null);
        throw new Error(errorJson?.message || 'Failed to upload image to Cloudinary');
      }

      const json2 = await res2.json();
      const uploadedUrl = json2.data?.url || json2.data?.secureUrl;
      if (!uploadedUrl) {
        throw new Error('Cloudinary response missing secure URL');
      }
      return uploadedUrl;
    }

    const json = await res.json();
    const uploadedUrl = json.data?.url || json.data?.secureUrl;
    if (!uploadedUrl) {
      throw new Error('Cloudinary response missing secure URL');
    }
    return uploadedUrl;
  },
};
