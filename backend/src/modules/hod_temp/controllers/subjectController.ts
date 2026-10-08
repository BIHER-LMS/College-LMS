import { Request, Response, NextFunction } from 'express';
import { subjectService } from '../services/subjectService';
import { sendSuccess } from '../utils/response';

export class SubjectController {
  async getSubjects(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await subjectService.getSubjects(req.query.departmentId as string);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }

  async getSubjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await subjectService.getSubjectById(req.params.id);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }

  async createSubject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await subjectService.createSubject(req.body);
      return sendSuccess(res, data, 201, 'Subject created successfully');
    } catch (err) {
      return next(err);
    }
  }

  async updateSubject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await subjectService.updateSubject(req.params.id, req.body);
      return sendSuccess(res, data, 200, 'Subject updated successfully');
    } catch (err) {
      return next(err);
    }
  }

  async deleteSubject(req: Request, res: Response, next: NextFunction) {
    try {
      await subjectService.deleteSubject(req.params.id);
      return sendSuccess(res, null, 200, 'Subject deleted successfully');
    } catch (err) {
      return next(err);
    }
  }
}

export const subjectController = new SubjectController();
