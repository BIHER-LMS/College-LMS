import prisma from '../../config/database';
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
  ClassTimetableSlot,
  StudentAttendanceSummary,
  StudentSubjectAttendance,
} from './student.types';

export class StudentRepository {
  /**
   * Find authenticated student in authed_users
   */
  async findAuthedUser(uid: string): Promise<StudentContext | null> {
    const data = await prisma.authedUser.findUnique({
      where: { uid },
    });

    if (!data) {
      return null;
    }

    return {
      uid: data.uid,
      email: data.email,
      displayName: data.display_name,
      photoURL: data.photo_url,
      role: data.role || 'USER',
      collegeId: data.college_id,
      departmentId: data.department_id,
      classId: data.class_id,
      registerNumber: data.register_number,
    };
  }

  /**
   * Get student profile combining authed_users, users, and profiles
   */
  async getStudentProfile(uid: string): Promise<StudentProfile | null> {
    const authedUser = await this.findAuthedUser(uid);
    if (!authedUser) return null;

    // Load from users table
    const userData = await prisma.user.findUnique({
      where: { firebaseUid: uid },
      include: { profile: true }
    });

    const profileData = userData?.profile;

    return {
      id: profileData?.id || userData?.id || authedUser.uid,
      userId: userData?.id,
      firstName: profileData?.firstName || null,
      lastName: profileData?.lastName || null,
      displayName: profileData?.displayName || authedUser.displayName,
      studentId: authedUser.registerNumber || profileData?.studentId || null,
      email: authedUser.email,
      phone: profileData?.phone || userData?.phone || null,
      address: profileData?.address || null,
      city: profileData?.city || null,
      state: profileData?.state || null,
      dateOfBirth: profileData?.dateOfBirth ? profileData.dateOfBirth.toISOString() : null,
      gender: profileData?.gender || null,
      profilePhotoUrl: profileData?.profilePhotoUrl || authedUser.photoURL,
      enrollmentYear: profileData?.enrollmentYear || null,
      profileCompletionPercentage: profileData?.profileCompletionPercentage || 85,
      accountStatus: userData?.status || 'ACTIVE',
      bio: profileData?.bio || null,
    };
  }

  /**
   * Update student editable profile fields
   */
  async updateStudentProfile(uid: string, updates: StudentUpdateProfileDTO): Promise<StudentProfile | null> {
    const userData = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (userData?.id) {
      await prisma.profile.upsert({
        where: { userId: userData.id },
        update: {
          ...(updates.phone !== undefined && { phone: updates.phone }),
          ...(updates.address !== undefined && { address: updates.address }),
          ...(updates.city !== undefined && { city: updates.city }),
          ...(updates.state !== undefined && { state: updates.state }),
          ...(updates.profilePhotoUrl !== undefined && { profilePhotoUrl: updates.profilePhotoUrl }),
          ...(updates.bio !== undefined && { bio: updates.bio }),
        },
        create: {
          userId: userData.id,
          phone: updates.phone,
          address: updates.address,
          city: updates.city,
          state: updates.state,
          profilePhotoUrl: updates.profilePhotoUrl,
          bio: updates.bio,
        }
      });
    }

    // Also update photo_url in authed_users if updated
    if (updates.profilePhotoUrl !== undefined) {
      await prisma.authedUser.update({
        where: { uid },
        data: { photo_url: updates.profilePhotoUrl }
      });
    }

    return this.getStudentProfile(uid);
  }

  /**
   * Fetch Class by classId
   */
  async getClassById(classId: string): Promise<ClassInfo | null> {
    const data = await prisma.class.findUnique({
      where: { id: classId }
    });

    if (!data) return null;

    return {
      id: data.id,
      batchId: data.batch_id,
      name: data.name,
      currentSemester: data.current_semester || 1,
      facultyUid: data.faculty_uid,
      isActive: data.is_active ?? true,
    };
  }

