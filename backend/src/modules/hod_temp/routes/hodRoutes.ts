import { Router } from 'express';
import { hodController } from '../controllers/hodController';
import { requireHODOrAdmin } from '../middleware/authMiddleware';

const router = Router();

// All HOD routes require authentication and HOD role
router.use(requireHODOrAdmin);

// 1. Shuban — Authentication Context, Dashboard & Department
router.get('/dashboard', (req, res, next) => hodController.getDashboard(req, res, next));
router.get('/department', (req, res, next) => hodController.getDepartment(req, res, next));

// 2. Thejus — Faculty Management
import { facultyController } from '../controllers/facultyController';
router.get('/faculty/pending', (req, res, next) => facultyController.getPendingApplications(req, res, next));
router.post('/faculty/pending/:id/approve', (req, res, next) => facultyController.approveApplication(req, res, next));
router.get('/faculty', (req, res, next) => hodController.getFaculty(req, res, next));
router.get('/faculty/:facultyUid', (req, res, next) => hodController.getFacultyById(req, res, next));
router.post('/faculty/:facultyUid/subjects', (req, res, next) => hodController.assignFacultySubjects(req, res, next));
router.delete('/faculty/:facultyUid/classes/:classId/subjects/:subjectId', (req, res, next) => hodController.unassignFacultySubject(req, res, next));

// 3. Raivathy — Program & Batch Management
router.get('/programs', (req, res, next) => hodController.getPrograms(req, res, next));
router.post('/programs', (req, res, next) => hodController.createProgram(req, res, next));
router.patch('/programs/:programId', (req, res, next) => hodController.updateProgram(req, res, next));

router.get('/batches', (req, res, next) => hodController.getBatches(req, res, next));
router.post('/batches', (req, res, next) => hodController.createBatch(req, res, next));
router.patch('/batches/:batchId', (req, res, next) => hodController.updateBatch(req, res, next));

// 4. Jeffy — Class Management & Class Incharge Assignment
router.get('/classes', (req, res, next) => hodController.getClasses(req, res, next));
router.post('/classes', (req, res, next) => hodController.createClass(req, res, next));
router.get('/classes/:classId', (req, res, next) => hodController.getClassById(req, res, next));
router.patch('/classes/:classId', (req, res, next) => hodController.updateClass(req, res, next));
router.patch('/classes/:classId/faculty', (req, res, next) => hodController.assignClassIncharge(req, res, next));
router.post('/classes/:classId/incharge', (req, res, next) => hodController.assignClassIncharge(req, res, next));
router.post('/classes/:classId/subjects', (req, res, next) => hodController.assignSubjectToClass(req, res, next));
router.patch('/classes/:classId/subjects/:subjectId/faculty', (req, res, next) => hodController.assignSubjectTeacher(req, res, next));

// 5. Sai Preethi — Students, Subjects & Academic Information
router.get('/students', (req, res, next) => hodController.getStudents(req, res, next));
router.get('/students/:studentId', (req, res, next) => hodController.getStudentById(req, res, next));

router.get('/subjects', (req, res, next) => hodController.getSubjects(req, res, next));
router.post('/subjects', (req, res, next) => hodController.createSubject(req, res, next));
router.patch('/subjects/:subjectId', (req, res, next) => hodController.updateSubject(req, res, next));

router.get('/academic-years', (req, res, next) => hodController.getAcademicYears(req, res, next));
router.get('/semesters', (req, res, next) => hodController.getSemesters(req, res, next));

// 6. HOD Profile
router.get('/profile', (req, res, next) => hodController.getProfile(req, res, next));
router.patch('/profile', (req, res, next) => hodController.updateProfile(req, res, next));
router.put('/profile', (req, res, next) => hodController.updateProfile(req, res, next));

// 7. Extra Stubs (Attendance, Curriculum, Announcements, Alerts)
router.get('/attendance-summary', (req, res, next) => hodController.getAttendanceSummary(req, res, next));
router.get('/curriculum', (req, res, next) => hodController.getCurriculum(req, res, next));
router.get('/announcements', (req, res, next) => hodController.getAnnouncements(req, res, next));
router.post('/announcements', (req, res, next) => hodController.createAnnouncement(req, res, next));
router.get('/academic-alerts', (req, res, next) => hodController.getAcademicAlerts(req, res, next));

export default router;
