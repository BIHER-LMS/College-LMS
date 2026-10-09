import { StudentRepository } from './student.repository';
import {
  StudentContext,
  StudentProfile,
  StudentUpdateProfileDTO,
  ClassInfo,
  BatchInfo,
  ProgramInfo,
  DepartmentInfo,
  SubjectInfo,
  ClassInchargeInfo,
  AcademicYearInfo,
  SemesterInfo,
  StudentDashboardResponse,
  ClassTimetableSlot,
  StudentAttendanceResponse,
  StudentDayAttendance,
  StudentPeriodAttendanceRecord,
} from './student.types';
import { AppError } from '../../utils/errors';

export class StudentService {
  constructor(private readonly studentRepo: StudentRepository) {}

  /**
   * Derive and load complete student dashboard
   * Optimized with parallelized stages and single-query hierarchy load.
   */
  async getDashboard(studentContext: StudentContext): Promise<StudentDashboardResponse> {
    // Stage 1: Parallel fetch of profile, class full hierarchy, and academic years
    const [profile, hierarchy, academicYears] = await Promise.all([
      this.getProfile(studentContext),
      studentContext.classId
        ? this.studentRepo.getClassFullHierarchy(studentContext.classId)
        : Promise.resolve({
            classData: null,
            batchData: null,
            programData: null,
            deptData: null,
            classInchargeData: null,
          }),
      studentContext.collegeId
        ? this.studentRepo.getAcademicYears(studentContext.collegeId)
        : Promise.resolve([]),
    ]);

    const { classData, batchData, programData, classInchargeData } = hierarchy;
    let deptData = hierarchy.deptData;

    // Fallback if department could not be resolved from class hierarchy
    const resolvedDeptId = programData?.departmentId || studentContext.departmentId;
    if (!deptData && resolvedDeptId) {
      deptData = await this.studentRepo.getDepartmentById(resolvedDeptId);
    }

    const currentYear = academicYears.find((ay) => ay.isCurrent) || academicYears[0] || null;

    // Stage 2: Parallel fetch of subjects and semesters
    const [subjects, semesters] = await Promise.all([
      resolvedDeptId
        ? this.studentRepo.getSubjectsByDepartment(resolvedDeptId, classData?.currentSemester).then(async (subs) => {
            if (subs.length === 0) {
              return this.studentRepo.getSubjectsByDepartment(resolvedDeptId);
            }
            return subs;
          })
        : Promise.resolve([]),
      currentYear ? this.studentRepo.getSemesters(currentYear.id) : Promise.resolve([]),
    ]);

    let semesterData: SemesterInfo | null = null;
    if (semesters.length > 0) {
      const currentSemNum = classData?.currentSemester || 1;
      semesterData = semesters.find((s) => s.termNumber === currentSemNum) || semesters[0] || null;
    }

    return {
      student: profile,
      class: classData,
      batch: batchData,
      program: programData,
      department: deptData,
      classIncharge: classInchargeData,
      academicYear: currentYear,
      semester: semesterData,
      subjects,
    };
  }

  /**
   * View own profile
   */
  async getProfile(studentContext: StudentContext): Promise<StudentProfile> {
    const profile = await this.studentRepo.getStudentProfile(studentContext.uid);
    if (!profile) {
      throw new AppError(404, 'NOT_FOUND', 'Student profile record not found');
    }
    return profile;
  }

  /**
   * Update permitted profile fields
   */
  async updateProfile(studentContext: StudentContext, updates: StudentUpdateProfileDTO): Promise<StudentProfile> {
    const updated = await this.studentRepo.updateStudentProfile(studentContext.uid, updates);
    if (!updated) {
      throw new AppError(404, 'NOT_FOUND', 'Student profile could not be updated');
    }
    return updated;
  }

  /**
   * View student's own class
   */
  async getClass(studentContext: StudentContext): Promise<ClassInfo> {
    if (!studentContext.classId) {
      throw new AppError(404, 'NOT_FOUND', 'No class assigned to your student profile');
    }

    const classData = await this.studentRepo.getClassById(studentContext.classId);
    if (!classData) {
      throw new AppError(404, 'NOT_FOUND', 'Assigned class not found in system');
    }

    // Hydrate hierarchy
    if (classData.batchId) {
      classData.batch = await this.studentRepo.getBatchById(classData.batchId);
      if (classData.batch?.programId) {
        classData.program = await this.studentRepo.getProgramById(classData.batch.programId);
        if (classData.program?.departmentId) {
          classData.department = await this.studentRepo.getDepartmentById(classData.program.departmentId);
        }
      }
    }

    if (classData.facultyUid) {
      classData.classIncharge = await this.studentRepo.getClassIncharge(classData.facultyUid);
    }

    return classData;
  }

