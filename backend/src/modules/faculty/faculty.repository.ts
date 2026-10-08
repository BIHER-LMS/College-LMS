import prisma from '../../config/database';
import { isDatabaseAvailable, markDatabaseUnavailable } from '../../lib/dbHealth';
import {
  FacultyProfileUpdateInput,
  MarkAttendanceSessionInput,
  AttendanceSessionDetail,
  AttendanceSessionSummary,
  ClassAttendanceStatsResponse,
  AttendanceStatusType,
  TodayClassReminder,
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

// Faculty-owned class access, checked against the database (not middleware-supplied role/tenant).
// A subject teacher is assigned via a timetable row; only the incharge may edit the
// class master timetable. The legacy users table, when present, must agree on tenant,
// active status and role.
const facultyIdentitySql = `
  SELECT f.department_id, f.college_id
  FROM authed_users f JOIN departments d ON d.id = f.department_id
  WHERE f.uid = $1 AND f.role = 'FACULTY'
    AND f.approval_status IN ('ACTIVE', 'APPROVED') AND f.college_id = d.college_id
    AND NOT EXISTS (
      SELECT 1 FROM users u WHERE u."firebaseUid" = f.uid AND
      (u.status::text <> 'ACTIVE' OR u."collegeId" IS DISTINCT FROM f.college_id
       OR NOT EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur."roleId"
                      WHERE ur."userId" = u.id AND r.name::text = 'FACULTY' AND r."isActive" = true))
    )`;

const facultyClassAccessSql = `
  SELECT c.id, d.id AS department_id
  FROM classes c
  JOIN batches b ON b.id = c.batch_id
  JOIN programs p ON p.id = b.program_id
  JOIN departments d ON d.id = p.department_id
  JOIN authed_users f ON f.uid = $2
  WHERE c.id = $1::uuid AND c.is_active = true
    AND f.role = 'FACULTY' AND f.approval_status IN ('ACTIVE', 'APPROVED')
    AND f.college_id = d.college_id AND f.department_id = d.id
    AND NOT EXISTS (
      SELECT 1 FROM users u WHERE u."firebaseUid" = f.uid AND
      (u.status::text <> 'ACTIVE' OR u."collegeId" IS DISTINCT FROM f.college_id
       OR NOT EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur."roleId"
                      WHERE ur."userId" = u.id AND r.name::text = 'FACULTY' AND r."isActive" = true))
    )
    AND (c.faculty_uid = f.uid OR ($3::boolean = false AND (
      EXISTS (SELECT 1 FROM class_subjects cs WHERE cs.faculty_uid = f.uid AND cs.class_id = c.id) OR
      EXISTS (SELECT 1 FROM faculty_timetables ft WHERE ft.faculty_uid = f.uid AND ft.class_id = c.id)
    )))`;

// Original authentic developer context for offline development
const defaultOriginalAuthedUser: any = {
  uid: 'D679ftp5r9QC8zzybJkGAokVZ2d2',
  email: 'amirthavarsshan0806@gmail.com',
  display_name: 'Amirtha Varsshan',
  photo_url: 'https://lh3.googleusercontent.com/a/ACg8ocIZT0mWV7ImfTPyYg-2U3ErKUqIgVhK-3I7hKa9mo63pVi5Rg=s96-c',
  role: 'FACULTY',
  college_id: 'col-1790654578727-zhdd',
  department_id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
  register_number: null,
  approval_status: 'ACTIVE',
  department: {
    id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
    name: 'Bsc AI and ML',
    code: 'AIML',
  },
  subject: {
    id: 'sub-react-101',
    name: 'Advanced React patterns',
    code: 'AIML-305',
    credits: 4,
    semester_number: 5,
  },
  assigned_classes: [
    {
      id: 'cls-aiml-2023-a',
      name: 'B.Sc AI & ML - III Year Sec A',
      current_semester: 5,
    },
  ],
};

const defaultOriginalUserProfile: any = {
  id: 'usr-aiml-01',
  firebaseUid: 'D679ftp5r9QC8zzybJkGAokVZ2d2',
  email: 'amirthavarsshan0806@gmail.com',
  phone: '+91 98765 43210',
  collegeId: 'col-1790654578727-zhdd',
  status: 'ACTIVE',
  profiles: {
    id: 'prof-aiml-01',
    displayName: 'Amirtha Varsshan',
    firstName: 'Amirtha',
    lastName: 'Varsshan',
    phone: '+91 98765 43210',
    address: '42 Tech Campus Road',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    bio: 'Assistant Professor & Faculty Incharge, Department of B.Sc AI & ML. Specializing in Deep Learning and Natural Language Processing.',
    profilePhotoUrl: 'https://lh3.googleusercontent.com/a/ACg8ocIZT0mWV7ImfTPyYg-2U3ErKUqIgVhK-3I7hKa9mo63pVi5Rg=s96-c',
    employeeId: 'EMP-AIML-0806',
    designation: 'Assistant Professor',
    department: 'Bsc AI and ML',
    updatedAt: new Date(),
  },
};

const defaultOriginalClass = {
  id: 'cls-aiml-2023-a',
  name: 'B.Sc AI & ML - III Year Sec A',
  current_semester: 5,
  is_active: true,
  faculty_uid: 'D679ftp5r9QC8zzybJkGAokVZ2d2',
  batch: {
    id: 'batch-aiml-2023',
    start_year: 2023,
    end_year: 2026,
    program: {
      id: 'prog-aiml-01',
      name: 'B.Sc Artificial Intelligence & Machine Learning',
      department: {
        id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
        name: 'Bsc AI and ML',
        code: 'AIML',
      },
    },
  },
  incharge_faculty: {
    uid: 'D679ftp5r9QC8zzybJkGAokVZ2d2',
    display_name: 'Amirtha Varsshan',
    email: 'amirthavarsshan0806@gmail.com',
  },
  _count: {
    students: 36,
  },
};

const defaultOriginalStudents = [
  {
    uid: 'std-aiml-01',
    display_name: 'Aadhavan K',
    email: 'aadhavan.aiml23@college.edu',
    photo_url: null,
    register_number: '710023AIML001',
    approval_status: 'ACTIVE',
    classId: 'cls-aiml-2023-a',
    className: 'B.Sc AI & ML - III Year Sec A',
    enrollmentYear: 2023,
    phone: '+91 94431 12345',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    departmentName: 'Bsc AI and ML',
  },
  {
    uid: 'std-aiml-02',
    display_name: 'Bhavana S',
    email: 'bhavana.aiml23@college.edu',
    photo_url: null,
    register_number: '710023AIML002',
    approval_status: 'ACTIVE',
    classId: 'cls-aiml-2023-a',
    className: 'B.Sc AI & ML - III Year Sec A',
    enrollmentYear: 2023,
    phone: '+91 94431 12346',
    city: 'Chennai',
    state: 'Tamil Nadu',
    departmentName: 'Bsc AI and ML',
  },
  {
    uid: 'std-aiml-03',
    display_name: 'Dharun Kumar R',
    email: 'dharun.aiml23@college.edu',
    photo_url: null,
    register_number: '710023AIML003',
    approval_status: 'ACTIVE',
    classId: 'cls-aiml-2023-a',
    className: 'B.Sc AI & ML - III Year Sec A',
    enrollmentYear: 2023,
    phone: '+91 94431 12347',
    city: 'Erode',
    state: 'Tamil Nadu',
    departmentName: 'Bsc AI and ML',
  },
  {
    uid: 'std-aiml-04',
    display_name: 'Keerthana M',
    email: 'keerthana.aiml23@college.edu',
    photo_url: null,
    register_number: '710023AIML004',
    approval_status: 'ACTIVE',
    classId: 'cls-aiml-2023-a',
    className: 'B.Sc AI & ML - III Year Sec A',
    enrollmentYear: 2023,
    phone: '+91 94431 12348',
    city: 'Salem',
    state: 'Tamil Nadu',
    departmentName: 'Bsc AI and ML',
  },
  {
    uid: 'std-aiml-05',
    display_name: 'Praveen Raj V',
    email: 'praveen.aiml23@college.edu',
    photo_url: null,
    register_number: '710023AIML005',
    approval_status: 'ACTIVE',
    classId: 'cls-aiml-2023-a',
    className: 'B.Sc AI & ML - III Year Sec A',
    enrollmentYear: 2023,
    phone: '+91 94431 12349',
    city: 'Madurai',
    state: 'Tamil Nadu',
    departmentName: 'Bsc AI and ML',
  },
];

const defaultOriginalDepartment = {
  id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
  college_id: 'col-1790654578727-zhdd',
  name: 'Bsc AI and ML',
  code: 'AIML',
  is_active: true,
  college: {
    id: 'col-1790654578727-zhdd',
    name: 'College of Engineering & Technology',
  },
  programs: [
    {
      id: 'prog-aiml-01',
      name: 'B.Sc Artificial Intelligence & Machine Learning',
      type: 'UNDERGRADUATE',
      duration_years: 3,
    },
  ],
  authed_users_departments_hod_uidToauthed_users: {
    uid: 'D679ftp5r9QC8zzybJkGAokVZ2d2',
    display_name: 'Amirtha Varsshan',
  },
  _count: {
    subjects: 6,
  },
};

const defaultOriginalSubjects = [
  {
    id: 'sub-aiml-501',
    department_id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
    name: 'Machine Learning Techniques',
    code: 'AIML501',
    credits: 4,
    semester_number: 5,
    is_active: true,
  },
  {
    id: 'sub-aiml-502',
    department_id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
    name: 'Deep Learning Architectures',
    code: 'AIML502',
    credits: 4,
    semester_number: 5,
    is_active: true,
  },
  {
    id: 'sub-aiml-503',
    department_id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
    name: 'Natural Language Processing',
    code: 'AIML503',
    credits: 3,
    semester_number: 5,
    is_active: true,
  },
  {
    id: 'sub-aiml-504',
    department_id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
    name: 'Computer Vision & Robotics',
    code: 'AIML504',
    credits: 3,
    semester_number: 5,
    is_active: true,
  },
  {
    id: 'sub-aiml-505',
    department_id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
    name: 'AI Ethics and Governance',
    code: 'AIML505',
    credits: 2,
    semester_number: 5,
    is_active: true,
  },
  {
    id: 'sub-aiml-506',
    department_id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
    name: 'Applied Machine Learning Lab',
    code: 'AIML506P',
    credits: 2,
    semester_number: 5,
    is_active: true,
  },
];

const defaultOriginalAcademicYear = {
  id: 'ay-2024-2025',
  college_id: 'col-1790654578727-zhdd',
  name: 'Academic Year 2024 - 2025',
  start_date: new Date('2024-06-15'),
  end_date: new Date('2025-05-30'),
  is_current: true,
  semesters: [
    {
      id: 'sem-2024-odd',
      academic_year_id: 'ay-2024-2025',
      term_number: 5,
      start_date: new Date('2024-06-15'),
      end_date: new Date('2024-11-30'),
      is_current: true,
    },
    {
      id: 'sem-2024-even',
      academic_year_id: 'ay-2024-2025',
      term_number: 6,
      start_date: new Date('2024-12-15'),
      end_date: new Date('2025-05-30'),
      is_current: false,
    },
  ],
};

export class FacultyRepository {
  private isDevMode = process.env.NODE_ENV !== 'production';

  async assertFacultyIdentity(facultyUid: string): Promise<{ department_id: string; college_id: string }> {
    if (!facultyUid) throw { status: 403, message: 'Faculty account required' };
    if (!(await isDatabaseAvailable())) throw { status: 503, message: 'Database unavailable' };
    const rows: any[] = await prisma.$queryRawUnsafe(facultyIdentitySql, facultyUid);
    if (!rows.length) throw { status: 403, message: 'Faculty account required' };
    return rows[0];
  }

  async assertFacultyClassAccess(facultyUid: string, classId: string, inchargeOnly = false): Promise<{ department_id: string }> {
    if (!facultyUid || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(classId)) {
      throw { status: 403, message: 'Forbidden: Class not assigned to this faculty member' };
    }
    if (!(await isDatabaseAvailable())) throw { status: 503, message: 'Database unavailable' };
    // Authorization failure must never fall back to developer fixtures or cached rows.
    const rows: any[] = await prisma.$queryRawUnsafe(facultyClassAccessSql, classId, facultyUid, inchargeOnly);
    if (!rows.length) throw { status: 403, message: 'Forbidden: Class not assigned to this faculty member' };
    return rows[0];
  }

  async getAuthedUser(uid: string): Promise<any> {
    if (await isDatabaseAvailable()) {
      try {
        const user = await (prisma as any).authedUser.findUnique({
          where: { uid },
          include: {
            department: true,
            subject: true,
            facultySubjects: {
              include: {
                subject: true,
                class: true,
              }
            }
          },
        });
        if (user) return user;
      } catch (err: any) {
        markDatabaseUnavailable();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return defaultOriginalAuthedUser;
    }
    return null;
  }

  async getFacultyUserProfile(uid: string): Promise<any> {
    if (await isDatabaseAvailable()) {
      try {
        const user = await prisma.user.findUnique({
          where: { firebaseUid: uid },
          include: {
            profile: true,
          },
        });
        if (user) {
          return {
            ...user,
            profiles: (user as any).profile || (user as any).profiles,
          };
        }
      } catch (err: any) {
        markDatabaseUnavailable();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return defaultOriginalUserProfile;
    }
    return null;
  }

  async updateFacultyProfile(uid: string, input: FacultyProfileUpdateInput): Promise<any> {
    if (await isDatabaseAvailable()) {
      try {
        let user = await prisma.user.findUnique({
          where: { firebaseUid: uid },
          include: { profile: true },
        });

        if (!user) {
          const authed = await (prisma as any).authedUser.findUnique({ where: { uid } });
          if (!authed && !this.isDevMode) {
            throw new Error('User record not found in authed_users');
          }

          const collegeId = authed?.college_id || 'col-1790654578727-zhdd';
          const email = authed?.email || 'amirthavarsshan0806@gmail.com';
          const displayName = input.displayName || authed?.display_name || 'Amirtha Varsshan';

          user = await prisma.user.create({
            data: {
              firebaseUid: uid,
              email,
              phone: input.phone || null,
              collegeId,
              status: 'ACTIVE',
              profile: {
                create: {
                  displayName,
                  firstName: displayName.split(' ')[0] || null,
                  lastName: displayName.split(' ').slice(1).join(' ') || null,
                  phone: input.phone || null,
                  address: input.address || null,
                  city: input.city || null,
                  state: input.state || null,
                  bio: input.bio || null,
                  profilePhotoUrl: input.profilePhoto || null,
                },
              },
            },
            include: { profile: true },
          });
        } else {
          if (input.phone !== undefined) {
            await prisma.user.update({
              where: { id: user.id },
              data: { phone: input.phone },
            });
          }

          const profileRec = (user as any).profile || (user as any).profiles;
          if (profileRec) {
            await prisma.profile.update({
              where: { id: profileRec.id },
              data: {
                ...(input.displayName !== undefined && {
                  displayName: input.displayName,
                  firstName: input.displayName ? input.displayName.split(' ')[0] : undefined,
                  lastName: input.displayName ? input.displayName.split(' ').slice(1).join(' ') : undefined,
                }),
                ...(input.phone !== undefined && { phone: input.phone }),
                ...(input.address !== undefined && { address: input.address }),
                ...(input.city !== undefined && { city: input.city }),
                ...(input.state !== undefined && { state: input.state }),
                ...(input.bio !== undefined && { bio: input.bio }),
                ...(input.profilePhoto !== undefined && { profilePhotoUrl: input.profilePhoto }),
              },
            });
          } else {
            await prisma.profile.create({
              data: {
                userId: user.id,
                displayName: input.displayName || null,
                firstName: input.displayName ? input.displayName.split(' ')[0] : null,
                lastName: input.displayName ? input.displayName.split(' ').slice(1).join(' ') : null,
                phone: input.phone || null,
                address: input.address || null,
                city: input.city || null,
                state: input.state || null,
                bio: input.bio || null,
                profilePhotoUrl: input.profilePhoto || null,
              },
            });
          }
        }

        const authedUpdates: Record<string, any> = {};
        if (input.displayName !== undefined) authedUpdates.display_name = input.displayName;
        if (input.profilePhoto !== undefined) authedUpdates.photo_url = input.profilePhoto;
        if (Object.keys(authedUpdates).length > 0) {
          await (prisma as any).authedUser.update({
            where: { uid },
            data: authedUpdates,
          }).catch(() => {});
        }

        return this.getFacultyUserProfile(uid);
      } catch (err: any) {
        markDatabaseUnavailable();
        throw err;
      }
    }
  }

  async getAssignedClasses(facultyUid: string): Promise<any[]> {
    if (await isDatabaseAvailable()) {
      try {
        const directClasses = await (prisma as any).class.findMany({
          where: {
            faculty_uid: facultyUid,
            is_active: true,
          },
          include: {
            batch: {
              include: {
                program: {
                  include: {
                    department: true,
                  },
                },
              },
            },
            _count: {
              select: {
                students: true,
              },
            },
          },
        });

        // Also check if faculty has timetable slots with classes
        const timetableClassRows: any = await prisma.$queryRawUnsafe(
          `SELECT DISTINCT class_id FROM faculty_timetables WHERE faculty_uid = $1 AND class_id IS NOT NULL;`,
          facultyUid
        ).catch(() => []);

        const subjectClassRows: any[] = await (prisma as any).classSubject.findMany({
          where: { faculty_uid: facultyUid },
          select: { class_id: true },
          distinct: ['class_id'],
        }).catch(() => []);

          const idsToAdd = [...(timetableClassRows || []), ...(subjectClassRows || [])]
          .map((r: any) => r.class_id)
          .filter((id: string) => id && !directClasses.some((c: any) => c.id === id));

        let timetableClasses: any[] = [];
        if (idsToAdd.length > 0) {
          timetableClasses = await (prisma as any).class.findMany({
            where: {
              id: { in: idsToAdd },
              is_active: true,
            },
            include: {
              batch: {
                include: {
                  program: {
                    include: {
                      department: true,
                    },
                  },
                },
              },
              _count: {
                select: {
                  students: true,
                },
              },
            },
          });
        }

        return [...directClasses, ...timetableClasses];
      } catch (err: any) {
        markDatabaseUnavailable();
        console.error('getAssignedClasses DB error:', err);
      }
    }

    return [];
  }

  async getClassById(classId: string): Promise<any> {
    if (await isDatabaseAvailable()) {
      try {
        const cls = await (prisma as any).class.findUnique({
          where: { id: classId },
          include: {
            batch: {
              include: {
                program: {
                  include: {
                    department: true,
                  },
                },
              },
            },
            faculty: true,
            _count: {
              select: {
                students: true,
              },
            },
          },
        });
        if (cls) {
          // Query class_rep_uid directly from classes table
          let classRep: ClassRepresentativeInfo | null = null;
          const rawClassRows: any = await prisma.$queryRawUnsafe(
            `SELECT class_rep_uid FROM classes WHERE id = $1::uuid;`,
            classId
          ).catch(() => []);
          const classRepUid = rawClassRows?.[0]?.class_rep_uid;

          if (classRepUid) {
            const repUsers: any = await prisma.$queryRawUnsafe(
              `SELECT uid, display_name, email, register_number, phone, photo_url FROM authed_users WHERE uid = $1;`,
              classRepUid
            ).catch(() => []);
            if (repUsers && repUsers.length > 0) {
              const u = repUsers[0];
              classRep = {
                uid: u.uid,
                name: u.display_name || u.email,
                email: u.email,
                registerNumber: u.register_number || null,
                phone: u.phone || null,
                profilePhoto: u.photo_url || null,
              };
            }
          }

          // Calculate real attendance from attendance_sessions and attendance_records
          let overallAttendance: number | null = null;
          try {
            const attRows: any = await prisma.$queryRawUnsafe(
              `SELECT 
                 COUNT(ar.id)::int as total_records,
                 COUNT(CASE WHEN ar.status = 'PRESENT' OR ar.status = 'LATE' OR ar.status = 'EXCUSED' THEN 1 END)::int as attended_records
               FROM attendance_sessions s
               JOIN attendance_records ar ON ar.attendance_session_id = s.id
               WHERE s.class_id = $1::uuid;`,
              classId
            );
            if (attRows && attRows.length > 0 && attRows[0].total_records > 0) {
              overallAttendance = Math.round((attRows[0].attended_records / attRows[0].total_records) * 100);
            }
          } catch {
            overallAttendance = null;
          }

          return {
            ...cls,
            class_rep_uid: classRepUid || null,
            classRep,
            overallAttendance,
            overallPerformance: null, // Only real data; no assessments/marks recorded in DB yet
            incharge_faculty: cls.faculty || cls.incharge_faculty,
          };
        }
      } catch (err: any) {
        markDatabaseUnavailable();
        console.error('getClassById DB error:', err);
      }
    }

    return null;
  }

  async getClassStudents(classId: string): Promise<any[]> {
    if (await isDatabaseAvailable()) {
      try {
        const rawClassRows: any = await prisma.$queryRawUnsafe(
          `SELECT class_rep_uid FROM classes WHERE id = $1::uuid;`,
          classId
        ).catch(() => []);
        const classRepUid = rawClassRows?.[0]?.class_rep_uid;

        // Fetch students including dob, phone, parent_phone
        let rawStudents: any[] = [];
        try {
          rawStudents = await prisma.$queryRawUnsafe(
            `SELECT uid, display_name, email, photo_url, register_number, approval_status,
                    to_char(dob, 'YYYY-MM-DD') as dob, phone, parent_phone, created_at
             FROM authed_users
             WHERE class_id = $1::uuid
             ORDER BY register_number ASC, display_name ASC;`,
            classId
          );
        } catch {
          rawStudents = await (prisma as any).authedUser.findMany({
            where: { class_id: classId },
            select: {
              uid: true,
              display_name: true,
              email: true,
              photo_url: true,
              register_number: true,
              approval_status: true,
            },
          });
        }

        // Fetch real attendance records for students in this class
        const studentAttMap = new Map<string, { total: number; attended: number }>();
        try {
          const attRows: any = await prisma.$queryRawUnsafe(
            `SELECT ar.student_uid, 
                    COUNT(ar.id)::int as total,
                    COUNT(CASE WHEN ar.status = 'PRESENT' OR ar.status = 'LATE' OR ar.status = 'EXCUSED' THEN 1 END)::int as attended
             FROM attendance_records ar
             JOIN attendance_sessions s ON s.id = ar.attendance_session_id
             WHERE s.class_id = $1::uuid
             GROUP BY ar.student_uid;`,
            classId
          );
          (attRows || []).forEach((r: any) => {
            studentAttMap.set(r.student_uid, {
              total: r.total,
              attended: r.attended,
            });
          });
        } catch {
          // Table empty or no records
        }

        return (rawStudents || []).map((s: any) => {
          const isClassRep = classRepUid ? s.uid === classRepUid : false;
          const att = studentAttMap.get(s.uid);
          const attendancePercentage = att && att.total > 0 ? Math.round((att.attended / att.total) * 100) : null;

          return {
            uid: s.uid,
            name: s.display_name || s.email,
            registerNumber: s.register_number || null,
            email: s.email,
            dob: s.dob || null,
            phone: s.phone || null,
            parentPhone: s.parent_phone || null,
            profilePhoto: s.photo_url || null,
            accountStatus: s.approval_status || 'ACTIVE',
            isClassRep,
            attendancePercentage,
            performanceScore: null,
            performanceGrade: null,
          };
        });
      } catch (err: any) {
        markDatabaseUnavailable();
        console.error('getClassStudents DB error:', err);
        throw err;
      }
    }

    throw { status: 503, message: 'Database unavailable' };
  }

  async getStudentByUid(studentUid: string): Promise<any> {
    if (await isDatabaseAvailable()) {
      try {
        const authedStudent = await (prisma as any).authedUser.findUnique({
          where: { uid: studentUid },
          include: {
            class: {
              include: {
                batch: {
                  include: {
                    program: {
                      include: {
                        department: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        const userProfile = await prisma.user.findUnique({
          where: { firebaseUid: studentUid },
          include: {
            profile: true,
          },
        });

        if (authedStudent) {
          return {
            authedStudent,
            userProfile: userProfile
              ? {
                  ...userProfile,
                  profiles: (userProfile as any).profile || (userProfile as any).profiles,
                }
              : null,
          };
        }
      } catch (err: any) {
        markDatabaseUnavailable();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      const found = defaultOriginalStudents.find((s) => s.uid === studentUid) || defaultOriginalStudents[0];
      return {
        authedStudent: {
          uid: found.uid,
          display_name: found.display_name,
          email: found.email,
          photo_url: found.photo_url,
          register_number: found.register_number,
          approval_status: found.approval_status,
          class_id: found.classId,
          class: {
            id: found.classId,
            name: found.className,
            faculty_uid: 'D679ftp5r9QC8zzybJkGAokVZ2d2',
            batch: {
              start_year: found.enrollmentYear,
              program: {
                department: {
                  name: found.departmentName,
                },
              },
            },
          },
        },
        userProfile: {
          phone: found.phone,
          profiles: {
            phone: found.phone,
            city: found.city,
            state: found.state,
          },
        },
      };
    }
    return null;
  }

  async getDepartmentById(departmentId: string): Promise<any> {
    if (await isDatabaseAvailable()) {
      try {
        const dept = await (prisma as any).department.findUnique({
          where: { id: departmentId },
          include: {
            college: true,
            programs: true,
            hod: true,
            _count: {
              select: {
                subjects: true,
              },
            },
          },
        });
        if (dept) {
          return {
            ...dept,
            authed_users_departments_hod_uidToauthed_users: dept.hod || dept.authed_users_departments_hod_uidToauthed_users,
          };
        }
      } catch (err: any) {
        markDatabaseUnavailable();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return defaultOriginalDepartment;
    }
    return null;
  }

  async getDepartmentSubjects(departmentId: string, semesterNumber?: number): Promise<any[]> {
    if (await isDatabaseAvailable()) {
      try {
        const subjects = await (prisma as any).subject.findMany({
          where: {
            department_id: departmentId,
            ...(semesterNumber ? { semester_number: semesterNumber } : {}),
          },
          orderBy: [
            { semester_number: 'asc' },
            { code: 'asc' },
          ],
        });
        if (subjects && subjects.length > 0) return subjects;
      } catch (err: any) {
        markDatabaseUnavailable();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      if (semesterNumber) {
        return defaultOriginalSubjects.filter((s) => s.semester_number === semesterNumber);
      }
      return defaultOriginalSubjects;
    }
    return [];
  }

  async getAcademicYears(collegeId: string): Promise<any[]> {
    if (await isDatabaseAvailable()) {
      try {
        const years = await (prisma as any).academicYear.findMany({
          where: { college_id: collegeId },
          include: {
            semesters: {
              orderBy: { term_number: 'asc' },
            },
          },
          orderBy: { start_date: 'desc' },
        });
        if (years && years.length > 0) return years;
      } catch (err: any) {
        markDatabaseUnavailable();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return [defaultOriginalAcademicYear];
    }
    return [];
  }

  async getCurrentAcademicYear(collegeId: string): Promise<any> {
    if (await isDatabaseAvailable()) {
      try {
        const year = await (prisma as any).academicYear.findFirst({
          where: {
            college_id: collegeId,
            is_current: true,
          },
          include: {
            semesters: true,
          },
        });
        if (year) return year;
      } catch (err: any) {
        markDatabaseUnavailable();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return defaultOriginalAcademicYear;
    }
    return null;
  }

  async getSemesters(collegeId: string): Promise<any[]> {
    if (await isDatabaseAvailable()) {
      try {
        const sems = await (prisma as any).semester.findMany({
          where: {
            academicYear: {
              college_id: collegeId,
            },
          },
          include: {
            academicYear: true,
          },
          orderBy: [
            { academicYear: { start_date: 'desc' } },
            { term_number: 'asc' },
          ],
        });
        if (sems && sems.length > 0) {
          return sems.map((s: any) => ({
            ...s,
            academic_year: s.academicYear || s.academic_year,
          }));
        }
      } catch (err: any) {
        markDatabaseUnavailable();
        if (!this.isDevMode) throw err;
      }
    }

    if (this.isDevMode) {
      return defaultOriginalAcademicYear.semesters.map((s) => ({
        id: s.id,
        term_number: s.term_number,
        start_date: s.start_date,
        end_date: s.end_date,
        is_current: s.term_number === 5,
        academic_year: {
          id: defaultOriginalAcademicYear.id,
          name: defaultOriginalAcademicYear.name,
          start_date: defaultOriginalAcademicYear.start_date,
          end_date: defaultOriginalAcademicYear.end_date,
        },
      }));
    }
    return [];
  }

  async searchAll(facultyUid: string, query: string) {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { classes: [], students: [], subjects: [], academicYears: [] };
    }

    const authedUser = await this.getAuthedUser(facultyUid);
    const collegeId = authedUser?.college_id || 'col-1790654578727-zhdd';
    const departmentId = authedUser?.department_id;

    if (await isDatabaseAvailable()) {
      try {
        const classes = await (prisma as any).class.findMany({
          where: {
            AND: [
              {
                OR: [
                  { faculty_uid: facultyUid },
                  ...(departmentId ? [{ batch: { program: { department_id: departmentId } } }] : []),
                ],
              },
              {
                OR: [
                  { name: { contains: query.trim(), mode: 'insensitive' } },
                  { batch: { program: { name: { contains: query.trim(), mode: 'insensitive' } } } },
                ],
              },
            ],
          },
          include: {
            batch: {
              include: {
                program: true,
              },
            },
            _count: {
              select: {
                students: true,
              },
            },
          },
          take: 6,
        });

        const students = await (prisma as any).authedUser.findMany({
          where: {
            AND: [
              {
                OR: [
                  { class: { faculty_uid: facultyUid } },
                  ...(departmentId ? [{ department_id: departmentId }] : []),
                ],
              },
              {
                role: 'STUDENT',
              },
              {
                OR: [
                  { display_name: { contains: query.trim(), mode: 'insensitive' } },
                  { email: { contains: query.trim(), mode: 'insensitive' } },
                  { register_number: { contains: query.trim(), mode: 'insensitive' } },
                ],
              },
            ],
          },
          select: {
            uid: true,
            display_name: true,
            email: true,
            photo_url: true,
            register_number: true,
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          take: 6,
        });

        const subjects = departmentId
          ? await (prisma as any).subject.findMany({
              where: {
                department_id: departmentId,
                OR: [
                  { name: { contains: query.trim(), mode: 'insensitive' } },
                  { code: { contains: query.trim(), mode: 'insensitive' } },
                ],
              },
              take: 6,
            })
          : await (prisma as any).subject.findMany({
              where: {
                OR: [
                  { name: { contains: query.trim(), mode: 'insensitive' } },
                  { code: { contains: query.trim(), mode: 'insensitive' } },
                ],
              },
              take: 6,
            });

        const academicYears = collegeId
          ? await (prisma as any).academicYear.findMany({
              where: {
                college_id: collegeId,
                name: { contains: query.trim(), mode: 'insensitive' },
              },
              include: {
                semesters: true,
              },
              take: 4,
            })
          : [];

        if (classes.length > 0 || students.length > 0 || subjects.length > 0 || academicYears.length > 0) {
          return {
            classes: classes.map((c: any) => ({
              id: c.id,
              title: c.name,
              subtitle: `${c.batch?.program?.name || 'Class'} • Sem ${c.current_semester || 1}`,
              category: 'class' as const,
              url: `/classes/${c.id}`,
              meta: `${c._count?.students || 0} students`,
            })),
            students: students.map((s: any) => ({
              id: s.uid,
              title: s.display_name || s.email,
              subtitle: `${s.register_number ? `Reg: ${s.register_number}` : s.email}${s.class?.name ? ` • ${s.class.name}` : ''}`,
              category: 'student' as const,
              url: `/students/${s.uid}`,
              meta: s.register_number || undefined,
            })),
            subjects: subjects.map((sub: any) => ({
              id: sub.id,
              title: sub.name,
              subtitle: `${sub.code} • Sem ${sub.semester_number} • ${sub.credits || 3} Credits`,
              category: 'subject' as const,
              url: '/subjects',
              meta: sub.code,
            })),
            academicYears: academicYears.map((ay: any) => ({
              id: ay.id,
              title: ay.name,
              subtitle: `Academic Session • ${ay.semesters.length} Semesters`,
              category: 'academic' as const,
              url: '/academic',
              meta: ay.is_current ? 'Current Session' : undefined,
            })),
          };
        }
      } catch (err) {
        markDatabaseUnavailable();
      }
    }

    return { classes: [], students: [], subjects: [], academicYears: [] };
  }

  async getAttendanceSession(facultyUid: string, classId: string, date: string, period: string): Promise<AttendanceSessionDetail> {
    await this.assertFacultyClassAccess(facultyUid, classId);
    const students = await this.getClassStudents(classId);
    const cls = await this.getClassById(classId);

    const recordedMap = new Map<string, { status: AttendanceStatusType; remarks: string | null }>();
    let sessionMeta: any = null;

    {
      try {
        const sessions: any = await prisma.$queryRawUnsafe(
          `SELECT s.id, s.class_id, s.faculty_uid, s.subject_id, s.date, s.period, s.remarks, sub.name as subject_name
           FROM attendance_sessions s
           LEFT JOIN subjects sub ON s.subject_id = sub.id
           WHERE s.class_id = $1::uuid AND s.date = $4::date AND s.period = $5
             AND EXISTS (SELECT 1 FROM (${facultyClassAccessSql}) access) LIMIT 1;`,
          classId,
          facultyUid,
          false,
          date,
          period
        );

        if (sessions && sessions.length > 0) {
          sessionMeta = sessions[0];
          const records: any = await prisma.$queryRawUnsafe(
            `SELECT student_uid, status, remarks FROM attendance_records
            WHERE attendance_session_id = $4::uuid AND EXISTS (SELECT 1 FROM (${facultyClassAccessSql}) access);`,
            classId, facultyUid, false, sessionMeta.id
          );
          records.forEach((r: any) => recordedMap.set(r.student_uid, { status: r.status, remarks: r.remarks }));
        }
      } catch (err) {
        throw err;
      }
    }

    return {
      id: sessionMeta?.id,
      classId,
      className: cls?.name || 'Assigned Class',
      facultyUid: sessionMeta?.faculty_uid || '',
      subjectId: sessionMeta?.subject_id || null,
      subjectName: sessionMeta?.subject_name || null,
      date,
      period,
      remarks: sessionMeta?.remarks || null,
      records: students.map((s) => {
        const recorded = recordedMap.get(s.uid);
        return {
          studentUid: s.uid,
          displayName: s.display_name || s.email,
          registerNumber: s.register_number,
          photoUrl: s.photo_url,
          status: recorded ? recorded.status : 'PRESENT',
          remarks: recorded ? recorded.remarks : null,
        };
      }),
    };
  }

  async saveAttendanceSession(facultyUid: string, input: MarkAttendanceSessionInput) {
    // Do not acknowledge a mark unless every record is durably committed. Lock the
    // assigned class and students for the duration of the session + records upsert.
    if (!(await isDatabaseAvailable())) throw { status: 503, message: 'Database unavailable' };
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.classId)) {
      throw { status: 403, message: 'Forbidden: Class not assigned to this faculty member' };
    }
    const uniqueUids = [...new Set(input.records.map((r) => r.studentUid))];
    if (uniqueUids.length !== input.records.length || !uniqueUids.length) {
      throw { status: 400, message: 'Duplicate or missing student records' };
    }
    return prisma.$transaction(async (tx) => {
      const allowed: any[] = await tx.$queryRawUnsafe(
        `${facultyClassAccessSql} FOR SHARE OF c, f`, input.classId, facultyUid, false
      );
      if (!allowed.length) throw { status: 403, message: 'Forbidden: Class not assigned to this faculty member' };
      if (input.subjectId) {
        const subjects: any[] = await tx.$queryRawUnsafe(
          `SELECT id FROM subjects WHERE id = $1::uuid AND department_id = $2::uuid AND is_active = true`,
          input.subjectId, allowed[0].department_id
        );
        if (!subjects.length) throw { status: 400, message: 'Subject does not belong to this department' };
      }
      const enrolled: any[] = await tx.$queryRawUnsafe(
        `SELECT uid FROM authed_users WHERE uid = ANY($1::text[]) AND class_id = $2::uuid
         AND role = 'STUDENT' FOR SHARE`, uniqueUids, input.classId
      );
      if (enrolled.length !== uniqueUids.length) {
        throw { status: 400, message: 'Every student must be enrolled in this class' };
      }
      const sessionResult: any[] = await tx.$queryRawUnsafe(
        `INSERT INTO attendance_sessions (class_id, faculty_uid, subject_id, date, period, remarks, updated_at)
         VALUES ($1::uuid, $2, $3::uuid, $4::date, $5, $6, NOW())
         ON CONFLICT (class_id, date, period)
         DO UPDATE SET subject_id = EXCLUDED.subject_id, remarks = EXCLUDED.remarks, updated_at = NOW()
         WHERE attendance_sessions.faculty_uid = EXCLUDED.faculty_uid
         RETURNING id`, input.classId, facultyUid, input.subjectId || null,
        input.date, input.period, input.remarks || null
      );
      if (!sessionResult.length) throw { status: 403, message: 'Session belongs to another faculty member' };
      // One batch write; any SQL error aborts the whole transaction.
      const saved: any[] = await tx.$queryRawUnsafe(
        `INSERT INTO attendance_records (attendance_session_id, student_uid, status, remarks)
         SELECT $1::uuid, r."studentUid", r.status::"AttendanceStatus", r.remarks
         FROM jsonb_to_recordset($2::jsonb) AS r("studentUid" text, status text, remarks text)
         JOIN authed_users u ON u.uid = r."studentUid" AND u.class_id = $3::uuid AND u.role = 'STUDENT'
         ON CONFLICT (attendance_session_id, student_uid)
         DO UPDATE SET status = EXCLUDED.status, remarks = EXCLUDED.remarks
         RETURNING student_uid`, sessionResult[0].id, JSON.stringify(input.records), input.classId
      );
      if (saved.length !== input.records.length) throw { status: 400, message: 'Student enrollment changed' };
      return { success: true, count: saved.length };
    });
  }

  async getClassAttendanceStats(facultyUid: string, classId: string): Promise<ClassAttendanceStatsResponse> {
    await this.assertFacultyClassAccess(facultyUid, classId);
    const students = await this.getClassStudents(classId);
    const cls = await this.getClassById(classId);

    let sessionCount = 0;
    const studentStatsMap = new Map<string, { present: number; absent: number; late: number; excused: number }>();
    students.forEach((s) => studentStatsMap.set(s.uid, { present: 0, absent: 0, late: 0, excused: 0 }));

    {
      try {
        const records: any = await prisma.$queryRawUnsafe(
          `SELECT ar.student_uid, ar.status
           FROM attendance_records ar
           JOIN attendance_sessions s ON ar.attendance_session_id = s.id
           WHERE s.class_id = $1::uuid AND EXISTS (SELECT 1 FROM (${facultyClassAccessSql}) access);`,
          classId
        );

        const sessionCountRes: any = await prisma.$queryRawUnsafe(
          `SELECT COUNT(id)::int as count FROM attendance_sessions WHERE class_id = $1::uuid;`,
          classId
        );
        sessionCount = sessionCountRes[0]?.count || 0;

        records.forEach((r: any) => {
          const cur = studentStatsMap.get(r.student_uid);
          if (!cur) return; // Ignore stale records for students no longer enrolled.
          if (r.status === 'PRESENT') cur.present++;
          else if (r.status === 'ABSENT') cur.absent++;
          else if (r.status === 'LATE') cur.late++;
          else if (r.status === 'EXCUSED') cur.excused++;
          studentStatsMap.set(r.student_uid, cur);
        });
      } catch (err) {
        throw err;
      }
    }

    const studentStats = students.map((s) => {
      const counts = studentStatsMap.get(s.uid) || { present: 0, absent: 0, late: 0, excused: 0 };
      const attended = counts.present + counts.late + counts.excused;
      const total = sessionCount > 0 ? sessionCount : (attended + counts.absent > 0 ? attended + counts.absent : 0);
      const percentage = total > 0 ? Math.round((attended / total) * 100) : 100;

      return {
        studentUid: s.uid,
        displayName: s.display_name || s.email,
        registerNumber: s.register_number,
        email: s.email,
        photoUrl: s.photo_url,
        totalSessions: total,
        presentSessions: counts.present,
        absentSessions: counts.absent,
        lateSessions: counts.late,
        excusedSessions: counts.excused,
        percentage,
        isShortage: percentage < 75 && total > 0,
      };
    });

    const totalPct = studentStats.reduce((acc, s) => acc + s.percentage, 0);
    const avgPct = studentStats.length > 0 ? Math.round(totalPct / studentStats.length) : 100;
    const shortageCount = studentStats.filter((s) => s.isShortage).length;

    return {
      classId,
      className: cls?.name || 'Assigned Class',
      totalSessionsConducted: sessionCount,
      averageAttendancePercentage: avgPct,
      shortageCount,
      students: studentStats,
    };
  }

  async getClassAttendanceHistory(facultyUid: string, classId: string): Promise<AttendanceSessionSummary[]> {
    await this.assertFacultyClassAccess(facultyUid, classId);
    let list: AttendanceSessionSummary[] = [];

    if (await isDatabaseAvailable()) {
      try {
        const sessions: any = await prisma.$queryRawUnsafe(
          `SELECT s.id, s.class_id, s.date, s.period, s.remarks, s.created_at,
                  c.name as class_name, sub.name as subject_name,
                  COUNT(ar.id)::int as total_students,
                  COUNT(CASE WHEN ar.status = 'PRESENT' THEN 1 END)::int as present_count,
                  COUNT(CASE WHEN ar.status = 'ABSENT' THEN 1 END)::int as absent_count,
                  COUNT(CASE WHEN ar.status = 'LATE' THEN 1 END)::int as late_count,
                  COUNT(CASE WHEN ar.status = 'EXCUSED' THEN 1 END)::int as excused_count
           FROM attendance_sessions s
           JOIN classes c ON s.class_id = c.id
           LEFT JOIN subjects sub ON s.subject_id = sub.id
           LEFT JOIN attendance_records ar ON s.id = ar.attendance_session_id
           WHERE s.class_id = $1::uuid
           GROUP BY s.id, s.class_id, s.date, s.period, s.remarks, s.created_at, c.name, sub.name
           ORDER BY s.date DESC, s.created_at DESC LIMIT 30;`,
          classId
        );

        list = sessions.map((s: any) => {
          const total = s.total_students || 0;
          const present = (s.present_count || 0) + (s.late_count || 0) + (s.excused_count || 0);
          return {
            id: s.id,
            classId: s.class_id,
            className: s.class_name,
            subjectId: null,
            subjectName: s.subject_name || null,
            date: s.date ? new Date(s.date).toISOString().split('T')[0] : '',
            period: s.period,
            remarks: s.remarks,
            totalStudents: total,
            presentCount: s.present_count || 0,
            absentCount: s.absent_count || 0,
            lateCount: s.late_count || 0,
            excusedCount: s.excused_count || 0,
            attendancePercentage: total > 0 ? Math.round((present / total) * 100) : 100,
            createdAt: s.created_at ? new Date(s.created_at).toISOString() : new Date().toISOString(),
          };
        });
      } catch (err) {
        throw err;
      }
    } else {
      throw { status: 503, message: 'Database unavailable' };
    }

    return list;
  }

  async getTodayReminders(facultyUid: string, targetDate?: string): Promise<TodayRemindersSummary> {
    const today = targetDate || new Date().toISOString().split('T')[0];
    const todayObj = new Date(today + 'T00:00:00');
    const dayOfWeek = todayObj.toLocaleDateString('en-US', { weekday: 'long' });
    const dateFormatted = todayObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    // 1. Fetch today's timetable slots
    let todaySchedule: FacultyTimetableSlot[] = [];
    if (await isDatabaseAvailable()) {
      try {
        const slots: any = await prisma.$queryRawUnsafe(
          `SELECT * FROM faculty_timetables 
           WHERE faculty_uid = $1 AND LOWER(TRIM(day_of_week)) = LOWER(TRIM($2))
           ORDER BY period ASC, start_time ASC;`,
          facultyUid,
          dayOfWeek
        );
        todaySchedule = slots || [];
      } catch (err) {
        console.error('getTodayReminders timetable error:', err);
      }
    }

    // 2. Fetch faculty reminders
    let reminders: FacultyReminder[] = [];
    if (await isDatabaseAvailable()) {
      try {
        const rows: any = await prisma.$queryRawUnsafe(
          `SELECT * FROM faculty_reminders 
           WHERE faculty_uid = $1
           ORDER BY 
             CASE status WHEN 'PENDING' THEN 1 ELSE 2 END,
             due_date ASC,
             CASE priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END ASC,
             created_at DESC;`,
          facultyUid
        );
        reminders = rows || [];
      } catch (err) {
        console.error('getTodayReminders reminders error:', err);
      }
    }

    // 3. Fetch assigned classes
    const assignedClasses = await this.getAssignedClasses(facultyUid);

    const classReminders: TodayClassReminder[] = [];
    let pendingAttendanceCount = 0;
    let pendingMarksCount = 0;

    // If faculty has timetable slots scheduled for today, use them:
    if (todaySchedule && todaySchedule.length > 0) {
      for (const slot of todaySchedule) {
        const classId = slot.class_id || slot.id || 'sched-' + slot.period;
        const period = slot.period || 'Period 1';
        const key = `${classId}_${today}_${period}`;

        let isMarked = false;
        let lastMarkedAt: string | null = null;

        if (slot.class_id && (await isDatabaseAvailable())) {
          try {
            const sessions: any = await prisma.$queryRawUnsafe(
              `SELECT id, updated_at FROM attendance_sessions
               WHERE class_id = $1::uuid AND date = $2::date AND period = $3 LIMIT 1;`,
              slot.class_id,
              today,
              period
            );
            if (sessions && sessions.length > 0) {
              isMarked = true;
              lastMarkedAt = sessions[0].updated_at ? new Date(sessions[0].updated_at).toISOString() : null;
            }
          } catch (err) {}
        }

        if (!isMarked) {
          pendingAttendanceCount++;
        }

        const matchedClass = assignedClasses.find((c) => c.id === slot.class_id);

        classReminders.push({
          classId: slot.class_id || String(slot.id),
          className: slot.class_name,
          semester: matchedClass?.current_semester || null,
          batch: matchedClass?.batch ? `${matchedClass.batch.start_year}-${matchedClass.batch.end_year}` : null,
          program: matchedClass?.batch?.program?.name || slot.subject_name || null,
          studentCount: matchedClass?._count?.students || 0,
          isClassIncharge: matchedClass?.faculty_uid === facultyUid,
          todayDate: today,
          attendance: {
            status: isMarked ? 'COMPLETED' : 'PENDING',
            period: `${slot.period}${slot.start_time ? ` (${slot.start_time}${slot.end_time ? ` - ${slot.end_time}` : ''})` : ''}`,
            lastMarkedAt,
            totalEnrolled: matchedClass?._count?.students || 0,
          },
          marks: {
            status: 'PENDING',
            title: `${slot.subject_name || 'Subject'}${slot.room ? ` • ${slot.room}` : ''}`,
            deadline: slot.room || 'Scheduled Period',
          },
          actions: {
            attendanceUrl: slot.class_id ? `/faculty/attendance?classId=${slot.class_id}&period=${encodeURIComponent(slot.period)}` : '/faculty/attendance',
            classDetailsUrl: slot.class_id ? `/faculty/classes/${slot.class_id}` : '/faculty/classes',
            studentsUrl: slot.class_id ? `/faculty/classes/${slot.class_id}/students` : '/faculty/classes',
          },
        });
      }
    } else if (assignedClasses.length > 0) {
      // If no timetable slots created yet, but classes are assigned to this faculty
      for (const cls of assignedClasses) {
        const classId = cls.id;
        const period = 'Period 1';
        const key = `${classId}_${today}_${period}`;

        let isMarked = false;
        let lastMarkedAt: string | null = null;

        if (await isDatabaseAvailable()) {
          try {
            const sessions: any = await prisma.$queryRawUnsafe(
              `SELECT id, updated_at FROM attendance_sessions
               WHERE class_id = $1::uuid AND date = $2::date AND period = $3 LIMIT 1;`,
              classId,
              today,
              period
            );
            if (sessions && sessions.length > 0) {
              isMarked = true;
              lastMarkedAt = sessions[0].updated_at ? new Date(sessions[0].updated_at).toISOString() : null;
            }
          } catch (err) {}
        }

        if (!isMarked) pendingAttendanceCount++;

        const sem = cls.current_semester || 1;
        classReminders.push({
          classId,
          className: cls.name,
          semester: cls.current_semester,
          batch: cls.batch ? `${cls.batch.start_year}-${cls.batch.end_year}` : null,
          program: cls.batch?.program?.name || null,
          studentCount: cls._count?.students || 0,
          isClassIncharge: cls.faculty_uid === facultyUid,
          todayDate: today,
          attendance: {
            status: isMarked ? 'COMPLETED' : 'PENDING',
            period,
            lastMarkedAt,
            totalEnrolled: cls._count?.students || 0,
          },
          marks: {
            status: 'PENDING',
            title: `Continuous Assessment (CIA) • Sem ${sem}`,
            deadline: 'Active Term',
          },
          actions: {
            attendanceUrl: `/faculty/attendance?classId=${classId}`,
            classDetailsUrl: `/faculty/classes/${classId}`,
            studentsUrl: `/faculty/classes/${classId}/students`,
          },
        });
      }
    }

    const pendingRemindersCount = reminders.filter((r) => r.status === 'PENDING').length;

    return {
      date: dateFormatted,
      dateIso: today,
      totalClassesToday: classReminders.length,
      pendingAttendanceCount,
      pendingMarksCount,
      pendingRemindersCount,
      classes: classReminders,
      todaySchedule,
      reminders,
    };
  }

  // ==========================================
  // TIMETABLE METHODS
  // ==========================================
  async getTimetable(facultyUid: string): Promise<FacultyTimetableSlot[]> {
    if (await isDatabaseAvailable()) {
      try {
        let slots: any = await prisma.$queryRawUnsafe(
          `SELECT id, faculty_uid, day_of_week, period, start_time, end_time, class_id, class_name, subject_id, subject_name, room, created_at, updated_at
           FROM faculty_timetables
           WHERE faculty_uid = $1
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
          facultyUid
        );

        return slots || [];
      } catch (err: any) {
        console.error('getTimetable error:', err);
        return [];
      }
    }
    return [];
  }

  async saveTimetableSlot(facultyUid: string, data: Partial<FacultyTimetableSlot>): Promise<FacultyTimetableSlot> {
    const classId = (data.class_id && data.class_id.length > 20 && !data.class_id.includes(' ')) ? data.class_id : null;
    const subjectId = (data.subject_id && data.subject_id.length > 20 && !data.subject_id.includes(' ')) ? data.subject_id : null;

    if (data.id) {
      const updated: any = await prisma.$queryRawUnsafe(
        `UPDATE faculty_timetables
         SET day_of_week = $1,
             period = $2,
             start_time = $3,
             end_time = $4,
             class_id = $5::uuid,
             class_name = $6,
             subject_id = $7::uuid,
             subject_name = $8,
             room = $9,
             updated_at = NOW()
         WHERE id = $10::uuid AND faculty_uid = $11
         RETURNING *;`,
        data.day_of_week || 'Monday',
        data.period || 'Period 1',
        data.start_time || null,
        data.end_time || null,
        classId,
        data.class_name || '',
        subjectId,
        data.subject_name || '',
        data.room || null,
        data.id,
        facultyUid
      );
      return updated[0];
    } else {
      const inserted: any = await prisma.$queryRawUnsafe(
        `INSERT INTO faculty_timetables (faculty_uid, day_of_week, period, start_time, end_time, class_id, class_name, subject_id, subject_name, room)
         VALUES ($1, $2, $3, $4, $5, $6::uuid, $7, $8::uuid, $9, $10)
         RETURNING *;`,
        facultyUid,
        data.day_of_week || 'Monday',
        data.period || 'Period 1',
        data.start_time || null,
        data.end_time || null,
        classId,
        data.class_name || '',
        subjectId,
        data.subject_name || '',
        data.room || null
      );
      return inserted[0];
    }
  }

  async bulkSaveTimetable(facultyUid: string, slots: Partial<FacultyTimetableSlot>[], replaceExisting: boolean = true): Promise<{ count: number; slots: FacultyTimetableSlot[] }> {
    if (replaceExisting) {
      await prisma.$queryRawUnsafe(
        `DELETE FROM faculty_timetables WHERE faculty_uid = $1;`,
        facultyUid
      ).catch(() => {});
    }

    const insertedList: FacultyTimetableSlot[] = [];
    for (const slot of slots) {
      if (!slot.day_of_week || !slot.period) continue;
      const classId = (slot.class_id && slot.class_id.length > 20 && !slot.class_id.includes(' ')) ? slot.class_id : null;
      const subjectId = (slot.subject_id && slot.subject_id.length > 20 && !slot.subject_id.includes(' ')) ? slot.subject_id : null;

      const res: any = await prisma.$queryRawUnsafe(
        `INSERT INTO faculty_timetables (faculty_uid, day_of_week, period, start_time, end_time, class_id, class_name, subject_id, subject_name, room)
         VALUES ($1, $2, $3, $4, $5, $6::uuid, $7, $8::uuid, $9, $10)
         RETURNING *;`,
        facultyUid,
        slot.day_of_week,
        slot.period,
        slot.start_time || null,
        slot.end_time || null,
        classId,
        slot.class_name || 'Assigned Class',
        subjectId,
        slot.subject_name || 'General Instruction',
        slot.room || null
      );
      if (res && res[0]) insertedList.push(res[0]);
    }

    return { count: insertedList.length, slots: insertedList };
  }

  async deleteTimetableSlot(facultyUid: string, slotId: string): Promise<boolean> {
    await this.assertFacultyIdentity(facultyUid);
    try {
      const rows: any[] = await prisma.$queryRawUnsafe(
        `DELETE FROM faculty_timetables WHERE id = $1::uuid AND faculty_uid = $2 RETURNING id;`,
        slotId, facultyUid
      );
      return rows.length > 0;
    } catch (err) {
      console.error('deleteTimetableSlot error:', err);
      throw err;
    }
  }

  // ==========================================
  // REMINDER METHODS
  // ==========================================
  async getReminders(facultyUid: string, filter?: { type?: string; status?: string }): Promise<FacultyReminder[]> {
    if (await isDatabaseAvailable()) {
      try {
        let query = `SELECT * FROM faculty_reminders WHERE faculty_uid = $1`;
        const params: any[] = [facultyUid];

        if (filter?.type && filter.type !== 'ALL') {
          params.push(filter.type);
          query += ` AND type = $${params.length}`;
        }
        if (filter?.status && filter.status !== 'ALL') {
          params.push(filter.status);
          query += ` AND status = $${params.length}`;
        }

        query += ` ORDER BY 
          CASE status WHEN 'PENDING' THEN 1 ELSE 2 END,
          due_date ASC,
          CASE priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END ASC,
          created_at DESC;`;

        const rows: any = await prisma.$queryRawUnsafe(query, ...params);
        return rows || [];
      } catch (err: any) {
        console.error('getReminders error:', err);
      }
    }
    return [];
  }

  async createReminder(facultyUid: string, data: CreateReminderInput): Promise<FacultyReminder> {
    const classId = (data.class_id && data.class_id.length > 20 && !data.class_id.includes(' ')) ? data.class_id : null;
    const inserted: any = await prisma.$queryRawUnsafe(
      `INSERT INTO faculty_reminders (faculty_uid, title, type, class_id, class_name, subject_name, due_date, due_time, priority, description, status)
       VALUES ($1, $2, $3, $4::uuid, $5, $6, $7::date, $8, $9, $10, 'PENDING')
       RETURNING *;`,
      facultyUid,
      data.title,
      data.type || 'GENERAL',
      classId,
      data.class_name || null,
      data.subject_name || null,
      data.due_date || new Date().toISOString().split('T')[0],
      data.due_time || null,
      data.priority || 'MEDIUM',
      data.description || null
    );
    return inserted[0];
  }

  async updateReminder(facultyUid: string, reminderId: string, data: Partial<CreateReminderInput & { status: any }>): Promise<FacultyReminder> {
    const classId = (data.class_id && data.class_id.length > 20 && !data.class_id.includes(' ')) ? data.class_id : null;
    const updated: any = await prisma.$queryRawUnsafe(
      `UPDATE faculty_reminders
       SET title = COALESCE($3, title),
           type = COALESCE($4, type),
           class_id = COALESCE($5::uuid, class_id),
           class_name = COALESCE($6, class_name),
           subject_name = COALESCE($7, subject_name),
           due_date = COALESCE($8::date, due_date),
           due_time = COALESCE($9, due_time),
           priority = COALESCE($10, priority),
           description = COALESCE($11, description),
           status = COALESCE($12, status),
           updated_at = NOW()
       WHERE id = $1::uuid AND faculty_uid = $2
       RETURNING *;`,
      reminderId,
      facultyUid,
      data.title ?? null,
      data.type ?? null,
      classId,
      data.class_name ?? null,
      data.subject_name ?? null,
      data.due_date ?? null,
      data.due_time ?? null,
      data.priority ?? null,
      data.description ?? null,
      data.status ?? null
    );
    return updated[0];
  }

  async toggleReminderStatus(facultyUid: string, reminderId: string): Promise<FacultyReminder> {
    const current: any = await prisma.$queryRawUnsafe(
      `SELECT status FROM faculty_reminders WHERE id = $1::uuid AND faculty_uid = $2;`,
      reminderId,
      facultyUid
    );
    if (!current || current.length === 0) {
      throw new Error('Reminder not found');
    }
    const newStatus = current[0].status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    const updated: any = await prisma.$queryRawUnsafe(
      `UPDATE faculty_reminders SET status = $1, updated_at = NOW() WHERE id = $2::uuid AND faculty_uid = $3 RETURNING *;`,
      newStatus,
      reminderId,
      facultyUid
    );
    return updated[0];
  }

  async deleteReminder(facultyUid: string, reminderId: string): Promise<boolean> {
    await this.assertFacultyIdentity(facultyUid);
    try {
      const rows: any[] = await prisma.$queryRawUnsafe(
        `DELETE FROM faculty_reminders WHERE id = $1::uuid AND faculty_uid = $2 RETURNING id;`,
        reminderId, facultyUid
      );
      return rows.length > 0;
    } catch (err) {
      console.error('deleteReminder error:', err);
      throw err;
    }
  }

  // ==========================================
  // BULK STUDENT UPLOAD (EXCEL / CSV)
  // ==========================================
  async bulkUploadStudents(
    facultyUid: string,
    classId: string,
    students: BulkStudentUploadItem[]
  ): Promise<{ count: number; students: any[] }> {
    const cls: any = await (prisma as any).class.findUnique({
      where: { id: classId },
      include: {
        batch: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!cls) {
      throw new Error('Class not found');
    }

    const departmentId = cls.batch?.program?.department_id || null;
    const collegeId = 'col-1790654578727-zhdd';
    const processedStudents: any[] = [];

    for (const item of students) {
      if (!item.email || !item.rollNumber || !item.name) continue;

      const cleanEmail = item.email.trim().toLowerCase();
      const cleanName = item.name.trim();
      const cleanRoll = item.rollNumber.trim().toUpperCase();
      const cleanPhone = (item.phone || '').trim();
      const cleanParentPhone = (item.parentPhone || '').trim();
      let cleanDob = item.dob ? item.dob.trim() : null;

      if (cleanDob && cleanDob.includes('/')) {
        const parts = cleanDob.split('/');
        if (parts.length === 3) {
          if (parts[2].length === 4) {
            cleanDob = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }
      }

      // Check if user already exists by email ONLY to prevent accidental overwrites
      const existingUser: any = await prisma.$queryRawUnsafe(
        `SELECT uid, email FROM authed_users WHERE LOWER(email) = $1;`,
        cleanEmail
      ).catch(() => []);

      if (existingUser && existingUser.length > 0) {
        const existingUid = existingUser[0].uid;
        await prisma.$queryRawUnsafe(
          `UPDATE authed_users
           SET class_id = $1::uuid,
               display_name = $2,
               register_number = $3,
               dob = CASE WHEN $4::text IS NOT NULL AND $4::text != '' THEN $4::date ELSE dob END,
               phone = $5,
               parent_phone = $6,
               role = 'STUDENT',
               approval_status = 'ACTIVE'
           WHERE uid = $7;`,
          classId,
          cleanName,
          cleanRoll,
          cleanDob,
          cleanPhone,
          cleanParentPhone,
          existingUid
        );
        processedStudents.push({
          uid: existingUid,
          name: cleanName,
          email: cleanEmail,
          registerNumber: cleanRoll,
          dob: cleanDob,
          phone: cleanPhone,
          parentPhone: cleanParentPhone,
          status: 'UPDATED',
        });
      } else {
        const generatedUid = `std_${cleanRoll.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.random().toString(36).slice(2, 7)}`;
        await prisma.$queryRawUnsafe(
          `INSERT INTO authed_users (uid, email, display_name, role, class_id, department_id, college_id, register_number, dob, phone, parent_phone, approval_status)
           VALUES ($1, $2, $3, 'STUDENT', $4::uuid, $5::uuid, $6, $7, CASE WHEN $8::text IS NOT NULL AND $8::text != '' THEN $8::date ELSE NULL END, $9, $10, 'ACTIVE');`,
          generatedUid,
          cleanEmail,
          cleanName,
          classId,
          departmentId,
          collegeId,
          cleanRoll,
          cleanDob,
          cleanPhone,
          cleanParentPhone
        );
        processedStudents.push({
          uid: generatedUid,
          name: cleanName,
          email: cleanEmail,
          registerNumber: cleanRoll,
          dob: cleanDob,
          phone: cleanPhone,
          parentPhone: cleanParentPhone,
          status: 'CREATED',
        });
      }
    }

    return {
      count: processedStudents.length,
      students: processedStudents,
    };
  }

  // ==========================================
  // MANUALLY ADD A STUDENT
  // ==========================================
  async addStudent(
    facultyUid: string,
    classId: string,
    student: BulkStudentUploadItem
  ): Promise<any> {
    const res = await this.bulkUploadStudents(facultyUid, classId, [student]);
    return res.students[0] || null;
  }

  // ==========================================
  // DELETE / REMOVE STUDENT FROM CLASS
  // ==========================================
  async deleteStudent(
    facultyUid: string,
    classId: string,
    studentUid: string
  ): Promise<{ success: boolean; message: string }> {
    // 1. If this student is currently assigned as class representative, unassign them
    await prisma.$queryRawUnsafe(
      `UPDATE classes SET class_rep_uid = NULL WHERE id = $1::uuid AND class_rep_uid = $2;`,
      classId,
      studentUid
    ).catch(() => {});

    // 2. Delete student or unenroll from this class
    try {
      await prisma.$queryRawUnsafe(
        `DELETE FROM authed_users WHERE uid = $1 AND class_id = $2::uuid;`,
        studentUid,
        classId
      );
    } catch (err) {
      await prisma.$queryRawUnsafe(
        `UPDATE authed_users SET class_id = NULL WHERE uid = $1 AND class_id = $2::uuid;`,
        studentUid,
        classId
      );
    }

    return {
      success: true,
      message: 'Student removed from class successfully',
    };
  }

  // ==========================================
  // CLASS REPRESENTATIVE (CR) ASSIGNMENT
  // ==========================================
  async assignClassRepresentative(
    facultyUid: string,
    classId: string,
    studentUid: string | null
  ): Promise<{ classId: string; classRepUid: string | null; classRep: ClassRepresentativeInfo | null }> {
    if (studentUid) {
      const studentRows: any = await prisma.$queryRawUnsafe(
        `SELECT uid, display_name, email, register_number, phone, photo_url FROM authed_users WHERE uid = $1 AND class_id = $2::uuid;`,
        studentUid,
        classId
      );
      if (!studentRows || studentRows.length === 0) {
        throw new Error('Selected student does not belong to this class');
      }

      await prisma.$queryRawUnsafe(
        `UPDATE classes SET class_rep_uid = $1 WHERE id = $2::uuid;`,
        studentUid,
        classId
      );

      const s = studentRows[0];
      return {
        classId,
        classRepUid: studentUid,
        classRep: {
          uid: s.uid,
          name: s.display_name || s.email,
          email: s.email,
          registerNumber: s.register_number || null,
          phone: s.phone || null,
          profilePhoto: s.photo_url || null,
        },
      };
    } else {
      await prisma.$queryRawUnsafe(
        `UPDATE classes SET class_rep_uid = NULL WHERE id = $1::uuid;`,
        classId
      );
      return {
        classId,
        classRepUid: null,
        classRep: null,
      };
    }
  }

  // ==========================================
  // CLASS MASTER TIMETABLE (FOR ENTIRE CLASS)
  // ==========================================
  async getClassTimetable(facultyUid: string, classId: string): Promise<ClassTimetableSlot[]> {
    await this.assertFacultyClassAccess(facultyUid, classId);
    if (await isDatabaseAvailable()) {
      try {
        const slots: any = await prisma.$queryRawUnsafe(
          `SELECT id, class_id, day_of_week, period, start_time, end_time, subject_name, subject_code, faculty_name, room, created_at, updated_at
           FROM class_timetables
           WHERE class_id = $1::uuid AND EXISTS (SELECT 1 FROM (${facultyClassAccessSql}) access)
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
          classId, facultyUid, false
        );
        return slots || [];
      } catch (err: any) {
        console.error('getClassTimetable error:', err);
        return [];
      }
    }
    throw { status: 503, message: 'Database unavailable' };
  }

  async saveClassTimetableSlot(classId: string, slot: Partial<ClassTimetableSlot>): Promise<ClassTimetableSlot> {
    if (slot.id) {
      const updated: any = await prisma.$queryRawUnsafe(
        `UPDATE class_timetables
         SET day_of_week = $1,
             period = $2,
             start_time = $3,
             end_time = $4,
             subject_name = $5,
             subject_code = $6,
             faculty_name = $7,
             room = $8,
             updated_at = NOW()
         WHERE id = $9::uuid AND class_id = $10::uuid
         RETURNING *;`,
        slot.day_of_week || 'Monday',
        slot.period || 'Period 1',
        slot.start_time || null,
        slot.end_time || null,
        slot.subject_name || 'General Subject',
        slot.subject_code || null,
        slot.faculty_name || null,
        slot.room || null,
        slot.id,
        classId
      );
      return updated[0];
    } else {
      const inserted: any = await prisma.$queryRawUnsafe(
        `INSERT INTO class_timetables (class_id, day_of_week, period, start_time, end_time, subject_name, subject_code, faculty_name, room)
         VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *;`,
        classId,
        slot.day_of_week || 'Monday',
        slot.period || 'Period 1',
        slot.start_time || null,
        slot.end_time || null,
        slot.subject_name || 'General Subject',
        slot.subject_code || null,
        slot.faculty_name || null,
        slot.room || null
      );
      return inserted[0];
    }
  }

  async bulkSaveClassTimetable(
    classId: string,
    slots: Partial<ClassTimetableSlot>[],
    replaceExisting: boolean = true
  ): Promise<{ count: number; slots: ClassTimetableSlot[] }> {
    if (replaceExisting) {
      await prisma.$queryRawUnsafe(
        `DELETE FROM class_timetables WHERE class_id = $1::uuid;`,
        classId
      ).catch(() => {});
    }

    const insertedList: ClassTimetableSlot[] = [];
    for (const slot of slots) {
      if (!slot.day_of_week || !slot.period || !slot.subject_name) continue;

      const res: any = await prisma.$queryRawUnsafe(
        `INSERT INTO class_timetables (class_id, day_of_week, period, start_time, end_time, subject_name, subject_code, faculty_name, room)
         VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *;`,
        classId,
        slot.day_of_week,
        slot.period,
        slot.start_time || null,
        slot.end_time || null,
        slot.subject_name,
        slot.subject_code || null,
        slot.faculty_name || null,
        slot.room || null
      );
      if (res && res[0]) insertedList.push(res[0]);
    }

    return { count: insertedList.length, slots: insertedList };
  }

  async deleteClassTimetableSlot(classId: string, slotId: string): Promise<boolean> {
    try {
      await prisma.$queryRawUnsafe(
        `DELETE FROM class_timetables WHERE id = $1::uuid AND class_id = $2::uuid;`,
        slotId,
        classId
      );
      return true;
    } catch (err) {
      console.error('deleteClassTimetableSlot error:', err);
      return false;
    }
  }

  // ==========================================
  // SUBJECTS & CLASS-WISE PERFORMANCE
  // ==========================================
  async getFacultySubjectsWithClassPerformance(facultyUid: string): Promise<FacultySubjectClassPerformance[]> {
    const faculty = await this.assertFacultyIdentity(facultyUid);
    let timetableRows: any[] = [];
    try {
      timetableRows = await prisma.$queryRawUnsafe(
        `SELECT DISTINCT ft.subject_id, ft.class_id FROM faculty_timetables ft
         JOIN classes c ON c.id = ft.class_id
         JOIN batches b ON b.id = c.batch_id JOIN programs p ON p.id = b.program_id
         JOIN departments d ON d.id = p.department_id
         WHERE ft.faculty_uid = $1 AND c.is_active = true
           AND d.id = $2::uuid AND d.college_id = $3`,
        facultyUid, faculty.department_id, faculty.college_id
      );
    } catch (err: any) {
      console.warn('getFacultySubjectsWithClassPerformance timetableRows query warning:', err);
      timetableRows = [];
    }
    const authedUser: any = await (prisma as any).authedUser.findUnique({
      where: { uid: facultyUid }, include: { subject: true },
    });
    const assignedClassIds = timetableRows.map((r) => r.class_id);
    const allClasses: any[] = await (prisma as any).class.findMany({
      where: {
        is_active: true,
        batch: { program: { department_id: faculty.department_id } },
        OR: [{ faculty_uid: facultyUid }, { id: { in: assignedClassIds } }],
      },
      include: { batch: true, _count: { select: { students: true } } },
    });
    const assignedSubjects: any[] = await (prisma as any).subject.findMany({
      where: {
        department_id: faculty.department_id, is_active: true,
        id: { in: [authedUser?.subject_id, ...timetableRows.map((r) => r.subject_id)].filter(Boolean) },
      },
    });
    {

        const subjectMap = new Map<string, { id: string; name: string; code: string; credits: number; semesterNumber: number }>();

        for (const s of assignedSubjects) {
          subjectMap.set(s.id, {
            id: s.id, name: s.name, code: s.code,
            credits: s.credits ?? 3, semesterNumber: s.semester_number,
          });
        }

        const results: FacultySubjectClassPerformance[] = [];

        for (const [sId, subject] of subjectMap.entries()) {
          const matchedClassIds = timetableRows
            .filter((r: any) => r.subject_id === sId)
            .map((r: any) => r.class_id);
          const subjectClasses = allClasses.filter((c: any) =>
            matchedClassIds.includes(c.id) || (authedUser?.subject_id === sId && c.faculty_uid === facultyUid)
          );

          const classPerformances = await Promise.all(
            subjectClasses.map(async (c: any) => {
              const studentCount = c._count?.students || 0;

              // Query real attendance sessions and attendance records for this class & subject
              let realSessionCount = 0;
              let realAvgAttendance: number | null = null;
              try {
                const sessRows: any = await prisma.$queryRawUnsafe(
                  `SELECT s.id,
                          COUNT(ar.id)::int as total_records,
                          COUNT(CASE WHEN ar.status = 'PRESENT' OR ar.status = 'LATE' OR ar.status = 'EXCUSED' THEN 1 END)::int as attended_records
                   FROM attendance_sessions s
                   LEFT JOIN attendance_records ar ON ar.attendance_session_id = s.id
                   WHERE s.class_id = $1::uuid AND s.subject_id = $2::uuid
                   GROUP BY s.id;`,
                  c.id, sId
                );
                realSessionCount = sessRows?.length || 0;
                if (sessRows && sessRows.length > 0) {
                  const totalRecs = sessRows.reduce((sum: number, r: any) => sum + (r.total_records || 0), 0);
                  const attRecs = sessRows.reduce((sum: number, r: any) => sum + (r.attended_records || 0), 0);
                  if (totalRecs > 0) {
                    realAvgAttendance = Math.round((attRecs / totalRecs) * 1000) / 10;
                  }
                }
              } catch (err) {
                throw err;
              }

              return {
                classId: c.id,
                className: c.name,
                semester: c.current_semester ?? 0,
                batch: c.batch ? `${c.batch.start_year}-${c.batch.end_year}` : '',
                enrolledStudents: studentCount,
                averageAttendance: realAvgAttendance ?? 0,
                ciaAverageScore: 0,
                passPercentage: 0,
                syllabusProgressPercentage: 0,
                totalSessions: realSessionCount,
              };
            })
          );

          results.push({
            subjectId: subject.id,
            subjectName: subject.name,
            subjectCode: subject.code,
            credits: subject.credits,
            semesterNumber: subject.semesterNumber,
            classes: classPerformances,
          });
        }

        return results;
    } // end scoped performance query
  }

  // ==========================================
  // ASSIGNMENTS & SUBMISSIONS
  // ==========================================
  async getMySubjects(facultyUid: string): Promise<any[]> {
    const data = await prisma.classSubject.findMany({
      where: { faculty_uid: facultyUid },
      include: {
        class: {
          select: { id: true, name: true, current_semester: true, batch: { select: { start_year: true, end_year: true } } }
        },
        subject: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    return data.map(cs => ({
      classSubjectId: cs.id,
      classId: cs.class_id,
      className: cs.class.name,
      semester: cs.class.current_semester,
      batch: cs.class.batch ? `${cs.class.batch.start_year}-${cs.class.batch.end_year}` : '',
      subjectId: cs.subject_id,
      subjectName: cs.subject.name,
      subjectCode: cs.subject.code
    }));
  }


  async createAssignment(facultyUid: string, data: any): Promise<any> {
    const { classSubjectId, title, description, dueDate, attachmentUrl } = data;

    // Verify faculty has access to this class subject
    const cs = await prisma.classSubject.findUnique({
      where: { id: classSubjectId }
    });

    if (!cs || cs.faculty_uid !== facultyUid) {
      throw new Error('Unauthorized or invalid class subject');
    }

    return prisma.assignment.create({
      data: {
        class_subject_id: classSubjectId,
        title,
        description,
        due_date: new Date(dueDate),
        attachment_url: attachmentUrl
      }
    });
  }

  async getAssignments(facultyUid: string, classSubjectId?: string): Promise<any[]> {
    const whereClause: any = {
      classSubject: {
        faculty_uid: facultyUid
      }
    };

    if (classSubjectId) {
      whereClause.class_subject_id = classSubjectId;
    }

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        classSubject: {
          include: {
            class: { select: { name: true } },
            subject: { select: { name: true, code: true } }
          }
        },
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return assignments.map(a => ({
      ...a,
      dueDate: a.due_date,
      attachmentUrl: a.attachment_url,
      createdAt: a.created_at,
    }));
  }

  async getAssignmentSubmissions(facultyUid: string, assignmentId: string): Promise<any[]> {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { classSubject: true }
    });

    if (!assignment || assignment.classSubject.faculty_uid !== facultyUid) {
      throw new Error('Unauthorized or invalid assignment');
    }

    const submissions = await prisma.studentSubmission.findMany({
      where: { assignment_id: assignmentId },
      include: {
        student: { select: { uid: true, display_name: true, register_number: true } }
      },
      orderBy: { submitted_at: 'desc' }
    });

    return submissions.map(s => ({
      ...s,
      submittedAt: s.submitted_at,
      fileUrl: s.file_url,
      attachmentUrl: s.file_url,
      studentName: s.student.display_name,
      registerNumber: s.student.register_number,
      student: s.student,
    }));
  }
}

