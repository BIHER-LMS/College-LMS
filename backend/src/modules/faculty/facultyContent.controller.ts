import { Request, Response } from 'express';
import { facultyContentService } from './services/facultyContent.service';
import { facultyAnalyticsService } from './services/facultyAnalytics.service';
import { sendSuccess, sendError, ErrorCodes } from '../../utils/response';

export class FacultyContentController {
  // Topics
  async getTopics(req: Request, res: Response) {
    try {
      const classSubjectId = req.query.classSubjectId as string;
      const facultyUid = (req as any).user.uid;

      if (!classSubjectId) {
        return sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'classSubjectId query param is required.');
      }

      const topics = await facultyContentService.getTopics(classSubjectId, facultyUid);
      return sendSuccess(res, topics);
    } catch (err: any) {
      return sendError(res, err.statusCode || 500, err.errorCode || ErrorCodes.INTERNAL_ERROR, err.message);
    }
  }

  async createTopic(req: Request, res: Response) {
    try {
      const facultyUid = (req as any).user.uid;
      const { classSubjectId, title } = req.body;
      if (!classSubjectId || typeof classSubjectId !== 'string' || !classSubjectId.trim()) {
        return sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'classSubjectId is required in request body.');
      }
      if (!title?.trim()) {
        return sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'Topic title is required.');
      }
      const topic = await facultyContentService.createTopic(req.body, facultyUid);
      return sendSuccess(res, topic, 201);
    } catch (err: any) {
      return sendError(res, err.statusCode || 500, err.errorCode || ErrorCodes.INTERNAL_ERROR, err.message);
    }
  }

  async updateTopic(req: Request, res: Response) {
    try {
      const facultyUid = (req as any).user.uid;
      const updated = await facultyContentService.updateTopic(req.params.id, req.body, facultyUid);
      return sendSuccess(res, updated);
    } catch (err: any) {
      return sendError(res, err.statusCode || 500, err.errorCode || ErrorCodes.INTERNAL_ERROR, err.message);
    }
  }

  async deleteTopic(req: Request, res: Response) {
    try {
      const facultyUid = (req as any).user.uid;
      const result = await facultyContentService.deleteTopic(req.params.id, facultyUid);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.statusCode || 500, err.errorCode || ErrorCodes.INTERNAL_ERROR, err.message);
    }
  }

  // Content
  async getContents(req: Request, res: Response) {
    try {
      const classSubjectId = req.query.classSubjectId as string;
      const topicId = req.query.topicId as string | undefined;
      const facultyUid = (req as any).user.uid;

      if (!classSubjectId) {
        return sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'classSubjectId query param is required.');
      }

      const contents = await facultyContentService.getContents(classSubjectId, facultyUid, topicId);
      return sendSuccess(res, contents);
    } catch (err: any) {
      return sendError(res, err.statusCode || 500, err.errorCode || ErrorCodes.INTERNAL_ERROR, err.message);
    }
  }

  async getContentById(req: Request, res: Response) {
    try {
      const facultyUid = (req as any).user.uid;
      const content = await facultyContentService.getContentById(req.params.id, facultyUid);
      return sendSuccess(res, content);
    } catch (err: any) {
      return sendError(res, err.statusCode || 500, err.errorCode || ErrorCodes.INTERNAL_ERROR, err.message);
    }
  }

  async createContent(req: Request, res: Response) {
    try {
      const facultyUid = (req as any).user.uid;
      const content = await facultyContentService.createContent(req.body, facultyUid);
      return sendSuccess(res, content, 201);
    } catch (err: any) {
      return sendError(res, err.statusCode || 500, err.errorCode || ErrorCodes.INTERNAL_ERROR, err.message);
    }
  }

  async uploadContent(req: Request, res: Response) {
    try {
      if (!req.file) {
        return sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'No file uploaded.');
      }

      const facultyUid = (req as any).user.uid;
      const meta = {
        topicId: req.body.topicId,
        classSubjectId: req.body.classSubjectId,
        title: req.body.title,
        description: req.body.description,
        durationSeconds: req.body.durationSeconds ? parseInt(req.body.durationSeconds, 10) : undefined,
        isDownloadable: req.body.isDownloadable !== undefined ? req.body.isDownloadable === 'true' || req.body.isDownloadable === true : true,
        isPublished: req.body.isPublished !== undefined ? req.body.isPublished === 'true' || req.body.isPublished === true : true,
      };

      const result = await facultyContentService.uploadAndCreateContent(req.file, meta, facultyUid);
      return sendSuccess(res, result, 201);
    } catch (err: any) {
      return sendError(res, err.statusCode || 500, err.errorCode || ErrorCodes.INTERNAL_ERROR, err.message);
    }
  }

  async updateContent(req: Request, res: Response) {
    try {
      const facultyUid = (req as any).user.uid;
      const updated = await facultyContentService.updateContent(req.params.id, req.body, facultyUid);
      return sendSuccess(res, updated);
    } catch (err: any) {
      return sendError(res, err.statusCode || 500, err.errorCode || ErrorCodes.INTERNAL_ERROR, err.message);
    }
  }

  async deleteContent(req: Request, res: Response) {
    try {
      const facultyUid = (req as any).user.uid;
      const result = await facultyContentService.deleteContent(req.params.id, facultyUid);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.statusCode || 500, err.errorCode || ErrorCodes.INTERNAL_ERROR, err.message);
    }
  }

  // Versioned Assignment Grading
  async gradeSubmission(req: Request, res: Response) {
    try {
      const facultyUid = (req as any).user.uid;
      const { submissionId } = req.params;
      const graded = await facultyContentService.gradeSubmission(submissionId, req.body, facultyUid);
      return sendSuccess(res, graded);
    } catch (err: any) {
      return sendError(res, err.statusCode || 500, err.errorCode || ErrorCodes.INTERNAL_ERROR, err.message);
    }
  }

  async getSubmissionVersions(req: Request, res: Response) {
    try {
      const facultyUid = (req as any).user.uid;
      const { submissionId } = req.params;
      const versions = await facultyContentService.getSubmissionVersions(submissionId, facultyUid);
      return sendSuccess(res, versions);
    } catch (err: any) {
      return sendError(res, err.statusCode || 500, err.errorCode || ErrorCodes.INTERNAL_ERROR, err.message);
    }
  }

  // Analytics
  async getClassSubjectAnalytics(req: Request, res: Response) {
    try {
      const facultyUid = (req as any).user.uid;
      const { classSubjectId } = req.params;
      const analytics = await facultyAnalyticsService.getClassSubjectAnalytics(classSubjectId, facultyUid);
      return sendSuccess(res, analytics);
    } catch (err: any) {
      return sendError(res, err.statusCode || 500, err.errorCode || ErrorCodes.INTERNAL_ERROR, err.message);
    }
  }

  async getStudentDrillDownAnalytics(req: Request, res: Response) {
    try {
      const facultyUid = (req as any).user.uid;
      const { classSubjectId, studentUid } = req.params;
      const drillDown = await facultyAnalyticsService.getStudentDrillDownAnalytics(classSubjectId, studentUid, facultyUid);
      return sendSuccess(res, drillDown);
    } catch (err: any) {
      return sendError(res, err.statusCode || 500, err.errorCode || ErrorCodes.INTERNAL_ERROR, err.message);
    }
  }
}

export const facultyContentController = new FacultyContentController();
