import { Request, Response, NextFunction } from 'express';
import { alertService } from '../services/alertService';
import { sendSuccess } from '../utils/response';

export class AlertController {
  async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string | undefined;
      const data = await alertService.getAlerts(status);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }

  async createAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await alertService.createAlert(req.body);
      return sendSuccess(res, data, 201, 'Academic alert created successfully');
    } catch (err) {
      return next(err);
    }
  }

  async updateAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await alertService.updateAlert(req.params.id, req.body);
      return sendSuccess(res, data, 200, 'Academic alert updated successfully');
    } catch (err) {
      return next(err);
    }
  }
}

export const alertController = new AlertController();
