import { Request, Response, NextFunction } from 'express';
import { curriculumService } from '../services/curriculumService';
import { sendSuccess } from '../utils/response';

export class CurriculumController {
  async getCurriculum(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await curriculumService.getCurriculum();
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }

  async updateCurriculum(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await curriculumService.updateCurriculum(req.params.id, req.body);
      return sendSuccess(res, data, 200, 'Curriculum progress updated successfully');
    } catch (err) {
      return next(err);
    }
  }
}

export const curriculumController = new CurriculumController();
