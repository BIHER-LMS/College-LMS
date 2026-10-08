import { Router } from 'express';
import { getHealth } from '../controllers/healthController';
import { requireHODOrAdmin } from '../middleware/authMiddleware';
import { hodController } from '../controllers/hodController';
import hodRoutes from './hodRoutes';

const router = Router();

// Primary HOD Module Namespace
router.use('/hod', hodRoutes);

// Direct Resource Routes (aliased to HOD department-scoped controller with full authorization)
const deptRouter = Router();
deptRouter.use(requireHODOrAdmin);
deptRouter.get('/', (req, res, next) => hodController.getDepartment(req, res, next));
deptRouter.get('/:id', (req, res, next) => hodController.getDepartment(req, res, next));
router.use('/departments', deptRouter);

const facultyRouter = Router();
facultyRouter.use(requireHODOrAdmin);
facultyRouter.get('/', (req, res, next) => hodController.getFaculty(req, res, next));
facultyRouter.get('/:facultyUid', (req, res, next) => hodController.getFacultyById(req, res, next));
facultyRouter.post('/:facultyUid/subjects', (req, res, next) => hodController.assignFacultySubjects(req, res, next));
facultyRouter.delete('/:facultyUid/classes/:classId/subjects/:subjectId', (req, res, next) => hodController.unassignFacultySubject(req, res, next));
router.use('/faculty', facultyRouter);

const classRouter = Router();
classRouter.use(requireHODOrAdmin);
classRouter.get('/', (req, res, next) => hodController.getClasses(req, res, next));
classRouter.post('/', (req, res, next) => hodController.createClass(req, res, next));
classRouter.get('/:classId', (req, res, next) => hodController.getClassById(req, res, next));
classRouter.patch('/:classId', (req, res, next) => hodController.updateClass(req, res, next));
classRouter.patch('/:classId/faculty', (req, res, next) => hodController.assignClassIncharge(req, res, next));
classRouter.post('/:classId/incharge', (req, res, next) => hodController.assignClassIncharge(req, res, next));
classRouter.post('/:classId/subjects', (req, res, next) => hodController.assignSubjectToClass(req, res, next));
classRouter.patch('/:classId/subjects/:subjectId/faculty', (req, res, next) => hodController.assignSubjectTeacher(req, res, next));
router.use('/classes', classRouter);

const programRouter = Router();
programRouter.use(requireHODOrAdmin);
programRouter.get('/', (req, res, next) => hodController.getPrograms(req, res, next));
programRouter.post('/', (req, res, next) => hodController.createProgram(req, res, next));
programRouter.patch('/:programId', (req, res, next) => hodController.updateProgram(req, res, next));
router.use('/programs', programRouter);

const batchRouter = Router();
batchRouter.use(requireHODOrAdmin);
batchRouter.get('/', (req, res, next) => hodController.getBatches(req, res, next));
batchRouter.post('/', (req, res, next) => hodController.createBatch(req, res, next));
batchRouter.patch('/:batchId', (req, res, next) => hodController.updateBatch(req, res, next));
router.use('/batches', batchRouter);

const studentRouter = Router();
studentRouter.use(requireHODOrAdmin);
studentRouter.get('/', (req, res, next) => hodController.getStudents(req, res, next));
studentRouter.get('/:studentId', (req, res, next) => hodController.getStudentById(req, res, next));
router.use('/students', studentRouter);

const subjectRouter = Router();
subjectRouter.use(requireHODOrAdmin);
subjectRouter.get('/', (req, res, next) => hodController.getSubjects(req, res, next));
subjectRouter.post('/', (req, res, next) => hodController.createSubject(req, res, next));
subjectRouter.patch('/:subjectId', (req, res, next) => hodController.updateSubject(req, res, next));
router.use('/subjects', subjectRouter);

const academicYearRouter = Router();
academicYearRouter.use(requireHODOrAdmin);
academicYearRouter.get('/', (req, res, next) => hodController.getAcademicYears(req, res, next));
router.use('/academic-years', academicYearRouter);

const semesterRouter = Router();
semesterRouter.use(requireHODOrAdmin);
semesterRouter.get('/', (req, res, next) => hodController.getSemesters(req, res, next));
router.use('/semesters', semesterRouter);

export default router;
