import { Request, Response, NextFunction } from 'express';
import { programService } from '../services/programService';
import { sendSuccess } from '../utils/response';

export class ProgramController {
  async getPrograms(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await programService.getPrograms(req.query.departmentId as string);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }

  async getProgramById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await programService.getProgramById(req.params.id);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }

  async createProgram(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await programService.createProgram(req.body);
      return sendSuccess(res, data, 201, 'Program created successfully');
    } catch (err) {
      return next(err);
    }
  }

  async updateProgram(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await programService.updateProgram(req.params.id, req.body);
      return sendSuccess(res, data, 200, 'Program updated successfully');
    } catch (err) {
      return next(err);
    }
  }

  async deleteProgram(req: Request, res: Response, next: NextFunction) {
    try {
      await programService.deleteProgram(req.params.id);
      return sendSuccess(res, null, 200, 'Program deleted successfully');
    } catch (err) {
      return next(err);
    }
  }
}

export const programController = new ProgramController();
