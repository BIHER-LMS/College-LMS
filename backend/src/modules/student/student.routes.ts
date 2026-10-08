import { Router } from 'express';
import { studentController } from './student.controller';
import { authenticateFirebaseUser } from '../../middleware/auth.middleware';
import prisma from '../../config/database';
import { StudentContext } from './student.types';
import { AppError } from '../../utils/errors';
import { uploadMemory } from '../../middleware/upload.middleware';

const router = Router();

async function buildStudentContext(req: any, res: any, next: any) {
  try {
    const firebaseUid = req.firebaseUid || req.user?.firebaseUid || req.user?.id;
    if (!firebaseUid) throw new AppError(401, 'UNAUTHORIZED', 'No user found');
    
    const dbUser = await prisma.authedUser.findUnique({
      where: { uid: firebaseUid },
      include: {
        department: { select: { college_id: true } },
        class: { select: { batch: { select: { program: { select: { department_id: true, department: { select: { college_id: true } } } } } } } },
      },
    });

    if (!dbUser) throw new AppError(401, 'UNAUTHORIZED', 'User not found in DB');
    if (dbUser.role !== 'STUDENT' || !['APPROVED', 'ACTIVE'].includes(dbUser.approval_status || '') || !dbUser.college_id ||
        (req.verifiedEmail && dbUser.email.trim().toLowerCase() !== req.verifiedEmail) ||
        (req.user && (req.user.collegeId !== dbUser.college_id || !req.user.roles.some((r: any) => r.name === 'STUDENT'))) ||
        (dbUser.department_id && dbUser.department?.college_id !== dbUser.college_id) ||
        (dbUser.class_id && (!dbUser.class || dbUser.class.batch.program.department.college_id !== dbUser.college_id ||
          (dbUser.department_id && dbUser.class.batch.program.department_id !== dbUser.department_id)))) {
      throw new AppError(403, 'FORBIDDEN', 'Student account is not approved or has an inconsistent college/class assignment');
    }

    req.studentContext = {
      uid: dbUser.uid,
      email: dbUser.email,
      displayName: dbUser.display_name,
      photoURL: dbUser.photo_url,
      role: dbUser.role,
      collegeId: dbUser.college_id,
      departmentId: dbUser.department_id,
      classId: dbUser.class_id,
      registerNumber: dbUser.register_number
    } as StudentContext;
    
    next();
  } catch (error) {
    next(error);
  }
}

// Protect all /api/student/* endpoints with Firebase Authentication
router.use(authenticateFirebaseUser);
router.use(buildStudentContext);

// 1. Dashboard API
router.get('/dashboard', (req, res, next) => studentController.getDashboard(req, res, next));

// 2. Profile APIs
router.get('/profile', (req, res, next) => studentController.getProfile(req, res, next));
router.patch('/profile', (req, res, next) => studentController.updateProfile(req, res, next));

// 3. Class API
router.get('/class', (req, res, next) => studentController.getClass(req, res, next));

// 4. Batch API
router.get('/batch', (req, res, next) => studentController.getBatch(req, res, next));

// 5. Program API
router.get('/program', (req, res, next) => studentController.getProgram(req, res, next));

// 6. Department API
router.get('/department', (req, res, next) => studentController.getDepartment(req, res, next));

// 7. Subjects API
router.get('/subjects', (req, res, next) => studentController.getSubjects(req, res, next));

// 8. Class Incharge API
router.get('/class-incharge', (req, res, next) => studentController.getClassIncharge(req, res, next));

// 9. Academic Years API
router.get('/academic-years', (req, res, next) => studentController.getAcademicYears(req, res, next));

// 10. Semesters API
router.get('/semesters', (req, res, next) => studentController.getSemesters(req, res, next));

// 11. Class Master Timetable API (Real schedule from Class Incharge)
router.get('/timetable', (req, res, next) => studentController.getTimetable(req, res, next));

// 12. Attendance API (Real metrics and daily verified logs)
router.get('/attendance', (req, res, next) => studentController.getAttendance(req, res, next));

// 13. Assignments API
router.get('/assignments', (req, res, next) => studentController.getAssignments(req, res, next));
router.post('/assignments/:assignmentId/submit', uploadMemory.single('file'), (req, res, next) => studentController.submitAssignment(req, res, next));

export default router;