  /**
   * View student's own batch
   */
  async getBatch(studentContext: StudentContext): Promise<BatchInfo> {
    if (!studentContext.classId) {
      throw new AppError(404, 'NOT_FOUND', 'No class assigned, cannot resolve batch');
    }

    const classData = await this.studentRepo.getClassById(studentContext.classId);
    if (!classData || !classData.batchId) {
      throw new AppError(404, 'NOT_FOUND', 'No batch associated with your class');
    }

    const batch = await this.studentRepo.getBatchById(classData.batchId);
    if (!batch) {
      throw new AppError(404, 'NOT_FOUND', 'Batch record not found');
    }

    if (batch.programId) {
      batch.program = await this.studentRepo.getProgramById(batch.programId);
    }

    return batch;
  }

  /**
   * View student's own program
   */
  async getProgram(studentContext: StudentContext): Promise<ProgramInfo> {
    let programId: string | null = null;

    if (studentContext.classId) {
      const classData = await this.studentRepo.getClassById(studentContext.classId);
      if (classData?.batchId) {
        const batch = await this.studentRepo.getBatchById(classData.batchId);
        programId = batch?.programId || null;
      }
    }

    if (!programId) {
      throw new AppError(404, 'NOT_FOUND', 'No academic program associated with your student enrollment');
    }

    const program = await this.studentRepo.getProgramById(programId);
    if (!program) {
      throw new AppError(404, 'NOT_FOUND', 'Program record not found');
    }

    if (program.departmentId) {
      program.department = await this.studentRepo.getDepartmentById(program.departmentId);
    }

    return program;
  }

  /**
   * View student's own department
   */
  async getDepartment(studentContext: StudentContext): Promise<DepartmentInfo> {
    const deptId = studentContext.departmentId;
    if (!deptId) {
      throw new AppError(404, 'NOT_FOUND', 'No department assigned to your student profile');
    }

    const dept = await this.studentRepo.getDepartmentById(deptId);
    if (!dept) {
      throw new AppError(404, 'NOT_FOUND', 'Department record not found');
    }

    return dept;
  }

  /**
   * View department subjects, strictly restricted to student's department
   */
  async getSubjects(studentContext: StudentContext, semesterNumber?: number): Promise<SubjectInfo[]> {
    const deptId = studentContext.departmentId;
    if (!deptId) {
      throw new AppError(404, 'NOT_FOUND', 'No department assigned, cannot load subjects');
    }

    return this.studentRepo.getSubjectsByDepartment(deptId, semesterNumber);
  }

  /**
   * View Class Incharge assigned to student's class
   */
  async getClassIncharge(studentContext: StudentContext): Promise<ClassInchargeInfo> {
    if (!studentContext.classId) {
      throw new AppError(404, 'NOT_FOUND', 'No class assigned to your student profile');
    }

    const classData = await this.studentRepo.getClassById(studentContext.classId);
    if (!classData || !classData.facultyUid) {
      throw new AppError(404, 'NOT_FOUND', 'No Class Incharge assigned to your class');
    }

    const incharge = await this.studentRepo.getClassIncharge(classData.facultyUid);
    if (!incharge) {
      throw new AppError(404, 'NOT_FOUND', 'Class Incharge faculty details could not be found');
    }

    return incharge;
  }

  /**
   * View Academic Years for student's college
   */
  async getAcademicYears(studentContext: StudentContext): Promise<AcademicYearInfo[]> {
    if (!studentContext.collegeId) {
      throw new AppError(404, 'NOT_FOUND', 'No college affiliated with your student profile');
    }

    return this.studentRepo.getAcademicYears(studentContext.collegeId);
  }

  /**
   * View Semesters
   */
  async getSemesters(studentContext: StudentContext): Promise<SemesterInfo[]> {
    if (!studentContext.collegeId) {
      throw new AppError(404, 'NOT_FOUND', 'No college affiliated with your student profile');
    }

    const academicYears = await this.studentRepo.getAcademicYears(studentContext.collegeId);
    const currentYear = academicYears.find((ay) => ay.isCurrent) || academicYears[0];

    if (!currentYear) {
      return [];
    }

    return this.studentRepo.getSemesters(currentYear.id);
  }

  /**
   * Get Class Master Timetable for student's enrolled class
   */
  async getClassTimetable(studentContext: StudentContext): Promise<ClassTimetableSlot[]> {
    console.log('[DEBUG-TIMETABLE] studentContext.uid:', studentContext.uid);
    console.log('[DEBUG-TIMETABLE] studentContext.classId:', studentContext.classId);
    if (!studentContext.classId) {
      console.log('[DEBUG-TIMETABLE] No classId, returning []');
      return [];
    }
    const slots = await this.studentRepo.getClassTimetable(studentContext.classId);
    console.log('[DEBUG-TIMETABLE] Returned slots count:', slots.length);
    console.log('[DEBUG-TIMETABLE] Slots:', JSON.stringify(slots, null, 2));
    return slots;
  }