  /**
   * Fetch Batch by batchId
   */
  async getBatchById(batchId: string): Promise<BatchInfo | null> {
    const data = await prisma.batch.findUnique({
      where: { id: batchId }
    });

    if (!data) return null;

    return {
      id: data.id,
      programId: data.program_id,
      startYear: data.start_year,
      endYear: data.end_year,
      name: `${data.start_year} - ${data.end_year}`,
      isActive: data.is_active ?? true,
    };
  }

  /**
   * Fetch Program by programId
   */
  async getProgramById(programId: string): Promise<ProgramInfo | null> {
    const data = await prisma.program.findUnique({
      where: { id: programId }
    });

    if (!data) return null;

    return {
      id: data.id,
      departmentId: data.department_id,
      name: data.name,
      type: data.type,
      durationYears: data.duration_years,
      isActive: data.is_active ?? true,
    };
  }

  /**
   * Fetch Department by departmentId
   */
  async getDepartmentById(departmentId: string): Promise<DepartmentInfo | null> {
    const data = await prisma.department.findUnique({
      where: { id: departmentId },
      include: { college: true }
    });

    if (!data) return null;

    let hodInfo = null;
    if (data.hod_uid) {
      const hodUser = await prisma.authedUser.findUnique({
        where: { uid: data.hod_uid }
      });
      if (hodUser) {
        hodInfo = {
          uid: hodUser.uid,
          displayName: hodUser.display_name,
          email: hodUser.email,
          photoURL: hodUser.photo_url,
        };
      }
    }

    return {
      id: data.id,
      collegeId: data.college_id,
      name: data.name,
      code: data.code,
      hodUid: data.hod_uid,
      isActive: data.is_active ?? true,
      collegeName: data.college?.name || null,
      hod: hodInfo,
    };
  }

  /**
   * Fetch Subjects for Department, optionally filtered by semester
   */
  async getSubjectsByDepartment(departmentId: string, semesterNumber?: number): Promise<SubjectInfo[]> {
    const data = await prisma.subject.findMany({
      where: {
        department_id: departmentId,
        ...(semesterNumber !== undefined && !isNaN(semesterNumber) ? { semester_number: semesterNumber } : {})
      },
      orderBy: [
        { semester_number: 'asc' },
        { code: 'asc' }
      ]
    });

    return data.map((s: any) => ({
      id: s.id,
      departmentId: s.department_id,
      name: s.name,
      code: s.code,
      credits: s.credits ?? 3,
      semesterNumber: s.semester_number,
      isActive: s.is_active ?? true,
    }));
  }

  /**
   * Fetch Class Incharge by facultyUid
   */
  async getClassIncharge(facultyUid: string): Promise<ClassInchargeInfo | null> {
    const facultyUser = await prisma.authedUser.findUnique({
      where: { uid: facultyUid }
    });

    if (!facultyUser) return null;

    // Load profile info if available
    const userRecord = await prisma.user.findUnique({
      where: { firebaseUid: facultyUid },
      include: { profile: true }
    });

    const profileRecord = userRecord?.profile;

    return {
      facultyUid: facultyUser.uid,
      name: facultyUser.display_name || 'Faculty Incharge',
      email: facultyUser.email,
      phone: profileRecord?.phone || userRecord?.phone || null,
      photoUrl: profileRecord?.profilePhotoUrl || facultyUser.photo_url || null,
      designation: profileRecord?.designation || 'Class Incharge / Assistant Professor',
      department: profileRecord?.department || 'Department Faculty',
    };
  }

  /**
   * Fetch Academic Years for College
   */
  async getAcademicYears(collegeId: string): Promise<AcademicYearInfo[]> {
    const data = await prisma.academicYear.findMany({
      where: { college_id: collegeId },
      orderBy: [
        { is_current: 'desc' },
        { start_date: 'desc' }
      ]
    });

    return data.map((ay: any) => ({
      id: ay.id,
      collegeId: ay.college_id,
      name: ay.name,
      startDate: ay.start_date.toISOString(),
      endDate: ay.end_date.toISOString(),
      isCurrent: ay.is_current ?? false,
    }));
  }

