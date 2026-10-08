import { Request, Response, NextFunction } from 'express';
import { facultyService } from '../services/facultyService';
import { sendSuccess, sendPaginated } from '../utils/response';

export class FacultyController {
  async getFaculty(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string | undefined;

      const { data, pagination } = await facultyService.getFacultyList({ page, limit, search });

      // If page or limit was specifically requested, return paginated structure
      if (req.query.page || req.query.limit) {
        return sendPaginated(res, data, pagination);
      }
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }

  async getFacultyById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await facultyService.getFacultyById(req.params.id);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }

  async createFaculty(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await facultyService.createFaculty(req.body);
      return sendSuccess(res, data, 201, 'Faculty member created successfully');
    } catch (err) {
      return next(err);
    }
  }

  async updateFaculty(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await facultyService.updateFaculty(req.params.id, req.body);
      return sendSuccess(res, data, 200, 'Faculty member updated successfully');
    } catch (err) {
      return next(err);
    }
  }

  async deleteFaculty(req: Request, res: Response, next: NextFunction) {
    try {
      await facultyService.deleteFaculty(req.params.id);
      return sendSuccess(res, null, 200, 'Faculty member deleted successfully');
    } catch (err) {
      return next(err);
    }
  }
  async getPendingApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const departmentId = (req as any).hod?.departmentId || (req as any).user?.departmentId;
      if (!departmentId) {
        return sendSuccess(res, []);
      }
      const data = await facultyService.getPendingApplications(departmentId);
      return sendSuccess(res, data);
    } catch (err) {
      return next(err);
    }
  }

  async approveApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await facultyService.approveApplication(req.params.id, req.body);
      return sendSuccess(res, data, 200, 'Application processed successfully');
    } catch (err) {
      return next(err);
    }
  }
}

export const facultyController = new FacultyController();
