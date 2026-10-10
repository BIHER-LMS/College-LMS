import { Request, Response, NextFunction } from 'express';
import { announcementService } from './announcement.service';
import { sendSuccess, sendError, ErrorCodes } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class AnnouncementController {
  async getAnnouncements(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const userCollegeId = authReq.user?.collegeId;
      const collegeId = (req.query.college_id as string) || userCollegeId;

      if (!collegeId) {
        return sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'college_id is required');
      }

      const role = (req.query.role as string) || authReq.user?.roles?.[0]?.name;
      const isClassIncharge = req.query.isClassIncharge === 'true';
      const targetAudience = req.query.targetAudience as string | undefined;
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const isActiveOnly = req.query.includeInactive === 'true' ? false : true;

      const data = await announcementService.getAnnouncements(collegeId, {
        role,
        isClassIncharge,
        targetAudience,
        category,
        search,
        isActiveOnly,
      });

      return sendSuccess(res, data, 200);
    } catch (err) {
      return next(err);
    }
  }

  async createAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const collegeId = req.user?.collegeId || (req.body.college_id as string);
      if (!collegeId) {
        return sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'college_id is required');
      }

      const { title, description, image_url, target_audience, category, priority, is_pinned, is_active, expires_at } = req.body;

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'Title is required');
      }

      if (!description || typeof description !== 'string' || description.trim().length === 0) {
        return sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'Description is required');
      }

      if (!Array.isArray(target_audience) || target_audience.length === 0) {
        return sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'At least one target audience must be selected (HOD, FACULTY, CLASS_INCHARGE, STUDENT)');
      }

      const createdByName = req.body.author_name || req.user?.email?.split('@')[0] || 'College Administration';
      const createdByUid = req.user?.firebaseUid || req.user?.id || null;

      const created = await announcementService.createAnnouncement(collegeId, {
        title,
        description,
        image_url,
        target_audience,
        category,
        priority,
        is_pinned,
        is_active,
        expires_at,
        created_by_uid: createdByUid,
        created_by_name: createdByName,
      });

      return sendSuccess(res, created, 201);
    } catch (err) {
      return next(err);
    }
  }

  async updateAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const collegeId = req.user?.collegeId || (req.body.college_id as string);
      if (!collegeId) {
        return sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'college_id is required');
      }

      const updated = await announcementService.updateAnnouncement(id, collegeId, req.body);
      if (!updated) {
        return sendError(res, 404, ErrorCodes.NOT_FOUND, 'Announcement not found');
      }

      return sendSuccess(res, updated, 200);
    } catch (err) {
      return next(err);
    }
  }

  async deleteAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const collegeId = req.user?.collegeId || (req.query.college_id as string);
      if (!collegeId) {
        return sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'college_id is required');
      }

      await announcementService.deleteAnnouncement(id, collegeId);
      return sendSuccess(res, { deleted: true }, 200);
    } catch (err) {
      return next(err);
    }
  }
}

export const announcementController = new AnnouncementController();
