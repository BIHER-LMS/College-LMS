import prisma from '../../config/database';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';
import { ErrorCodes } from '../../utils/response';
import type { StudentLeaveRecord, CreateLeaveInput, ReviewLeaveInput } from './leave.types';

export class LeaveService {
  /**
   * Apply for leave by student
   */
  async applyLeave(studentUid: string, input: CreateLeaveInput): Promise<StudentLeaveRecord> {
    const { reason_category, explanation, from_date, to_date } = input;

    if (!reason_category) {
      throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Reason category is required (HEALTH, FAMILY, ACADEMIC, OTHER)');
    }

    if (!explanation || explanation.trim().length < 3) {
      throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Please explain the reason for your leave in a few words');
    }

    if (!from_date || !to_date) {
      throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'From Date and To Date are required');
    }

    // Lookup student details from authed_users
    const students: any[] = await prisma.$queryRawUnsafe(
      `SELECT uid, display_name, email, register_number, class_id, college_id
       FROM authed_users WHERE uid = $1 LIMIT 1`,
      studentUid
    );

    if (!students || students.length === 0) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, 'Student profile not found');
    }

    const student = students[0];
    if (!student.class_id) {
      throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Student is not assigned to any class');
    }

    const studentName = student.display_name || student.email.split('@')[0];
    const collegeId = student.college_id || 'col-1790654578727-zhdd';

    const rows: any = await prisma.$queryRawUnsafe(
      `
      INSERT INTO student_leaves (
        college_id, class_id, student_uid, student_name, register_number,
        reason_category, explanation, from_date, to_date, status,
        created_at, updated_at
      )
      VALUES ($1, $2::uuid, $3, $4, $5, $6, $7, $8::date, $9::date, 'PENDING', NOW(), NOW())
      RETURNING
        id, college_id, class_id, student_uid, student_name, register_number,
        reason_category, explanation,
        to_char(from_date, 'YYYY-MM-DD') as from_date,
        to_char(to_date, 'YYYY-MM-DD') as to_date,
        status, reviewed_by_uid, reviewed_by_name, review_remarks,
        reviewed_at, created_at, updated_at
      `,
      collegeId,
      student.class_id,
      studentUid,
      studentName,
      student.register_number || null,
      reason_category,
      explanation.trim(),
      from_date,
      to_date
    );

    if (rows && rows.length > 0) {
      return rows[0] as StudentLeaveRecord;
    }

    throw new AppError(500, ErrorCodes.INTERNAL_ERROR, 'Failed to save leave application');
  }

  /**
   * Get all leaves submitted by a specific student
   */
  async getStudentLeaves(studentUid: string): Promise<StudentLeaveRecord[]> {
    try {
      const rows: any = await prisma.$queryRawUnsafe(
        `
        SELECT
          l.id, l.college_id, l.class_id, l.student_uid, l.student_name, l.register_number,
          l.reason_category, l.explanation,
          to_char(l.from_date, 'YYYY-MM-DD') as from_date,
          to_char(l.to_date, 'YYYY-MM-DD') as to_date,
          l.status, l.reviewed_by_uid, l.reviewed_by_name, l.review_remarks,
          l.reviewed_at, l.created_at, l.updated_at,
          c.name as class_name
        FROM student_leaves l
        LEFT JOIN classes c ON l.class_id = c.id
        WHERE l.student_uid = $1
        ORDER BY l.created_at DESC
        `,
        studentUid
      );

      return (rows || []) as StudentLeaveRecord[];
    } catch (err: any) {
      logger.error('LeaveService.getStudentLeaves error:', { error: err.message });
      return [];
    }
  }

  /**
   * Get all leaves for a class (viewable by class incharge and subject teachers)
   */
  async getClassLeaves(
    classId: string,
    options?: { date?: string; status?: string }
  ): Promise<StudentLeaveRecord[]> {
    try {
      let query = `
        SELECT
          l.id, l.college_id, l.class_id, l.student_uid, l.student_name, l.register_number,
          l.reason_category, l.explanation,
          to_char(l.from_date, 'YYYY-MM-DD') as from_date,
          to_char(l.to_date, 'YYYY-MM-DD') as to_date,
          l.status, l.reviewed_by_uid, l.reviewed_by_name, l.review_remarks,
          l.reviewed_at, l.created_at, l.updated_at,
          c.name as class_name
        FROM student_leaves l
        LEFT JOIN classes c ON l.class_id = c.id
        WHERE l.class_id = $1::uuid
      `;
      const params: any[] = [classId];
      let paramIdx = 2;

      if (options?.date) {
        query += ` AND l.from_date <= $${paramIdx}::date AND l.to_date >= $${paramIdx}::date`;
        params.push(options.date);
        paramIdx++;
      }

      if (options?.status && options.status !== 'ALL') {
        query += ` AND l.status = $${paramIdx}`;
        params.push(options.status);
        paramIdx++;
      }

      query += ` ORDER BY l.created_at DESC`;

      const rows: any = await prisma.$queryRawUnsafe(query, ...params);
      return (rows || []) as StudentLeaveRecord[];
    } catch (err: any) {
      logger.error('LeaveService.getClassLeaves error:', { error: err.message });
      return [];
    }
  }

  /**
   * Review (Approve / Reject) a leave application — STRICTLY RESTRICTED TO CLASS INCHARGE
   */
  async reviewLeave(
    leaveId: string,
    facultyUid: string,
    input: ReviewLeaveInput
  ): Promise<StudentLeaveRecord> {
    const { status, remarks } = input;
    if (status !== 'APPROVED' && status !== 'REJECTED') {
      throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Status must be APPROVED or REJECTED');
    }

    // 1. Fetch the leave record
    const leaves: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM student_leaves WHERE id = $1::uuid LIMIT 1`,
      leaveId
    );

    if (!leaves || leaves.length === 0) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, 'Leave application not found');
    }

    const leave = leaves[0];

    // 2. Security Check: Verify that this faculty member is the designated Class Incharge of this class
    const classes: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, name, faculty_uid FROM classes WHERE id = $1::uuid LIMIT 1`,
      leave.class_id
    );

    if (!classes || classes.length === 0) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, 'Associated class not found');
    }

    const cls = classes[0];
    if (cls.faculty_uid !== facultyUid) {
      throw new AppError(
        403,
        ErrorCodes.FORBIDDEN,
        'Authorization Denied: Only the appointed Class Incharge can approve or reject student leaves for this class.'
      );
    }

    // 3. Get reviewing faculty name
    const reviewers: any[] = await prisma.$queryRawUnsafe(
      `SELECT display_name, email FROM authed_users WHERE uid = $1 LIMIT 1`,
      facultyUid
    );
    const reviewerName = reviewers?.[0]?.display_name || reviewers?.[0]?.email?.split('@')[0] || 'Class Incharge';

    // 4. Update the leave status
    const updatedRows: any = await prisma.$queryRawUnsafe(
      `
      UPDATE student_leaves
      SET
        status = $1,
        reviewed_by_uid = $2,
        reviewed_by_name = $3,
        review_remarks = $4,
        reviewed_at = NOW(),
        updated_at = NOW()
      WHERE id = $5::uuid
      RETURNING
        id, college_id, class_id, student_uid, student_name, register_number,
        reason_category, explanation,
        to_char(from_date, 'YYYY-MM-DD') as from_date,
        to_char(to_date, 'YYYY-MM-DD') as to_date,
        status, reviewed_by_uid, reviewed_by_name, review_remarks,
        reviewed_at, created_at, updated_at
      `,
      status,
      facultyUid,
      reviewerName,
      remarks?.trim() || null,
      leaveId
    );

    if (updatedRows && updatedRows.length > 0) {
      return updatedRows[0] as StudentLeaveRecord;
    }

    throw new AppError(500, ErrorCodes.INTERNAL_ERROR, 'Failed to update leave application');
  }

  /**
   * Helper to retrieve active leave map for a class on a specific date
   * Used to annotate student attendance records with real-time leave status
   */
  async getLeavesMapForClassDate(
    classId: string,
    date: string
  ): Promise<Map<string, { id: string; reasonCategory: string; explanation: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; fromDate: string; toDate: string; reviewedByName?: string | null }>> {
    const map = new Map<string, any>();
    try {
      const rows: any = await prisma.$queryRawUnsafe(
        `
        SELECT
          id, student_uid, reason_category, explanation, status,
          to_char(from_date, 'YYYY-MM-DD') as from_date,
          to_char(to_date, 'YYYY-MM-DD') as to_date,
          reviewed_by_name
        FROM student_leaves
        WHERE class_id = $1::uuid
          AND from_date <= $2::date
          AND to_date >= $2::date
        `,
        classId,
        date
      );

      if (Array.isArray(rows)) {
        rows.forEach((r) => {
          map.set(r.student_uid, {
            id: r.id,
            reasonCategory: r.reason_category,
            explanation: r.explanation,
            status: r.status,
            fromDate: r.from_date,
            toDate: r.to_date,
            reviewedByName: r.reviewed_by_name,
          });
        });
      }
    } catch (err: any) {
      logger.warn('LeaveService.getLeavesMapForClassDate error:', { error: err.message });
    }
    return map;
  }
}

export const leaveService = new LeaveService();
