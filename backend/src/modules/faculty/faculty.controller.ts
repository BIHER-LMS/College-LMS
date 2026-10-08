import { Request, Response } from 'express';
import { FacultyService } from './faculty.service';
import { updateProfileSchema, semesterQuerySchema, markAttendanceSchema } from './faculty.validation';
import { firebaseAuth } from '../../config/firebase';

// Faculty middleware currently permits development identities. Sensitive operations must
// independently derive the UID from a Firebase Admin-verified token, never req.user.
async function verifiedFacultyUid(req: Request): Promise<string> {
  const match = /^Bearer (\S+)$/.exec(req.headers.authorization || '');
  if (!match) throw { status: 401, message: 'Firebase authentication required' };
  try {
    const token = await firebaseAuth.verifyIdToken(match[1]);
    if (!token.uid) throw new Error('Missing UID');
    return token.uid;
  } catch {
    throw { status: 401, message: 'Invalid or expired Firebase token' };
  }
}

// Get verified UID and derive college/department from authed_users
async function verifiedFacultyActor(req: Request): Promise<{ uid: string; collegeId: string; departmentId: string }> {
  const uid = await verifiedFacultyUid(req);
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const authedUser = await prisma.authedUser.findUnique({
      where: { uid },
      select: { college_id: true, department_id: true, role: true, approval_status: true }
    });
    if (!authedUser || !['FACULTY'].includes(authedUser.role || '') || authedUser.approval_status !== 'APPROVED') {
      throw { status: 403, message: 'Faculty access required' };
    }
    return {
      uid,
      collegeId: authedUser.college_id || '',
      departmentId: authedUser.department_id || ''
    };
  } finally {
    await prisma.$disconnect();
  }
}

export class FacultyController {
  constructor(private service: FacultyService) {}

  getDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = await verifiedFacultyUid(req);
      const data = await this.service.getDashboard(uid);
      res.json(data);
    } catch (error: any) {
      console.error('getDashboard error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch dashboard data' });
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = await verifiedFacultyUid(req);
      const profile = await this.service.getProfile(uid);
      res.json(profile);
    } catch (error: any) {
      console.error('getProfile error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch profile' });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = await verifiedFacultyUid(req);
      const parsed = updateProfileSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
        return;
      }

      const updated = await this.service.updateProfile(uid, parsed.data);
      res.json(updated);
    } catch (error: any) {
      console.error('updateProfile error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to update profile' });
    }
  };

  getAssignedClasses = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = await verifiedFacultyUid(req);
      const classes = await this.service.getAssignedClasses(uid);
      res.json(classes);
    } catch (error: any) {
      console.error('getAssignedClasses error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch classes' });
    }
  };

  getClassDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = await verifiedFacultyUid(req);
      const classId = String(req.params.classId);
      const cls = await this.service.getClassDetails(classId, uid);
      res.json(cls);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch class details' });
    }
  };

  getClassStudents = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = await verifiedFacultyUid(req);
      const classId = String(req.params.classId);
      const students = await this.service.getClassStudents(classId, uid);
      res.json(students);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch class students' });
    }
  };

  getStudentDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = await verifiedFacultyUid(req);
      const studentId = String(req.params.studentId);
      const student = await this.service.getStudentDetails(studentId, uid);
      res.json(student);
    } catch (error: any) {
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch student details' });
    }
  };

  getDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { departmentId } = await verifiedFacultyActor(req);
      if (!departmentId) {
        res.status(400).json({ error: 'Department not assigned to this faculty member' });
        return;
      }
      const department = await this.service.getDepartment(departmentId);
      res.json(department);
    } catch (error: any) {
      console.error('getDepartment error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch department' });
    }
  };

  getSubjects = async (req: Request, res: Response): Promise<void> => {
    try {
      const { departmentId } = await verifiedFacultyActor(req);
      if (!departmentId) {
        res.status(400).json({ error: 'Department not assigned to this faculty member' });
        return;
      }

      const queryValidation = semesterQuerySchema.safeParse(req.query);
      const semester = queryValidation.success ? queryValidation.data.semester : undefined;

      const subjects = await this.service.getSubjects(departmentId, semester);
      res.json(subjects);
    } catch (error: any) {
      console.error('getSubjects error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch subjects' });
    }
  };

  getAcademicYears = async (req: Request, res: Response): Promise<void> => {
    try {
      const { collegeId } = await verifiedFacultyActor(req);
      if (!collegeId) {
        res.status(400).json({ error: 'College not assigned to this faculty member' });
        return;
      }
      const years = await this.service.getAcademicYears(collegeId);
      res.json(years);
    } catch (error: any) {
      console.error('getAcademicYears error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch academic years' });
    }
  };

  getSemesters = async (req: Request, res: Response): Promise<void> => {
    try {
      const { collegeId } = await verifiedFacultyActor(req);
      if (!collegeId) {
        res.status(400).json({ error: 'College not assigned to this faculty member' });
        return;
      }
      const semesters = await this.service.getSemesters(collegeId);
      res.json(semesters);
    } catch (error: any) {
      console.error('getSemesters error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch semesters' });
    }
  };

  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = await verifiedFacultyUid(req);
      const q = (req.query.q as string) || '';
      const results = await this.service.search(uid, q);
      res.json(results);
    } catch (error: any) {
      console.error('search error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Search failed' });
    }
  };

  getAttendanceSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const classId = req.query.classId as string;
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const period = (req.query.period as string) || 'Period 1';

      if (!classId) {
        res.status(400).json({ error: 'classId query parameter is required' });
        return;
      }

      const uid = await verifiedFacultyUid(req);
      const session = await this.service.getAttendanceSession(uid, classId, date, period);
      res.json(session);
    } catch (error: any) {
      console.error('getAttendanceSession error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch attendance session' });
    }
  };

  saveAttendanceSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = await verifiedFacultyUid(req);
      const parsed = markAttendanceSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
        return;
      }

      const result = await this.service.saveAttendanceSession(facultyUid, parsed.data);
      res.json(result);
    } catch (error: any) {
      console.error('saveAttendanceSession error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to save attendance session' });
    }
  };

  getClassAttendanceStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const classId = req.params.classId as string;
      if (!classId) {
        res.status(400).json({ error: 'classId parameter is required' });
        return;
      }
      const uid = await verifiedFacultyUid(req);
      const stats = await this.service.getClassAttendanceStats(uid, classId);
      res.json(stats);
    } catch (error: any) {
      console.error('getClassAttendanceStats error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch attendance stats' });
    }
  };

  getClassAttendanceHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const classId = req.params.classId as string;
      if (!classId) {
        res.status(400).json({ error: 'classId parameter is required' });
        return;
      }
      const uid = await verifiedFacultyUid(req);
      const history = await this.service.getClassAttendanceHistory(uid, classId);
      res.json(history);
    } catch (error: any) {
      console.error('getClassAttendanceHistory error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch attendance history' });
    }
  };

  getTodayReminders = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = await verifiedFacultyUid(req);
      const reminders = await this.service.getTodayReminders(uid);
      res.json(reminders);
    } catch (error: any) {
      console.error('getTodayReminders error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch daily reminders' });
    }
  };

  // ==========================================
  // TIMETABLE
  // ==========================================
  getTimetable = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = await verifiedFacultyUid(req);
      const timetable = await this.service.getTimetable(uid);
      res.json(timetable);
    } catch (error: any) {
      console.error('getTimetable error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch timetable' });
    }
  };

  saveTimetableSlot = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = await verifiedFacultyUid(req);
      const slot = await this.service.saveTimetableSlot(uid, req.body);
      res.json(slot);
    } catch (error: any) {
      console.error('saveTimetableSlot error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to save timetable slot' });
    }
  };

  bulkSaveTimetable = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = await verifiedFacultyUid(req);
      const { slots, replaceExisting } = req.body;
      if (!Array.isArray(slots)) {
        res.status(400).json({ error: 'slots must be an array of timetable entries' });
        return;
      }
      const result = await this.service.bulkSaveTimetable(uid, slots, replaceExisting !== false);
      res.json(result);
    } catch (error: any) {
      console.error('bulkSaveTimetable error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to bulk save timetable' });
    }
  };

  deleteTimetableSlot = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = await verifiedFacultyUid(req);
      const slotId = req.params.id;
      const success = await this.service.deleteTimetableSlot(uid, slotId);
      res.json({ success });
    } catch (error: any) {
      console.error('deleteTimetableSlot error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to delete timetable slot' });
    }
  };

  // ==========================================
  // REMINDERS
  // ==========================================
  getReminders = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = await verifiedFacultyUid(req);
      const type = req.query.type as string | undefined;
      const status = req.query.status as string | undefined;
      const reminders = await this.service.getReminders(uid, { type, status });
      res.json(reminders);
    } catch (error: any) {
      console.error('getReminders error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch reminders' });
    }
  };

  createReminder = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = await verifiedFacultyUid(req);
      if (!req.body.title) {
        res.status(400).json({ error: 'Title is required for reminder' });
        return;
      }
      const reminder = await this.service.createReminder(uid, req.body);
      res.json(reminder);
    } catch (error: any) {
      console.error('createReminder error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to create reminder' });
    }
  };

  updateReminder = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = await verifiedFacultyUid(req);
      const reminderId = req.params.id;
      const reminder = await this.service.updateReminder(uid, reminderId, req.body);
      res.json(reminder);
    } catch (error: any) {
      console.error('updateReminder error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to update reminder' });
    }
  };

  toggleReminderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = await verifiedFacultyUid(req);
      const reminderId = req.params.id;
      const reminder = await this.service.toggleReminderStatus(uid, reminderId);
      res.json(reminder);
    } catch (error: any) {
      console.error('toggleReminderStatus error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to toggle reminder status' });
    }
  };

  deleteReminder = async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = await verifiedFacultyUid(req);
      const reminderId = req.params.id;
      const success = await this.service.deleteReminder(uid, reminderId);
      res.json({ success });
    } catch (error: any) {
      console.error('deleteReminder error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to delete reminder' });
    }
  };

  // ==========================================
  // BULK STUDENT UPLOAD (EXCEL / CSV)
  // ==========================================
  bulkUploadStudents = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = await verifiedFacultyUid(req);
      const classId = req.params.classId as string;
      const students = req.body.students;

      if (!classId) {
        res.status(400).json({ error: 'Class ID is required' });
        return;
      }
      if (!Array.isArray(students) || students.length === 0) {
        res.status(400).json({ error: 'Students array is required and must not be empty' });
        return;
      }

      const result = await this.service.bulkUploadStudents(facultyUid, classId, students);
      res.json(result);
    } catch (error: any) {
      console.error('bulkUploadStudents error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to upload students' });
    }
  };

  // ==========================================
  // MANUALLY ADD SINGLE STUDENT
  // ==========================================
  addStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = await verifiedFacultyUid(req);
      const classId = req.params.classId as string;
      const { rollNumber, name, email, dob, phone, parentPhone } = req.body;

      if (!classId) {
        res.status(400).json({ error: 'Class ID is required' });
        return;
      }
      if (!rollNumber || !name || !email) {
        res.status(400).json({ error: 'Roll number, student name, and email are required' });
        return;
      }

      const result = await this.service.addStudent(facultyUid, classId, {
        rollNumber,
        name,
        email,
        dob,
        phone,
        parentPhone,
      });
      res.json(result);
    } catch (error: any) {
      console.error('addStudent error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to add student' });
    }
  };

  // ==========================================
  // DELETE / REMOVE STUDENT FROM CLASS
  // ==========================================
  deleteStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = await verifiedFacultyUid(req);
      const classId = req.params.classId as string;
      const studentUid = req.params.studentUid as string;

      if (!classId || !studentUid) {
        res.status(400).json({ error: 'Class ID and Student UID are required' });
        return;
      }

      const result = await this.service.deleteStudent(facultyUid, classId, studentUid);
      res.json(result);
    } catch (error: any) {
      console.error('deleteStudent error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to remove student' });
    }
  };

  // ==========================================
  // CLASS REPRESENTATIVE (CR) ASSIGNMENT
  // ==========================================
  assignClassRepresentative = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = await verifiedFacultyUid(req);
      const classId = req.params.classId as string;
      const studentUid = req.body.studentUid !== undefined ? req.body.studentUid : null;

      if (!classId) {
        res.status(400).json({ error: 'Class ID is required' });
        return;
      }

      const result = await this.service.assignClassRepresentative(facultyUid, classId, studentUid);
      res.json(result);
    } catch (error: any) {
      console.error('assignClassRepresentative error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to assign class representative' });
    }
  };

  // ==========================================
  // CLASS MASTER TIMETABLE (FOR ENTIRE CLASS)
  // ==========================================
  getClassTimetable = async (req: Request, res: Response): Promise<void> => {
    try {
      const classId = req.params.classId as string;
      if (!classId) {
        res.status(400).json({ error: 'Class ID is required' });
        return;
      }
      const uid = await verifiedFacultyUid(req);
      const timetable = await this.service.getClassTimetable(uid, classId);
      res.json(timetable);
    } catch (error: any) {
      console.error('getClassTimetable error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch class timetable' });
    }
  };

  saveClassTimetableSlot = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = await verifiedFacultyUid(req);
      const classId = req.params.classId as string;
      if (!classId) {
        res.status(400).json({ error: 'Class ID is required' });
        return;
      }
      const slot = await this.service.saveClassTimetableSlot(facultyUid, classId, req.body);
      res.json(slot);
    } catch (error: any) {
      console.error('saveClassTimetableSlot error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to save class timetable slot' });
    }
  };

  bulkSaveClassTimetable = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = await verifiedFacultyUid(req);
      const classId = req.params.classId as string;
      const { slots, replaceExisting } = req.body;

      if (!classId) {
        res.status(400).json({ error: 'Class ID is required' });
        return;
      }
      if (!Array.isArray(slots)) {
        res.status(400).json({ error: 'slots array is required' });
        return;
      }

      const result = await this.service.bulkSaveClassTimetable(
        facultyUid,
        classId,
        slots,
        replaceExisting !== false
      );
      res.json(result);
    } catch (error: any) {
      console.error('bulkSaveClassTimetable error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to bulk save class timetable' });
    }
  };

  deleteClassTimetableSlot = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = await verifiedFacultyUid(req);
      const classId = req.params.classId as string;
      const slotId = req.params.slotId as string;

      if (!classId || !slotId) {
        res.status(400).json({ error: 'classId and slotId parameters are required' });
        return;
      }

      const success = await this.service.deleteClassTimetableSlot(facultyUid, classId, slotId);
      res.json({ success });
    } catch (error: any) {
      console.error('deleteClassTimetableSlot error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to delete class timetable slot' });
    }
  };

  // ==========================================
  // SUBJECTS & CLASS PERFORMANCE
  // ==========================================
  getMySubjectsPerformance = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = await verifiedFacultyUid(req);
      const subjects = await this.service.getFacultySubjectsWithClassPerformance(facultyUid);
      res.json(subjects);
    } catch (error: any) {
      console.error('getMySubjectsPerformance error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch subjects performance' });
    }
  };

  getMySubjects = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = await verifiedFacultyUid(req);
      const result = await this.service.getMySubjects(facultyUid);
      res.json(result);
    } catch (error: any) {
      console.error('getMySubjects error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch assigned subjects' });
    }
  };

  createAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = await verifiedFacultyUid(req);
      const result = await this.service.createAssignment(facultyUid, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      console.error('createAssignment error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to create assignment' });
    }
  };

  getAssignments = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = await verifiedFacultyUid(req);
      const classSubjectId = req.query.classSubjectId as string | undefined;
      const result = await this.service.getAssignments(facultyUid, classSubjectId);
      res.json(result);
    } catch (error: any) {
      console.error('getAssignments error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch assignments' });
    }
  };

  getAssignmentSubmissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const facultyUid = await verifiedFacultyUid(req);
      const { assignmentId } = req.params;
      const result = await this.service.getAssignmentSubmissions(facultyUid, assignmentId);
      res.json(result);
    } catch (error: any) {
      console.error('getAssignmentSubmissions error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Failed to fetch submissions' });
    }
  };
}
