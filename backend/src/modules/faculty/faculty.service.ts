import { FacultyRepository } from './faculty.repository';
import { memoryCache } from '../../lib/cache';
import {
  FacultyDashboardResponse,
  FacultyProfile,
  FacultyProfileUpdateInput,
  FacultyClassSummary,
  ClassStudentSummary,
  StudentDetails,
  DepartmentInfo,
  SubjectInfo,
  AcademicYearInfo,
  SemesterInfo,
  FacultySearchResults,
  MarkAttendanceSessionInput,
  AttendanceSessionDetail,
  AttendanceSessionSummary,
  ClassAttendanceStatsResponse,
  TodayRemindersSummary,
  FacultyTimetableSlot,
  FacultyReminder,
  CreateReminderInput,
  ReminderStatus,
  BulkStudentUploadItem,
  ClassTimetableSlot,
  FacultySubjectClassPerformance,
  ClassRepresentativeInfo,
} from './faculty.types';

export class FacultyService {
  constructor(private repo: FacultyRepository) {}

  async getDashboard(uid: string): Promise<FacultyDashboardResponse> {
    const cacheKey = `dashboard:${uid}`;
    const cached = memoryCache.get<FacultyDashboardResponse>(cacheKey);
    if (cached) return cached;

    // Parallel query stage 1: authedUser, profile, and assigned classes in parallel
    const [authedUser, userProfile, assignedClasses] = await Promise.all([
      this.repo.getAuthedUser(uid),
      this.repo.getFacultyUserProfile(uid),
      this.repo.getAssignedClasses(uid),
    ]);

    if (!authedUser) {
      throw new Error('Faculty user record not found');
    }

    const assignedClass = assignedClasses[0] || null;
    const deptId = authedUser.department_id || '1aa45ae9-e872-4931-8e67-22f5119ce498';
    const collegeId = authedUser.college_id || 'col-1790654578727-zhdd';

    // Parallel query stage 2: department and academic year in parallel
    const [dept, currentYear] = await Promise.all([
      deptId ? this.repo.getDepartmentById(deptId) : Promise.resolve(null),
      collegeId ? this.repo.getCurrentAcademicYear(collegeId) : Promise.resolve(null),
    ]);

    let departmentData = null;
    if (dept) {
      departmentData = {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        hodName: dept.authed_users_departments_hod_uidToauthed_users?.display_name || null,
      };
    }

    let academicYearData = null;
    let semesterData = null;

    if (currentYear) {
      academicYearData = {
        id: currentYear.id,
        name: currentYear.name,
        startDate: currentYear.start_date,
        endDate: currentYear.end_date,
      };

      const currentSem = currentYear.semesters?.[0];
      if (currentSem) {
        semesterData = {
          id: currentSem.id,
          termNumber: currentSem.term_number,
          startDate: currentSem.start_date,
          endDate: currentSem.end_date,
        };
      }
    }

    const result: FacultyDashboardResponse = {
      faculty: {
        uid: authedUser.uid,
        name:
          userProfile?.profiles?.displayName ||
          authedUser.display_name ||
          `${userProfile?.profiles?.firstName || ''} ${userProfile?.profiles?.lastName || ''}`.trim() ||
          authedUser.email,
        email: authedUser.email,
        phone: userProfile?.profiles?.phone || userProfile?.phone || null,
        employeeId: userProfile?.profiles?.employeeId || null,
        designation: userProfile?.profiles?.designation || 'Faculty Member',
        profilePhoto: userProfile?.profiles?.profilePhotoUrl || authedUser.photo_url || null,
      },
      department: departmentData,
      classIncharge: {
        isAssigned: !!assignedClass,
        class: assignedClass
          ? {
              id: assignedClass.id,
              name: assignedClass.name,
              currentSemester: assignedClass.current_semester,
              batch: assignedClass.batch ? `${assignedClass.batch.start_year}-${assignedClass.batch.end_year}` : null,
              program: assignedClass.batch?.program?.name || null,
              studentCount: assignedClass._count?.students || 0,
            }
          : null,
      },
      assignedSubject: authedUser.subject
        ? {
            id: authedUser.subject.id,
            name: authedUser.subject.name,
            code: authedUser.subject.code,
            credits: authedUser.subject.credits,
            semesterNumber: authedUser.subject.semester_number,
          }
        : null,
      assignedSubjects: authedUser.facultySubjects?.map((fs: any) => ({
        id: fs.subject.id,
        name: fs.subject.name,
        code: fs.subject.code,
        classId: fs.class.id,
        className: fs.class.name,
      })) || [],
      academicYear: academicYearData,
      semester: semesterData,
    };

    memoryCache.set(cacheKey, result, 60);
    return result;
  }

