import { Request, Response, NextFunction } from 'express';
import { studentService } from './student.service';
import { updateProfileSchema } from './student.validation';
import { sendSuccess } from '../../utils/response';
import { storageService } from '../../services/storage.service';
import { AppError } from '../../utils/errors';

const successResponse = (res: Response, data: any, status = 200, message?: string) => {
  return sendSuccess(res, data, status);
};

export class StudentController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getDashboard((req as any).studentContext!);
      return successResponse(res, data, 200, 'Student dashboard loaded successfully');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getProfile((req as any).studentContext!);
      return successResponse(res, data, 200, 'Student profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateProfileSchema.parse(req.body);
      const data = await studentService.updateProfile((req as any).studentContext!, validated);
      return successResponse(res, data, 200, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getClass(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getClass((req as any).studentContext!);
      return successResponse(res, data, 200, 'Class information retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getBatch((req as any).studentContext!);
      return successResponse(res, data, 200, 'Batch information retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getProgram(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getProgram((req as any).studentContext!);
      return successResponse(res, data, 200, 'Program information retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getDepartment((req as any).studentContext!);
      return successResponse(res, data, 200, 'Department information retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getSubjects(req: Request, res: Response, next: NextFunction) {
    try {
      const semesterQuery = req.query.semester as string | undefined;
      const semesterNumber = semesterQuery ? parseInt(semesterQuery, 10) : undefined;
      const data = await studentService.getSubjects((req as any).studentContext!, semesterNumber);
      return successResponse(res, data, 200, 'Department subjects retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getClassIncharge(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getClassIncharge((req as any).studentContext!);
      return successResponse(res, data, 200, 'Class Incharge faculty details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getAcademicYears(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getAcademicYears((req as any).studentContext!);
      return successResponse(res, data, 200, 'Academic years retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getSemesters(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getSemesters((req as any).studentContext!);
      return successResponse(res, data, 200, 'Semesters retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getTimetable(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getClassTimetable((req as any).studentContext!);
      return successResponse(res, data, 200, 'Class master timetable retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string | undefined;
      const data = await studentService.getAttendance((req as any).studentContext!, date);
      return successResponse(res, data, 200, 'Student attendance and period logs retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getAssignments((req as any).studentContext!);
      return successResponse(res, data, 200, 'Student assignments retrieved');
    } catch (error) {
      next(error);
    }
  }

  async submitAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const assignmentId = req.params.assignmentId;
      const studentContext = (req as any).studentContext!;
      let attachmentUrl = req.body?.attachmentUrl;

      if (req.file) {
        const uploadResult = await storageService.uploadAssignmentSubmission(
          req.file.buffer,
          req.file.originalname,
          studentContext.uid,
          assignmentId
        );
        attachmentUrl = uploadResult.secureUrl;
      }

      if (!attachmentUrl) {
        throw new AppError(400, 'BAD_REQUEST', 'Please provide a file or an attachmentUrl to submit');
      }

      const data = await studentService.submitAssignment(studentContext, assignmentId, {
        ...req.body,
        attachmentUrl,
      });
      return successResponse(res, data, 200, 'Assignment submitted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const studentController = new StudentController();