  /**
   * Fetch Semesters for Academic Year
   */
  async getSemesters(academicYearId?: string): Promise<SemesterInfo[]> {
    const data = await prisma.semester.findMany({
      where: {
        ...(academicYearId ? { academic_year_id: academicYearId } : {})
      },
      include: { academicYear: true },
      orderBy: { term_number: 'asc' }
    });

    return data.map((sem: any) => ({
      id: sem.id,
      academicYearId: sem.academic_year_id,
      termNumber: sem.term_number,
      startDate: sem.start_date.toISOString(),
      endDate: sem.end_date.toISOString(),
      academicYear: sem.academicYear ? {
        id: sem.academicYear.id,
        name: sem.academicYear.name,
        isCurrent: sem.academicYear.is_current ?? false,
      } : null,
    }));
  }

  /**
   * Fetch Class Master Timetable for a specific class (Created by Class Incharge)
   */
  async getClassTimetable(classId: string): Promise<ClassTimetableSlot[]> {
    try {
      const slots: any = await prisma.$queryRawUnsafe(
        `SELECT id, class_id, day_of_week, period, start_time, end_time, subject_name, subject_code, faculty_name, room
         FROM class_timetables
         WHERE class_id = $1::uuid
         ORDER BY 
           CASE LOWER(TRIM(day_of_week))
             WHEN 'monday' THEN 1
             WHEN 'tuesday' THEN 2
             WHEN 'wednesday' THEN 3
             WHEN 'thursday' THEN 4
             WHEN 'friday' THEN 5
             WHEN 'saturday' THEN 6
             WHEN 'sunday' THEN 7
             ELSE 8
           END,
           period ASC, start_time ASC;`,
        classId
      );
      return (slots || []).map((s: any) => ({
        id: s.id,
        class_id: s.class_id,
        day_of_week: s.day_of_week,
        period: s.period,
        start_time: s.start_time,
        end_time: s.end_time,
        subject_name: s.subject_name,
        subject_code: s.subject_code,
        faculty_name: s.faculty_name,
        room: s.room,
      }));
    } catch (err: any) {
      console.error('StudentRepository.getClassTimetable error:', err);
      return [];
    }
  }

