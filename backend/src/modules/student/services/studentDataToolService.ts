import { studentService, StudentService } from '../student.service';
import {
  StudentContext,
  StudentProfile,
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
} from '../student.types';
import { studentToolRegistry } from '../ai/toolRegistry';

export class StudentDataToolService {
  constructor(private readonly service: StudentService = studentService) {}

  /**
   * Tool 1: student.getDashboard
   * Retrieves student's complete academic dashboard with hierarchy and enrollment.
   */
  async getDashboard(context: StudentContext): Promise<StudentDashboardResponse> {
    return this.service.getDashboard(context);
  }

  /**
   * Tool 2: student.getProfile
   * Retrieves student's personal and academic profile details.
   */
  async getProfile(context: StudentContext): Promise<StudentProfile> {
    return this.service.getProfile(context);
  }

  /**
   * Tool 3: student.getClass
   * Retrieves enrolled class, section, current semester, and hierarchy details.
   */
  async getClass(context: StudentContext): Promise<ClassInfo> {
    return this.service.getClass(context);
  }

  /**
   * Tool 4: student.getBatch
   * Retrieves batch information associated with the student's class.
   */
  async getBatch(context: StudentContext): Promise<BatchInfo> {
    return this.service.getBatch(context);
  }

  /**
   * Tool 5: student.getProgram
   * Retrieves academic degree program details.
   */
  async getProgram(context: StudentContext): Promise<ProgramInfo> {
    return this.service.getProgram(context);
  }

  /**
   * Tool 6: student.getDepartment
   * Retrieves academic department information and assigned HOD details.
   */
  async getDepartment(context: StudentContext): Promise<DepartmentInfo> {
    return this.service.getDepartment(context);
  }

  /**
   * Tool 7: student.getSubjects
   * Retrieves prescribed subjects, optionally filtered by semester number.
   */
  async getSubjects(context: StudentContext, args: { semesterNumber?: number } = {}): Promise<SubjectInfo[]> {
    return this.service.getSubjects(context, args.semesterNumber);
  }

  /**
   * Tool 8: student.getClassIncharge
   * Retrieves faculty details for the student's assigned Class Incharge.
   */
  async getClassIncharge(context: StudentContext): Promise<ClassInchargeInfo> {
    return this.service.getClassIncharge(context);
  }

  /**
   * Tool 9: student.getAcademicYears
   * Retrieves registered academic years for the student's affiliated college.
   */
  async getAcademicYears(context: StudentContext): Promise<AcademicYearInfo[]> {
    return this.service.getAcademicYears(context);
  }

  /**
   * Tool 10: student.getSemesters
   * Retrieves current academic year semesters.
   */
  async getSemesters(context: StudentContext): Promise<SemesterInfo[]> {
    return this.service.getSemesters(context);
  }

  /**
   * Tool 11: student.getTimetable
   * Retrieves official class period timetable slots.
   */
  async getTimetable(context: StudentContext): Promise<ClassTimetableSlot[]> {
    return this.service.getClassTimetable(context);
  }

  /**
   * Tool 12: student.getAttendance
   * Retrieves student's attendance summary, safe margin, 75% rule, and subject breakdowns.
   */
  async getAttendance(context: StudentContext, args: { date?: string } = {}): Promise<StudentAttendanceResponse> {
    return this.service.getAttendance(context, args.date);
  }

  /**
   * Registers all 12 deterministic data tools into the studentToolRegistry.
   */
  public registerAllDataTools(): void {
    // 1. student.getDashboard
    studentToolRegistry.registerTool({
      name: 'student.getDashboard',
      category: 'data',
      description: 'Fetch the comprehensive academic dashboard for the authenticated student.',
      parameters: [],
      handler: async (_args, ctx) => this.getDashboard(ctx),
    });

    // 2. student.getProfile
    studentToolRegistry.registerTool({
      name: 'student.getProfile',
      category: 'data',
      description: "Fetch the authenticated student's personal and academic profile details.",
      parameters: [],
      handler: async (_args, ctx) => this.getProfile(ctx),
    });

    // 3. student.getClass
    studentToolRegistry.registerTool({
      name: 'student.getClass',
      category: 'data',
      description: "Fetch details of the class in which the student is currently enrolled.",
      parameters: [],
      handler: async (_args, ctx) => this.getClass(ctx),
    });

    // 4. student.getBatch
    studentToolRegistry.registerTool({
      name: 'student.getBatch',
      category: 'data',
      description: "Fetch the batch associated with the student's class.",
      parameters: [],
      handler: async (_args, ctx) => this.getBatch(ctx),
    });

    // 5. student.getProgram
    studentToolRegistry.registerTool({
      name: 'student.getProgram',
      category: 'data',
      description: "Fetch the academic degree program of the student.",
      parameters: [],
      handler: async (_args, ctx) => this.getProgram(ctx),
    });

    // 6. student.getDepartment
    studentToolRegistry.registerTool({
      name: 'student.getDepartment',
      category: 'data',
      description: "Fetch the student's academic department details and HOD affiliation.",
      parameters: [],
      handler: async (_args, ctx) => this.getDepartment(ctx),
    });

    // 7. student.getSubjects
    studentToolRegistry.registerTool({
      name: 'student.getSubjects',
      category: 'data',
      description: "Fetch subjects/courses prescribed for the student's department and semester.",
      parameters: [
        {
          name: 'semesterNumber',
          type: 'number',
          description: 'Optional semester number (1-12) to filter subjects.',
          required: false,
        },
      ],
      handler: async (args, ctx) => this.getSubjects(ctx, args),
    });

    // 8. student.getClassIncharge
    studentToolRegistry.registerTool({
      name: 'student.getClassIncharge',
      category: 'data',
      description: "Fetch faculty contact details for the student's assigned Class Incharge.",
      parameters: [],
      handler: async (_args, ctx) => this.getClassIncharge(ctx),
    });

    // 9. student.getAcademicYears
    studentToolRegistry.registerTool({
      name: 'student.getAcademicYears',
      category: 'data',
      description: "Fetch list of academic years registered for the student's affiliated college.",
      parameters: [],
      handler: async (_args, ctx) => this.getAcademicYears(ctx),
    });

    // 10. student.getSemesters
    studentToolRegistry.registerTool({
      name: 'student.getSemesters',
      category: 'data',
      description: "Fetch semester calendar terms for the current academic year.",
      parameters: [],
      handler: async (_args, ctx) => this.getSemesters(ctx),
    });

    // 11. student.getTimetable
    studentToolRegistry.registerTool({
      name: 'student.getTimetable',
      category: 'data',
      description: "Fetch the official weekly period timetable for the student's enrolled class.",
      parameters: [],
      handler: async (_args, ctx) => this.getTimetable(ctx),
    });

    // 12. student.getAttendance
    studentToolRegistry.registerTool({
      name: 'student.getAttendance',
      category: 'data',
      description: "Fetch student attendance metrics, 75% eligibility, safe margin, and subject breakdowns.",
      parameters: [
        {
          name: 'date',
          type: 'string',
          description: 'Optional date string in YYYY-MM-DD format to inspect attendance logs.',
          required: false,
        },
      ],
      handler: async (args, ctx) => this.getAttendance(ctx, args),
    });
  }
}

export const studentDataToolService = new StudentDataToolService();
// Automatically wire the 12 deterministic data tools into the tool registry in non-test runtime
if (process.env.NODE_ENV !== 'test') {
  studentDataToolService.registerAllDataTools();
}
