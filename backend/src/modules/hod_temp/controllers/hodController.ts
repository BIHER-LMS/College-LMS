import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { hodService } from '../services/hodService';
import { sendSuccess } from '../utils/response';

export class HODController {
  // 1. Dashboard & Department Context
  async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await hodService.getDashboard(req.hod!);
      sendSuccess(res, data, 'HOD dashboard metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await hodService.getDepartmentDetails(req.hod!);
      sendSuccess(res, data, 'Department details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // 2. Faculty Management
  async getFaculty(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string | undefined;
      const data = await hodService.getFacultyList(req.hod!, search);
      sendSuccess(res, data, 'Faculty list retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getFacultyById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { facultyUid } = req.params;
      const data = await hodService.getFacultyById(req.hod!, facultyUid);
      sendSuccess(res, data, 'Faculty details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async assignFacultySubjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { facultyUid } = req.params;
      const { classIds, subjectIds } = req.body;
      const data = await hodService.assignFacultyToClassesAndSubjects(req.hod!, facultyUid, classIds, subjectIds);
      sendSuccess(res, data, data.message);
    } catch (error) {
      next(error);
    }
  }

  async unassignFacultySubject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { facultyUid, classId, subjectId } = req.params;
      const data = await hodService.unassignFacultySubject(req.hod!, facultyUid, classId, subjectId);
      sendSuccess(res, data, data.message);
    } catch (error) {
      next(error);
    }
  }

  // 3. Program Management
  async getPrograms(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await hodService.getPrograms(req.hod!);
      sendSuccess(res, data, 'Programs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createProgram(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await hodService.createProgram(req.hod!, req.body);
      sendSuccess(res, data, 'Program created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateProgram(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { programId } = req.params;
      const data = await hodService.updateProgram(req.hod!, programId, req.body);
      sendSuccess(res, data, 'Program updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // 4. Batch Management
  async getBatches(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await hodService.getBatches(req.hod!);
      sendSuccess(res, data, 'Batches retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createBatch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await hodService.createBatch(req.hod!, req.body);
      sendSuccess(res, data, 'Batch created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateBatch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { batchId } = req.params;
      const data = await hodService.updateBatch(req.hod!, batchId, req.body);
      sendSuccess(res, data, 'Batch updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // 5. Class Management & Class Incharge Assignment
  async getClasses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string | undefined;
      const data = await hodService.getClasses(req.hod!, search);
      sendSuccess(res, data, 'Classes retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getClassById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;
      const data = await hodService.getClassById(req.hod!, classId);
      sendSuccess(res, data, 'Class details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createClass(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await hodService.createClass(req.hod!, req.body);
      sendSuccess(res, data, 'Class created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateClass(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;
      const data = await hodService.updateClass(req.hod!, classId, req.body);
      sendSuccess(res, data, 'Class updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async assignClassIncharge(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;
      const { facultyUid } = req.body;
      const data = await hodService.assignClassIncharge(req.hod!, classId, facultyUid);
      sendSuccess(res, data, data.message);
    } catch (error) {
      next(error);
    }
  }

  async assignSubjectToClass(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { classId } = req.params;
      const { subjectId, facultyUid } = req.body;
      const data = await hodService.assignSubjectToClass(req.hod!, classId, subjectId, facultyUid);
      sendSuccess(res, data, data.message);
    } catch (error) {
      next(error);
    }
  }

  async assignSubjectTeacher(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { classId, subjectId } = req.params;
      const { facultyUid } = req.body;
      const data = await hodService.assignSubjectTeacher(req.hod!, classId, subjectId, facultyUid);
      sendSuccess(res, data, data.message);
    } catch (error) {
      next(error);
    }
  }

  // 6. Student Management
  async getStudents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const classId = req.query.classId as string | undefined;
      const search = req.query.search as string | undefined;
      const data = await hodService.getStudents(req.hod!, { classId, search });
      sendSuccess(res, data, 'Students retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStudentById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { studentId } = req.params;
      const data = await hodService.getStudentById(req.hod!, studentId);
      sendSuccess(res, data, 'Student details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // 7. Subject Management
  async getSubjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const semester = req.query.semester ? parseInt(req.query.semester as string, 10) : undefined;
      const data = await hodService.getSubjects(req.hod!, semester);
      sendSuccess(res, data, 'Subjects retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createSubject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await hodService.createSubject(req.hod!, req.body);
      sendSuccess(res, data, 'Subject created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateSubject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { subjectId } = req.params;
      const data = await hodService.updateSubject(req.hod!, subjectId, req.body);
      sendSuccess(res, data, 'Subject updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // 8. Academic Years & Semesters
  async getAcademicYears(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await hodService.getAcademicYears(req.hod!);
      sendSuccess(res, data, 'Academic years retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getSemesters(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await hodService.getSemesters(req.hod!);
      sendSuccess(res, data, 'Semesters retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // 9. Profile
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await hodService.getProfile(req.hod!);
      sendSuccess(res, data, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await hodService.updateProfile(req.hod!, req.body);
      sendSuccess(res, data, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // 10. EXTRA STUBS
  async getAttendanceSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await hodService.getAttendanceSummary(req.hod!);
      sendSuccess(res, data, 'Attendance summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCurriculum(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await hodService.getCurriculum(req.hod!);
      sendSuccess(res, data, 'Curriculum retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAnnouncements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await hodService.getAnnouncements(req.hod!);
      sendSuccess(res, data, 'Announcements retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await hodService.createAnnouncement(req.hod!, req.body);
      sendSuccess(res, data, 'Announcement created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAcademicAlerts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await hodService.getAcademicAlerts(req.hod!);
      sendSuccess(res, data, 'Academic alerts retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const hodController = new HODController();