  /**
   * Fetch Student Attendance Summary from attendance_records and attendance_sessions
   */
  async getStudentAttendanceSummary(studentUid: string): Promise<StudentAttendanceSummary> {
    try {
      const overall: any = await prisma.$queryRawUnsafe(
        `SELECT 
           COUNT(ar.id)::int as total,
           COUNT(CASE WHEN ar.status IN ('PRESENT', 'LATE', 'EXCUSED') THEN 1 END)::int as attended,
           COUNT(CASE WHEN ar.status = 'PRESENT' THEN 1 END)::int as present,
           COUNT(CASE WHEN ar.status = 'LATE' THEN 1 END)::int as late,
           COUNT(CASE WHEN ar.status = 'EXCUSED' THEN 1 END)::int as excused,
           COUNT(CASE WHEN ar.status = 'ABSENT' THEN 1 END)::int as absent
         FROM attendance_records ar
         WHERE ar.student_uid = $1;`,
        studentUid
      );

      const today: any = await prisma.$queryRawUnsafe(
        `SELECT 
           COUNT(ar.id)::int as total,
           COUNT(CASE WHEN ar.status IN ('PRESENT', 'LATE', 'EXCUSED') THEN 1 END)::int as attended,
           COUNT(CASE WHEN ar.status = 'PRESENT' THEN 1 END)::int as present,
           COUNT(CASE WHEN ar.status = 'LATE' THEN 1 END)::int as late,
           COUNT(CASE WHEN ar.status = 'EXCUSED' THEN 1 END)::int as excused,
           COUNT(CASE WHEN ar.status = 'ABSENT' THEN 1 END)::int as absent
         FROM attendance_records ar
         JOIN attendance_sessions s ON ar.attendance_session_id = s.id
         WHERE ar.student_uid = $1 AND s.date = CURRENT_DATE;`,
        studentUid
      );

      const totalSessions = overall[0]?.total || 0;
      const attendedSessions = overall[0]?.attended || 0;
      const presentCount = overall[0]?.present || 0;
      const lateCount = overall[0]?.late || 0;
      const absentCount = overall[0]?.absent || 0;
      const excusedCount = overall[0]?.excused || 0;

      const percentage = totalSessions > 0 ? Number(((attendedSessions / totalSessions) * 100).toFixed(1)) : 0;
      const isEligible = totalSessions === 0 ? true : percentage >= 75.0;

      let safeMargin = 0;
      if (totalSessions > 0) {
        if (percentage >= 75) {
          safeMargin = Math.floor((attendedSessions - 0.75 * totalSessions) / 0.75);
        } else {
          safeMargin = -Math.ceil((0.75 * totalSessions - attendedSessions) / 0.25);
        }
      }

      const todayTotal = today[0]?.total || 0;
      const todayAttended = today[0]?.attended || 0;
      const todayPresent = today[0]?.present || 0;
      const todayLate = today[0]?.late || 0;
      const todayAbsent = today[0]?.absent || 0;
      const todayExcused = today[0]?.excused || 0;
      const todayEffectivePercentage = todayTotal > 0 ? Math.round((todayAttended / todayTotal) * 100) : 0;

      return {
        totalSessions,
        attendedSessions,
        presentCount,
        lateCount,
        absentCount,
        excusedCount,
        percentage,
        isEligible,
        safeMargin,
        todayTotal,
        todayAttended,
        todayPresent,
        todayLate,
        todayAbsent,
        todayExcused,
        todayEffectivePercentage,
      };
    } catch (err: any) {
      console.error('StudentRepository.getStudentAttendanceSummary error:', err);
      return {
        totalSessions: 0,
        attendedSessions: 0,
        presentCount: 0,
        lateCount: 0,
        absentCount: 0,
        excusedCount: 0,
        percentage: 0,
        isEligible: true,
        safeMargin: 0,
        todayTotal: 0,
        todayAttended: 0,
        todayPresent: 0,
        todayLate: 0,
        todayAbsent: 0,
        todayExcused: 0,
        todayEffectivePercentage: 0,
      };
    }
  }

  /**
   * Fetch Subject-wise Attendance Breakdown
   */
  async getSubjectAttendance(studentUid: string, departmentId?: string | null, semesterNumber?: number | null): Promise<StudentSubjectAttendance[]> {
    if (!departmentId) return [];
    try {
      let rows: any = [];
      if (semesterNumber) {
        rows = await prisma.$queryRawUnsafe(
          `SELECT 
             sub.id,
             sub.code,
             sub.name,
             COUNT(DISTINCT s.id)::int as held,
             COUNT(CASE WHEN ar.status IN ('PRESENT', 'LATE', 'EXCUSED') THEN 1 END)::int as attended,
             COUNT(CASE WHEN ar.status = 'EXCUSED' THEN 1 END)::int as excused,
             COUNT(CASE WHEN ar.status = 'ABSENT' THEN 1 END)::int as absent
           FROM subjects sub
           LEFT JOIN attendance_sessions s ON s.subject_id = sub.id
           LEFT JOIN attendance_records ar ON ar.attendance_session_id = s.id AND ar.student_uid = $1
           WHERE sub.department_id = $2::uuid
             AND sub.semester_number = ${semesterNumber}
           GROUP BY sub.id, sub.code, sub.name
           ORDER BY sub.code ASC;`,
          studentUid,
          departmentId
        );
      }

      if (!rows || rows.length === 0) {
        rows = await prisma.$queryRawUnsafe(
          `SELECT 
             sub.id,
             sub.code,
             sub.name,
             COUNT(DISTINCT s.id)::int as held,
             COUNT(CASE WHEN ar.status IN ('PRESENT', 'LATE', 'EXCUSED') THEN 1 END)::int as attended,
             COUNT(CASE WHEN ar.status = 'EXCUSED' THEN 1 END)::int as excused,
             COUNT(CASE WHEN ar.status = 'ABSENT' THEN 1 END)::int as absent
           FROM subjects sub
           LEFT JOIN attendance_sessions s ON s.subject_id = sub.id
           LEFT JOIN attendance_records ar ON ar.attendance_session_id = s.id AND ar.student_uid = $1
           WHERE sub.department_id = $2::uuid
           GROUP BY sub.id, sub.code, sub.name
           ORDER BY sub.code ASC;`,
          studentUid,
          departmentId
        );
      }

      return (rows || []).map((r: any) => {
        const held = r.held || 0;
        const attended = r.attended || 0;
        const excused = r.excused || 0;
        const absent = r.absent || 0;
        const percentage = held > 0 ? Number(((attended / held) * 100).toFixed(1)) : 0;
        const status: 'SAFE' | 'CRITICAL' | 'NO_DATA' = held === 0 ? 'NO_DATA' : percentage >= 75 ? 'SAFE' : 'CRITICAL';

        return {
          id: r.id,
          code: r.code,
          name: r.name,
          held,
          attended,
          excused,
          absent,
          percentage,
          status,
        };
      });
    } catch (err: any) {
      console.error('StudentRepository.getSubjectAttendance error:', err);
      return [];
    }
  }

