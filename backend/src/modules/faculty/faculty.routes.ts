import { Router } from 'express';
import { FacultyRepository } from './faculty.repository';
import { FacultyService } from './faculty.service';
import { FacultyController } from './faculty.controller';
import { facultyAuthMiddleware, requireFaculty } from './faculty.middleware';

const router = Router();

const repo = new FacultyRepository();
const service = new FacultyService(repo);
const controller = new FacultyController(service);

// Enforce authentication on all faculty routes
router.use(facultyAuthMiddleware);

// Enforce role = FACULTY / authorized academic staff on all faculty routes
router.use(requireFaculty);

// Dashboard & Search
router.get('/dashboard', controller.getDashboard);
router.get('/today-reminders', controller.getTodayReminders);
router.get('/reminders/today', controller.getTodayReminders);
router.get('/search', controller.search);

// Profile
router.get('/profile', controller.getProfile);
router.patch('/profile', controller.updateProfile);

// Department
router.get('/department', controller.getDepartment);

// Assigned Classes & Students
router.get('/classes', controller.getAssignedClasses);
router.get('/classes/:classId', controller.getClassDetails);
router.get('/classes/:classId/students', controller.getClassStudents);
router.post('/classes/:classId/students', controller.addStudent);
router.delete('/classes/:classId/students/:studentUid', controller.deleteStudent);
router.post('/classes/:classId/students/bulk', controller.bulkUploadStudents);
router.post('/classes/:classId/class-rep', controller.assignClassRepresentative);

// Class Master Timetable (Period-wise Schedule for All Students)
router.get('/classes/:classId/timetable', controller.getClassTimetable);
router.post('/classes/:classId/timetable', controller.saveClassTimetableSlot);
router.post('/classes/:classId/timetable/bulk', controller.bulkSaveClassTimetable);
router.delete('/classes/:classId/timetable/:slotId', controller.deleteClassTimetableSlot);

// Student Details (View Only)
router.get('/students/:studentId', controller.getStudentDetails);

// Subjects & Class-wise Performance
router.get('/subjects', controller.getSubjects);
router.get('/my-subjects', controller.getMySubjects);
router.get('/my-subjects/performance', controller.getMySubjectsPerformance);

// Assignments
router.post('/assignments', controller.createAssignment);
router.get('/assignments', controller.getAssignments);
router.get('/assignments/:assignmentId/submissions', controller.getAssignmentSubmissions);

// Academic Info
router.get('/academic-years', controller.getAcademicYears);
router.get('/semesters', controller.getSemesters);

// Attendance Management
router.get('/attendance/session', controller.getAttendanceSession);
router.post('/attendance/session', controller.saveAttendanceSession);
router.get('/attendance/stats/:classId', controller.getClassAttendanceStats);
router.get('/attendance/history/:classId', controller.getClassAttendanceHistory);

// Timetable Management
router.get('/timetable', controller.getTimetable);
router.post('/timetable', controller.saveTimetableSlot);
router.post('/timetable/bulk', controller.bulkSaveTimetable);
router.delete('/timetable/:id', controller.deleteTimetableSlot);

// Reminders Management
router.get('/reminders', controller.getReminders);
router.post('/reminders', controller.createReminder);
router.put('/reminders/:id', controller.updateReminder);
router.patch('/reminders/:id/status', controller.toggleReminderStatus);
router.delete('/reminders/:id', controller.deleteReminder);

export default router;

