import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export type LeaveReasonCategory = 'HEALTH' | 'FAMILY' | 'ACADEMIC' | 'OTHER';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface StudentLeave {
  id: string;
  college_id: string;
  class_id: string;
  student_uid: string;
  student_name: string;
  register_number: string | null;
  reason_category: LeaveReasonCategory;
  explanation: string;
  from_date: string;
  to_date: string;
  status: LeaveStatus;
  reviewed_by_uid: string | null;
  reviewed_by_name: string | null;
  review_remarks: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  class_name?: string;
}

export interface ApplyLeavePayload {
  reason_category: LeaveReasonCategory;
  explanation: string;
  from_date: string;
  to_date: string;
}

export interface ReviewLeavePayload {
  status: 'APPROVED' | 'REJECTED';
  remarks?: string;
}

async function getAuthToken(): Promise<string | null> {
  try {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
  } catch (e) {
    console.warn('Could not get Firebase token for leave request', e);
  }
  return null;
}

export const leaveService = {
  /**
   * Student applies for leave
   */
  async applyLeave(payload: ApplyLeavePayload): Promise<StudentLeave> {
    const token = await getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/leaves`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      throw new Error(errorJson?.error?.message || errorJson?.message || `Failed to submit leave (HTTP ${res.status})`);
    }

    const json = await res.json();
    return json.data as StudentLeave;
  },

  /**
   * Get all leaves applied by logged-in student
   */
  async getMyLeaves(): Promise<StudentLeave[]> {
    try {
      const token = await getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/leaves/my`, {
        method: 'GET',
        headers,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data as StudentLeave[];
        }
      }
    } catch (err) {
      console.error('Failed to fetch student leaves:', err);
    }
    return [];
  },

  /**
   * Get leaves for a class (viewable by class incharge and subject teachers)
   */
  async getClassLeaves(
    classId: string,
    options?: { date?: string; status?: string }
  ): Promise<StudentLeave[]> {
    try {
      const token = await getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const query = new URLSearchParams();
      if (options?.date) query.append('date', options.date);
      if (options?.status) query.append('status', options.status);

      const res = await fetch(`${API_BASE_URL}/leaves/class/${classId}?${query.toString()}`, {
        method: 'GET',
        headers,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data as StudentLeave[];
        }
      }
    } catch (err) {
      console.error('Failed to fetch class leaves:', err);
    }
    return [];
  },

  /**
   * Review (Approve or Reject) leave application — STRICTLY FOR CLASS INCHARGE
   */
  async reviewLeave(leaveId: string, payload: ReviewLeavePayload): Promise<StudentLeave> {
    const token = await getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/leaves/${leaveId}/review`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      throw new Error(errorJson?.error?.message || errorJson?.message || `Failed to review leave (HTTP ${res.status})`);
    }

    const json = await res.json();
    return json.data as StudentLeave;
  },
};