  async getProfile(uid: string): Promise<FacultyProfile> {
    const cacheKey = `profile:${uid}`;
    const cached = memoryCache.get<FacultyProfile>(cacheKey);
    if (cached) return cached;

    const [authedUser, userProfile] = await Promise.all([
      this.repo.getAuthedUser(uid),
      this.repo.getFacultyUserProfile(uid),
    ]);

    if (!authedUser) {
      throw new Error('Faculty user record not found');
    }

    const profile = userProfile?.profiles;

    const result: FacultyProfile = {
      id: userProfile?.id || authedUser.uid,
      uid: authedUser.uid,
      firstName: profile?.firstName || null,
      lastName: profile?.lastName || null,
      displayName: profile?.displayName || authedUser.display_name || null,
      employeeId: profile?.employeeId || null,
      designation: profile?.designation || 'Faculty Member',
      department: authedUser.department?.name || profile?.department || 'Bsc AI and ML',
      departmentId: authedUser.department_id || '1aa45ae9-e872-4931-8e67-22f5119ce498',
      email: authedUser.email,
      phone: profile?.phone || userProfile?.phone || null,
      address: profile?.address || null,
      city: profile?.city || null,
      state: profile?.state || null,
      bio: profile?.bio || null,
      profilePhoto: profile?.profilePhotoUrl || authedUser.photo_url || null,
      accountStatus: authedUser.approval_status || 'ACTIVE',
    };

    memoryCache.set(cacheKey, result, 60);
    return result;
  }

  async updateProfile(uid: string, input: FacultyProfileUpdateInput): Promise<FacultyProfile> {
    await this.repo.updateFacultyProfile(uid, input);
    memoryCache.del(`profile:${uid}`);
    memoryCache.del(`dashboard:${uid}`);
    return this.getProfile(uid);
  }

  async getAssignedClasses(facultyUid: string): Promise<FacultyClassSummary[]> {
    const cacheKey = `classes:${facultyUid}`;
    const cached = memoryCache.get<FacultyClassSummary[]>(cacheKey);
    if (cached) return cached;

    const classes = await this.repo.getAssignedClasses(facultyUid);

    const result = classes.map((c) => ({
      id: c.id,
      name: c.name,
      batch: c.batch ? `${c.batch.start_year}-${c.batch.end_year}` : null,
      program: c.batch?.program?.name || null,
      department: c.batch?.program?.department?.name || null,
      currentSemester: c.current_semester,
      isActive: c.is_active ?? true,
      inchargeFaculty: {
        uid: facultyUid,
        name: c.faculty_uid === facultyUid ? 'You (Class Incharge)' : 'You (Subject Teacher)',
      },
      studentCount: c._count?.students || 0,
    }));

    memoryCache.set(cacheKey, result, 60);
    return result;
  }

  async getClassDetails(classId: string, facultyUid: string): Promise<FacultyClassSummary> {
    const cls = await this.repo.getClassById(classId);

    if (!cls) {
      throw { status: 404, message: 'Class not found' };
    }

    // Authorization check: Must be the assigned class incharge
    if (cls.faculty_uid !== facultyUid) {
      throw { status: 403, message: 'Forbidden: You are not the Class Incharge for this class' };
    }

    return {
      id: cls.id,
      name: cls.name,
      batch: cls.batch ? `${cls.batch.start_year}-${cls.batch.end_year}` : null,
      program: cls.batch?.program?.name || null,
      department: cls.batch?.program?.department?.name || null,
      currentSemester: cls.current_semester,
      isActive: cls.is_active ?? true,
      inchargeFaculty: {
        uid: facultyUid,
        name: cls.incharge_faculty?.display_name || 'Class Incharge',
      },
      studentCount: cls._count?.students || 0,
      classRep: cls.classRep || null,
      overallAttendance: cls.overallAttendance ?? null,
      overallPerformance: cls.overallPerformance ?? null,
    };
  }

