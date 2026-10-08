import { Request, Response, NextFunction } from 'express';
import { attendanceService } from '../services/attendanceService';
import { sendSuccess } from '../utils/response';

export class AttendanceController {
  async getAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await attendanceService.getAttendanceList({
        studentId: req.query.studentId as string,
        subjectId: req.query.subjectId as string,
        date: req.query.date as string,
      });
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }

  async getAttendanceSummary(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await attendanceService.getAttendanceSummary();
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }
}

export const attendanceController = new AttendanceController();
