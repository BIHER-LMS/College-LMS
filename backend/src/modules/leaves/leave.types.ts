export type LeaveReasonCategory = 'HEALTH' | 'FAMILY' | 'ACADEMIC' | 'OTHER';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface StudentLeaveRecord {
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

export interface CreateLeaveInput {
  reason_category: LeaveReasonCategory;
  explanation: string;
  from_date: string;
  to_date: string;
}

export interface ReviewLeaveInput {
  status: 'APPROVED' | 'REJECTED';
  remarks?: string;
}