  async getClassStudents(classId: string, facultyUid: string): Promise<ClassStudentSummary[]> {
    const cls = await this.repo.getClassById(classId);

    if (!cls) {
      throw { status: 404, message: 'Class not found' };
    }

    // Authorization check: Must be assigned class incharge
    if (cls.faculty_uid !== facultyUid) {
      throw { status: 403, message: 'Forbidden: You are not authorized to view students of this class' };
    }

    const students = await this.repo.getClassStudents(classId);

    return students.map((s) => ({
      uid: s.uid,
      name: s.name || s.display_name || s.email,
      registerNumber: s.registerNumber || s.register_number || null,
      email: s.email,
      dob: s.dob || null,
      phone: s.phone || null,
      parentPhone: s.parentPhone || s.parent_phone || null,
      profilePhoto: s.profilePhoto || s.photo_url || null,
      accountStatus: s.accountStatus || s.approval_status || 'ACTIVE',
      isClassRep: s.isClassRep || false,
      attendancePercentage: s.attendancePercentage ?? null,
      performanceGrade: s.performanceGrade ?? null,
      performanceScore: s.performanceScore ?? null,
    }));
  }

  async getStudentDetails(studentUid: string, facultyUid: string): Promise<StudentDetails> {
    const data = await this.repo.getStudentByUid(studentUid);

    if (!data || !data.authedStudent) {
      throw { status: 404, message: 'Student not found' };
    }

    const student = data.authedStudent;

    if (!student.class) {
      throw { status: 403, message: 'Access denied: Student is not assigned to any class' };
    }

    // Verify student belongs to faculty's assigned class
    if (student.class.faculty_uid !== facultyUid) {
      throw { status: 403, message: 'Forbidden: You can only view students of your assigned class' };
    }

    const profile = data.userProfile?.profiles;

    return {
      uid: student.uid,
      firstName: profile?.firstName || null,
      lastName: profile?.lastName || null,
      displayName: profile?.displayName || student.display_name || student.email,
      registerNumber: student.register_number || profile?.studentId || null,
      email: student.email,
      phone: profile?.phone || data.userProfile?.phone || null,
      profilePhoto: profile?.profilePhotoUrl || student.photo_url || null,
      accountStatus: student.approval_status || 'ACTIVE',
      className: student.class.name,
      classId: student.class.id,
      departmentName: student.class.batch?.program?.department?.name || null,
      enrollmentYear: profile?.enrollmentYear || null,
      city: profile?.city || null,
      state: profile?.state || null,
    };
  }

