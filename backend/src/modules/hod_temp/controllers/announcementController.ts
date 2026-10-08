import { Request, Response, NextFunction } from 'express';
import { announcementService } from '../services/announcementService';
import { sendSuccess, sendPaginated } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class AnnouncementController {
  async getAnnouncements(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      const { data, pagination } = await announcementService.getAnnouncements({ page, limit });

      if (req.query.page || req.query.limit) {
        return sendPaginated(res, data, pagination);
      }
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }

  async createAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.uid;
      const data = await announcementService.createAnnouncement({
        ...req.body,
        createdBy: userId,
      });
      return sendSuccess(res, data, 201, 'Announcement published successfully');
    } catch (err) {
      return next(err);
    }
  }

  async updateAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await announcementService.updateAnnouncement(req.params.id, req.body);
      return sendSuccess(res, data, 200, 'Announcement updated successfully');
    } catch (err) {
      return next(err);
    }
  }

  async deleteAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      await announcementService.deleteAnnouncement(req.params.id);
      return sendSuccess(res, null, 200, 'Announcement deleted successfully');
    } catch (err) {
      return next(err);
    }
  }
}

export const announcementController = new AnnouncementController();
