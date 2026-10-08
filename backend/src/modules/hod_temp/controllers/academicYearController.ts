import { Request, Response, NextFunction } from 'express';
import { academicYearService } from '../services/academicYearService';
import { sendSuccess } from '../utils/response';

export class AcademicYearController {
  async getAcademicYears(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await academicYearService.getAcademicYears();
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }

  async createAcademicYear(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await academicYearService.createAcademicYear(req.body);
      return sendSuccess(res, data, 201, 'Academic year created successfully');
    } catch (err) {
      return next(err);
    }
  }

  async getSemesters(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await academicYearService.getSemesters(req.query.academicYearId as string);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }

  async createSemester(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await academicYearService.createSemester(req.body);
      return sendSuccess(res, data, 201, 'Semester created successfully');
    } catch (err) {
      return next(err);
    }
  }
}

export const academicYearController = new AcademicYearController();