  /**
   * Get Student Attendance & Real Timetable Schedule
   * Optimized with single date-range query and parallel base data loading.
   */
  async getAttendance(studentContext: StudentContext, selectedDateStr?: string): Promise<StudentAttendanceResponse> {
    // Calculate dates for current week (Monday - Friday)
    const now = selectedDateStr ? new Date(selectedDateStr) : new Date();
    const currentDayOfWeek = now.getDay();
    const diffToMonday = (currentDayOfWeek === 0 ? -6 : 1) - currentDayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const mondayStr = monday.toISOString().slice(0, 10);
    const fridayStr = friday.toISOString().slice(0, 10);

    // Parallel Stage 1: Load summary, class data, timetable slots, and weekly attendance records
    const [summary, classData, allSlots, allWeeklyRecords] = await Promise.all([
      this.studentRepo.getStudentAttendanceSummary(studentContext.uid),
      studentContext.classId ? this.studentRepo.getClassById(studentContext.classId) : Promise.resolve(null),
      studentContext.classId ? this.studentRepo.getClassTimetable(studentContext.classId) : Promise.resolve([]),
      this.studentRepo.getAttendanceRecordsForDateRange(studentContext.uid, mondayStr, fridayStr),
    ]);

    // Subject Breakdown
    const currentSem = classData?.currentSemester || 1;
    const subjectBreakdown = await this.studentRepo.getSubjectAttendance(
      studentContext.uid,
      studentContext.departmentId,
      currentSem
    );

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dailySchedule: StudentDayAttendance[] = [];

    for (let i = 0; i < 5; i++) {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + i);

      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dd = String(targetDate.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const dayOfWeek = dayNames[i];
      const isToday = now.toISOString().slice(0, 10) === dateStr;
      const dayLabel = isToday ? `Today (${dayOfWeek})` : dayOfWeek;

      const formattedDisplayDate = targetDate.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });

      // Filter slots for this day from class_timetables
      const daySlots = allSlots.filter(
        (slot) => slot.day_of_week && slot.day_of_week.trim().toLowerCase() === dayOfWeek.toLowerCase()
      );

      // Match attendance records for this date from the pre-fetched batch
      const attendanceRecords = allWeeklyRecords.filter((rec: any) => {
        const recDate = rec.date_str || (rec.date instanceof Date ? rec.date.toISOString().slice(0, 10) : String(rec.date).slice(0, 10));
        return recDate === dateStr;
      });

      const periodRecords: StudentPeriodAttendanceRecord[] = daySlots.map((slot, idx) => {
        const periodNum = parseInt(slot.period.replace(/\D/g, '')) || idx + 1;
        const matched = attendanceRecords.find(
          (rec: any) =>
            rec.period === slot.period ||
            rec.period === `Period ${periodNum}` ||
            rec.period === String(periodNum)
        );

        let status: StudentPeriodAttendanceRecord['status'] = 'SCHEDULED';
        let markedAt: string | null = null;
        let verificationMethod = 'Scheduled';
        let topic = 'Curriculum Session';

        if (matched) {
          if (matched.status === 'EXCUSED') {
            status = 'ON_DUTY';
          } else {
            status = matched.status as any;
          }
          markedAt = matched.marked_at
            ? new Date(matched.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : null;
          verificationMethod = 'Biometric Log';
          topic = matched.session_remarks || matched.student_remarks || 'Attendance Recorded';
        }

        return {
          period: periodNum,
          periodLabel: slot.period,
          timeSlot: slot.start_time && slot.end_time ? `${slot.start_time} - ${slot.end_time}` : slot.start_time || `Period ${periodNum}`,
          courseCode: slot.subject_code || 'COURSE',
          courseName: slot.subject_name || 'Course Subject',
          facultyName: slot.faculty_name || 'Assigned Faculty',
          venue: slot.room || 'Classroom',
          status,
          markedAt,
          verificationMethod,
          topic,
        };
      });

      dailySchedule.push({
        dayName: dayLabel,
        dayOfWeek,
        dateStr: formattedDisplayDate,
        periods: periodRecords,
      });
    }

    return {
      summary,
      subjectBreakdown,
      dailySchedule,
    };
  }

  async getAssignments(ctx: StudentContext) {
    if (!ctx.classId) {
      return [];
    }
    return this.studentRepo.getAssignments(ctx.classId, ctx.uid);
  }

  async submitAssignment(ctx: StudentContext, assignmentId: string, data: any) {
    return this.studentRepo.submitAssignment(ctx.uid, assignmentId, data);
  }
}

export const studentService = new StudentService(new StudentRepository());

