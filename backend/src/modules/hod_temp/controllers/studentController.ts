import { Request, Response, NextFunction } from 'express';
import { studentService } from '../services/studentService';
import { sendSuccess, sendPaginated } from '../utils/response';

export class StudentController {
  async getStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string | undefined;
      const classId = req.query.classId as string | undefined;

      const { data, pagination } = await studentService.getStudents({ page, limit, search, classId });

      if (req.query.page || req.query.limit) {
        return sendPaginated(res, data, pagination);
      }
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }

  async getStudentById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getStudentById(req.params.id);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }

  async createStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.createStudent(req.body);
      return sendSuccess(res, data, 201, 'Student created successfully');
    } catch (err) {
      return next(err);
    }
  }

  async updateStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.updateStudent(req.params.id, req.body);
      return sendSuccess(res, data, 200, 'Student updated successfully');
    } catch (err) {
      return next(err);
    }
  }

  async deleteStudent(req: Request, res: Response, next: NextFunction) {
    try {
      await studentService.deleteStudent(req.params.id);
      return sendSuccess(res, null, 200, 'Student deleted successfully');
    } catch (err) {
      return next(err);
    }
  }
}

export const studentController = new StudentController();