  /**
   * Get attendance records for a specific date
   */
  async getAttendanceRecordsForDate(studentUid: string, dateStr: string): Promise<any[]> {
    try {
      const records: any = await prisma.$queryRawUnsafe(
        `SELECT 
           s.id as session_id,
           s.period,
           s.remarks as session_remarks,
           s.date,
           sub.id as subject_id,
           sub.name as subject_name,
           sub.code as subject_code,
           f.display_name as faculty_name,
           ar.status,
           ar.remarks as student_remarks,
           ar.created_at as marked_at
         FROM attendance_records ar
         JOIN attendance_sessions s ON ar.attendance_session_id = s.id
         LEFT JOIN subjects sub ON s.subject_id = sub.id
         LEFT JOIN authed_users f ON s.faculty_uid = f.uid
         WHERE ar.student_uid = $1 AND s.date = $2::date;`,
        studentUid,
        dateStr
      );
      return records || [];
    } catch (err: any) {
      console.error('StudentRepository.getAttendanceRecordsForDate error:', err);
      return [];
    }
  }

  async getAssignments(classId: string, studentUid: string) {
    const assignments = await prisma.assignment.findMany({
      where: {
        classSubject: {
          class_id: classId
        }
      },
      include: {
        classSubject: {
          include: {
            subject: { select: { name: true, code: true } },
            faculty: { select: { display_name: true } }
          }
        },
        submissions: {
          where: { student_uid: studentUid },
          take: 1
        }
      },
      orderBy: { due_date: 'asc' }
    });

    return assignments.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      dueDate: a.due_date,
      attachmentUrl: (a as any).attachment_url || null,
      createdAt: a.created_at,
      subjectName: a.classSubject.subject.name,
      subjectCode: a.classSubject.subject.code,
      facultyName: a.classSubject.faculty?.display_name || 'Unassigned',
      isSubmitted: a.submissions.length > 0,
      submission: a.submissions[0] || null
    }));
  }

  async submitAssignment(studentUid: string, assignmentId: string, data: any) {
    const { attachmentUrl } = data;
    
    // check if assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId }
    });
    
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    
    // upsert submission
    return prisma.studentSubmission.upsert({
      where: {
        assignment_id_student_uid: {
          assignment_id: assignmentId,
          student_uid: studentUid
        }
      },
      update: {
        file_url: attachmentUrl,
        submitted_at: new Date()
      },
      create: {
        assignment_id: assignmentId,
        student_uid: studentUid,
        file_url: attachmentUrl
      }
    });
  }
}

export const studentRepository = new StudentRepository();

