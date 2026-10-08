import { Request, Response, NextFunction } from 'express';
import { classService } from '../services/classService';
import { sendSuccess, sendPaginated } from '../utils/response';

export class ClassController {
  async getClasses(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string | undefined;

      const { data, pagination } = await classService.getClassList({ page, limit, search });

      if (req.query.page || req.query.limit) {
        return sendPaginated(res, data, pagination);
      }
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }

  async getClassById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await classService.getClassById(req.params.id);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }

  async createClass(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await classService.createClass(req.body);
      return sendSuccess(res, data, 201, 'Class created successfully');
    } catch (err) {
      return next(err);
    }
  }

  async updateClass(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await classService.updateClass(req.params.id, req.body);
      return sendSuccess(res, data, 200, 'Class updated successfully');
    } catch (err) {
      return next(err);
    }
  }

  async deleteClass(req: Request, res: Response, next: NextFunction) {
    try {
      await classService.deleteClass(req.params.id);
      return sendSuccess(res, null, 200, 'Class deleted successfully');
    } catch (err) {
      return next(err);
    }
  }

  async assignClassIncharge(req: Request, res: Response, next: NextFunction) {
    try {
      const classId = req.params.id;
      const { facultyUid, facultyId } = req.body;
      const targetFacultyId = facultyUid || facultyId;

      if (!targetFacultyId) {
        return res.status(400).json({
          success: false,
          message: 'facultyUid or facultyId is required in request body',
          error: 'MISSING_FACULTY_ID',
        });
      }

      const updatedClass = await classService.assignClassIncharge(classId, targetFacultyId);
      return sendSuccess(res, updatedClass, 200, 'Class incharge assigned successfully');
    } catch (err) {
      return next(err);
    }
  }
}

export const classController = new ClassController();