  async getDepartment(departmentId: string): Promise<DepartmentInfo> {
    const cacheKey = `department:${departmentId}`;
    const cached = memoryCache.get<DepartmentInfo>(cacheKey);
    if (cached) return cached;

    const dept = await this.repo.getDepartmentById(departmentId);

    if (!dept) {
      throw { status: 404, message: 'Department not found' };
    }

    const result: DepartmentInfo = {
      id: dept.id,
      name: dept.name,
      code: dept.code,
      collegeName: dept.college?.name || null,
      hodName: dept.authed_users_departments_hod_uidToauthed_users?.display_name || null,
      programs: (dept.programs || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        durationYears: p.duration_years,
      })),
      subjectsCount: dept._count?.subjects || 0,
      status: dept.is_active ? 'ACTIVE' : 'INACTIVE',
    };

    memoryCache.set(cacheKey, result, 120);
    return result;
  }

  async getSubjects(departmentId: string, semesterNumber?: number): Promise<SubjectInfo[]> {
    const cacheKey = `subjects:${departmentId}:${semesterNumber || 'all'}`;
    const cached = memoryCache.get<SubjectInfo[]>(cacheKey);
    if (cached) return cached;

    const subjects = await this.repo.getDepartmentSubjects(departmentId, semesterNumber);

    const result = subjects.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      credits: s.credits ?? 3,
      semesterNumber: s.semester_number,
      isActive: s.is_active ?? true,
      departmentId: s.department_id,
    }));

    memoryCache.set(cacheKey, result, 120);
    return result;
  }

  async getAcademicYears(collegeId: string): Promise<AcademicYearInfo[]> {
    const cacheKey = `academicYears:${collegeId}`;
    const cached = memoryCache.get<AcademicYearInfo[]>(cacheKey);
    if (cached) return cached;

    const years = await this.repo.getAcademicYears(collegeId);

    const result = years.map((y) => ({
      id: y.id,
      name: y.name,
      startDate: y.start_date,
      endDate: y.end_date,
      isCurrent: y.is_current ?? false,
      status: 'ACTIVE',
    }));

    memoryCache.set(cacheKey, result, 300);
    return result;
  }

  async getSemesters(collegeId: string): Promise<SemesterInfo[]> {
    const cacheKey = `semesters:${collegeId}`;
    const cached = memoryCache.get<SemesterInfo[]>(cacheKey);
    if (cached) return cached;

    const semesters = await this.repo.getSemesters(collegeId);

    const result = semesters.map((s) => ({
      id: s.id,
      academicYearId: s.academic_year_id,
      academicYearName: s.academic_year?.name || 'Academic Year',
      termNumber: s.term_number,
      startDate: s.start_date,
      endDate: s.end_date,
      isCurrent: false,
    }));

    memoryCache.set(cacheKey, result, 300);
    return result;
  }

  async search(uid: string, query: string): Promise<FacultySearchResults> {
    return this.repo.searchAll(uid, query);
  }

  async getAttendanceSession(facultyUid: string, classId: string, date: string, period: string): Promise<AttendanceSessionDetail> {
    return this.repo.getAttendanceSession(facultyUid, classId, date, period);
  }

  async saveAttendanceSession(facultyUid: string, input: MarkAttendanceSessionInput) {
    const result = await this.repo.saveAttendanceSession(facultyUid, input);
    // Invalidate attendance stats & history cache for this class
    memoryCache.del(`attendance:stats:${input.classId}`);
    memoryCache.del(`attendance:history:${input.classId}`);
    return result;
  }

  async getClassAttendanceStats(facultyUid: string, classId: string): Promise<ClassAttendanceStatsResponse> {
    return this.repo.getClassAttendanceStats(facultyUid, classId);
  }

  async getClassAttendanceHistory(facultyUid: string, classId: string): Promise<AttendanceSessionSummary[]> {
    return this.repo.getClassAttendanceHistory(facultyUid, classId);
  }

  async getTodayReminders(facultyUid: string): Promise<TodayRemindersSummary> {
    return this.repo.getTodayReminders(facultyUid);
  }

  // ==========================================
  // TIMETABLE
  // ==========================================
  async getTimetable(uid: string): Promise<FacultyTimetableSlot[]> {
    return this.repo.getTimetable(uid);
  }

  async saveTimetableSlot(uid: string, slot: Partial<FacultyTimetableSlot>): Promise<FacultyTimetableSlot> {
    return this.repo.saveTimetableSlot(uid, slot);
  }

  async bulkSaveTimetable(uid: string, slots: Partial<FacultyTimetableSlot>[], replaceExisting: boolean = true) {
    return this.repo.bulkSaveTimetable(uid, slots, replaceExisting);
  }

  async deleteTimetableSlot(uid: string, slotId: string): Promise<boolean> {
    return this.repo.deleteTimetableSlot(uid, slotId);
  }

  // ==========================================
  // REMINDERS
  // ==========================================
  async getReminders(uid: string, filter?: { type?: string; status?: string }): Promise<FacultyReminder[]> {
    return this.repo.getReminders(uid, filter);
  }

  async createReminder(uid: string, input: CreateReminderInput): Promise<FacultyReminder> {
    return this.repo.createReminder(uid, input);
  }

  async updateReminder(uid: string, id: string, input: Partial<CreateReminderInput & { status: ReminderStatus }>): Promise<FacultyReminder> {
    return this.repo.updateReminder(uid, id, input);
  }

  async toggleReminderStatus(uid: string, id: string): Promise<FacultyReminder> {
    return this.repo.toggleReminderStatus(uid, id);
  }

  async deleteReminder(uid: string, id: string): Promise<boolean> {
    return this.repo.deleteReminder(uid, id);
  }

  // ==========================================
  // BULK STUDENT UPLOAD (EXCEL / CSV)
  // ==========================================
  async bulkUploadStudents(
    facultyUid: string,
    classId: string,
    students: BulkStudentUploadItem[]
  ): Promise<{ count: number; students: any[] }> {
    const cls = await this.repo.getClassById(classId);
    if (!cls) {
      throw { status: 404, message: 'Class not found' };
    }
    if (cls.faculty_uid !== facultyUid) {
      throw { status: 403, message: 'Forbidden: You are not authorized to upload students to this class' };
    }
    return this.repo.bulkUploadStudents(facultyUid, classId, students);
  }

  // ==========================================
  // MANUALLY ADD A STUDENT
  // ==========================================
  async addStudent(
    facultyUid: string,
    classId: string,
    student: BulkStudentUploadItem
  ): Promise<any> {
    const cls = await this.repo.getClassById(classId);
    if (!cls) {
      throw { status: 404, message: 'Class not found' };
    }
    if (cls.faculty_uid !== facultyUid) {
      throw { status: 403, message: 'Forbidden: You are not the Class Incharge for this class' };
    }
    return this.repo.addStudent(facultyUid, classId, student);
  }

  // ==========================================
  // DELETE / REMOVE STUDENT FROM CLASS
  // ==========================================
  async deleteStudent(
    facultyUid: string,
    classId: string,
    studentUid: string
  ): Promise<{ success: boolean; message: string }> {
    const cls = await this.repo.getClassById(classId);
    if (!cls) {
      throw { status: 404, message: 'Class not found' };
    }
    if (cls.faculty_uid !== facultyUid) {
      throw { status: 403, message: 'Forbidden: You are not the Class Incharge for this class' };
    }
    return this.repo.deleteStudent(facultyUid, classId, studentUid);
  }

  // ==========================================
  // CLASS REPRESENTATIVE (CR) ASSIGNMENT
  // ==========================================
  async assignClassRepresentative(
    facultyUid: string,
    classId: string,
    studentUid: string | null
  ): Promise<{ classId: string; classRepUid: string | null; classRep: ClassRepresentativeInfo | null }> {
    const cls = await this.repo.getClassById(classId);
    if (!cls) {
      throw { status: 404, message: 'Class not found' };
    }
    if (cls.faculty_uid !== facultyUid) {
      throw { status: 403, message: 'Forbidden: You are not the Class Incharge for this class' };
    }
    return this.repo.assignClassRepresentative(facultyUid, classId, studentUid);
  }

  // ==========================================
  // CLASS MASTER TIMETABLE (FOR ENTIRE CLASS)
  // ==========================================
  async getClassTimetable(facultyUid: string, classId: string): Promise<ClassTimetableSlot[]> {
    return this.repo.getClassTimetable(facultyUid, classId);
  }

  async saveClassTimetableSlot(
    facultyUid: string,
    classId: string,
    slot: Partial<ClassTimetableSlot>
  ): Promise<ClassTimetableSlot> {
    await this.repo.assertFacultyClassAccess(facultyUid, classId, true);
    return this.repo.saveClassTimetableSlot(classId, slot);
  }

  async bulkSaveClassTimetable(
    facultyUid: string,
    classId: string,
    slots: Partial<ClassTimetableSlot>[],
    replaceExisting: boolean = true
  ): Promise<{ count: number; slots: ClassTimetableSlot[] }> {
    await this.repo.assertFacultyClassAccess(facultyUid, classId, true);
    return this.repo.bulkSaveClassTimetable(classId, slots, replaceExisting);
  }

  async deleteClassTimetableSlot(
    facultyUid: string,
    classId: string,
    slotId: string
  ): Promise<boolean> {
    await this.repo.assertFacultyClassAccess(facultyUid, classId, true);
    return this.repo.deleteClassTimetableSlot(classId, slotId);
  }

  // ==========================================
  // SUBJECTS & CLASS-WISE PERFORMANCE
  // ==========================================
  async getFacultySubjectsWithClassPerformance(
    facultyUid: string
  ): Promise<FacultySubjectClassPerformance[]> {
    return this.repo.getFacultySubjectsWithClassPerformance(facultyUid);
  }

  // ==========================================
  // ASSIGNMENTS & SUBMISSIONS
  // ==========================================
  async getMySubjects(facultyUid: string): Promise<any[]> {
    return this.repo.getMySubjects(facultyUid);
  }

  async createAssignment(facultyUid: string, data: any): Promise<any> {
    return this.repo.createAssignment(facultyUid, data);
  }

  async getAssignments(facultyUid: string, classSubjectId?: string): Promise<any[]> {
    return this.repo.getAssignments(facultyUid, classSubjectId);
  }

  async getAssignmentSubmissions(facultyUid: string, assignmentId: string): Promise<any[]> {
    return this.repo.getAssignmentSubmissions(facultyUid, assignmentId);
  }
}
