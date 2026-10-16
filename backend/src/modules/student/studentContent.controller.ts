import { Request, Response } from 'express';
import { studentContentService } from './services/studentContent.service';
import { sendSuccess, sendError, ErrorCodes } from '../../utils/response';
import { StudentContext } from './student.types';

export class StudentContentController {
  async getStudentSubjectsAndContents(req: Request, res: Response) {
    try {
      const studentContext = (req as any).studentContext as StudentContext;
      res.setHeader('Cache-Control', 'private, max-age=20, stale-while-revalidate=60');
      const subjects = await studentContentService.getStudentSubjectsAndContents(studentContext);
      return sendSuccess(res, subjects);
    } catch (err: any) {
      return sendError(res, err.statusCode || 500, err.errorCode || ErrorCodes.INTERNAL_ERROR, err.message);
    }
  }

  async getContentDetails(req: Request, res: Response) {
    try {
      const studentContext = (req as any).studentContext as StudentContext;
      const { id } = req.params;
      const content = await studentContentService.getContentDetails(id, studentContext);
      return sendSuccess(res, content);
    } catch (err: any) {
      return sendError(res, err.statusCode || 500, err.errorCode || ErrorCodes.INTERNAL_ERROR, err.message);
    }
  }

  async recordLearningEvent(req: Request, res: Response) {
    try {
      const studentContext = (req as any).studentContext as StudentContext;
      const { id } = req.params;
      const progress = await studentContentService.recordLearningEvent(id, req.body, studentContext);
      return sendSuccess(res, progress);
    } catch (err: any) {
      return sendError(res, err.statusCode || 500, err.errorCode || ErrorCodes.INTERNAL_ERROR, err.message);
    }
  }

  async getAuthorizedDownload(req: Request, res: Response) {
    try {
      const studentContext = (req as any).studentContext as StudentContext;
      const { id } = req.params;
      const downloadInfo = await studentContentService.getAuthorizedDownload(id, studentContext);
      return sendSuccess(res, downloadInfo);
    } catch (err: any) {
      return sendError(res, err.statusCode || 500, err.errorCode || ErrorCodes.INTERNAL_ERROR, err.message);
    }
  }

  async submitAssignment(req: Request, res: Response) {
    try {
      const studentContext = (req as any).studentContext as StudentContext;
      const { assignmentId } = req.params;

      if (!req.file) {
        return sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'No submission file provided.');
      }

      const result = await studentContentService.submitAssignmentWithVersion(
        assignmentId,
        req.file,
        req.body.studentNotes,
        studentContext
      );

      return sendSuccess(res, result, 201);
    } catch (err: any) {
      return sendError(res, err.statusCode || 500, err.errorCode || ErrorCodes.INTERNAL_ERROR, err.message);
    }
  }
}

export const studentContentController = new StudentContentController();
