import { Request, Response, NextFunction } from 'express';
import { departmentService } from '../services/departmentService';
import { sendSuccess } from '../utils/response';

export class DepartmentController {
  async getDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await departmentService.getDepartment(req.params.id);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }

  async updateDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await departmentService.updateDepartment(req.params.id, req.body);
      return sendSuccess(res, data, 200, 'Department updated successfully');
    } catch (err) {
      return next(err);
    }
  }
}

export const departmentController = new DepartmentController();
