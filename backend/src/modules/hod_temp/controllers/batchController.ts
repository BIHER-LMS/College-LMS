import { Request, Response, NextFunction } from 'express';
import { batchService } from '../services/batchService';
import { sendSuccess } from '../utils/response';

export class BatchController {
  async getBatches(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await batchService.getBatches(req.query.programId as string);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }

  async getBatchById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await batchService.getBatchById(req.params.id);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }

  async createBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await batchService.createBatch(req.body);
      return sendSuccess(res, data, 201, 'Batch created successfully');
    } catch (err) {
      return next(err);
    }
  }

  async updateBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await batchService.updateBatch(req.params.id, req.body);
      return sendSuccess(res, data, 200, 'Batch updated successfully');
    } catch (err) {
      return next(err);
    }
  }

  async deleteBatch(req: Request, res: Response, next: NextFunction) {
    try {
      await batchService.deleteBatch(req.params.id);
      return sendSuccess(res, null, 200, 'Batch deleted successfully');
    } catch (err) {
      return next(err);
    }
  }
}

export const batchController = new BatchController();
