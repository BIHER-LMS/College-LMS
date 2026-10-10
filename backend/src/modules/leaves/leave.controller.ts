import { Response, NextFunction } from 'express';
import { leaveService } from './leave.service';
import { sendSuccess, sendError, ErrorCodes } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class LeaveController {
  async applyLeave(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const studentUid = req.firebaseUid || req.user?.firebaseUid || req.user?.id || (req.body.student_uid as string);
      if (!studentUid) {
        return sendError(res, 401, ErrorCodes.UNAUTHORIZED, 'Authentication required to apply for leave');
      }

      const { reason_category, explanation, from_date, to_date } = req.body;
      const created = await leaveService.applyLeave(studentUid, {
        reason_category,
        explanation,
        from_date,
        to_date,
      });

      return sendSuccess(res, created, 201);
    } catch (err) {
      return next(err);
    }
  }

  async getMyLeaves(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const studentUid = req.firebaseUid || req.user?.firebaseUid || req.user?.id || (req.query.student_uid as string);
      if (!studentUid) {
        return sendError(res, 401, ErrorCodes.UNAUTHORIZED, 'Authentication required');
      }

      const list = await leaveService.getStudentLeaves(studentUid);
      return sendSuccess(res, list, 200);
    } catch (err) {
      return next(err);
    }
  }

  async getClassLeaves(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;
      if (!classId) {
        return sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'classId is required');
      }

      const date = req.query.date as string | undefined;
      const status = req.query.status as string | undefined;

      const list = await leaveService.getClassLeaves(classId, { date, status });
      return sendSuccess(res, list, 200);
    } catch (err) {
      return next(err);
    }
  }

  async reviewLeave(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const facultyUid = req.firebaseUid || req.user?.firebaseUid || req.user?.id || (req.body.faculty_uid as string);
      if (!facultyUid) {
        return sendError(res, 401, ErrorCodes.UNAUTHORIZED, 'Faculty authentication required');
      }

      const { status, remarks } = req.body;
      const updated = await leaveService.reviewLeave(id, facultyUid, {
        status,
        remarks,
      });

      return sendSuccess(res, updated, 200);
    } catch (err) {
      return next(err);
    }
  }
}

export const leaveController = new LeaveController();
