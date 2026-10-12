import { AppError } from '../../../utils/errors';
import {
  STUDENT_TOOL_NAMES,
  StudentToolName,
  CanonicalToolDefinition,
  StudentContext,
  ToolExecutionResult,
} from './studentAi.types';
import { toolArgumentSchemas } from './studentAi.validation';

export class StudentToolRegistry {
  private tools: Map<StudentToolName, CanonicalToolDefinition> = new Map();

  constructor() {
    this.registerDefaults();
  }

  /**
   * Registers or updates a canonical tool definition with its executor handler.
   */
  public registerTool(tool: CanonicalToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Retrieves a tool definition by canonical name.
   */
  public getTool(name: StudentToolName): CanonicalToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Lists all registered canonical tools and their schemas/descriptions.
   */
  public listTools(): Array<Omit<CanonicalToolDefinition, 'handler'>> {
    return Array.from(this.tools.values()).map(({ name, category, description, parameters }) => ({
      name,
      category,
      description,
      parameters,
    }));
  }

  /**
   * Safely executes a canonical tool with Zod schema validation and error wrapping.
   */
  public async executeTool(
    name: StudentToolName,
    rawArgs: Record<string, any>,
    context: StudentContext,
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const tool = this.tools.get(name);

    if (!tool) {
      return {
        toolName: name,
        status: 'error',
        args: rawArgs,
        error: {
          code: 'TOOL_NOT_FOUND',
          message: `Tool '${name}' is not registered in the student tool registry.`,
        },
        durationMs: Date.now() - startTime,
      };
    }

    // Validate tool arguments against Zod schema
    const schema = toolArgumentSchemas[name];
    let validatedArgs: any = rawArgs;

    if (schema) {
      const parseResult = schema.safeParse(rawArgs);
      if (!parseResult.success) {
        return {
          toolName: name,
          status: 'error',
          args: rawArgs,
          error: {
            code: 'INVALID_TOOL_ARGUMENTS',
            message: `Invalid arguments for tool '${name}': ${parseResult.error.errors.map((e) => e.message).join(', ')}`,
            details: parseResult.error.format(),
          },
          durationMs: Date.now() - startTime,
        };
      }
      validatedArgs = parseResult.data;
    }

    try {
      const result = await tool.handler(validatedArgs, context);
      return {
        toolName: name,
        status: 'success',
        args: validatedArgs,
        result,
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      const code = err instanceof AppError ? err.code : 'TOOL_EXECUTION_ERROR';
      const message = err?.message || 'An unexpected error occurred during tool execution.';
      return {
        toolName: name,
        status: 'error',
        args: validatedArgs,
        error: {
          code,
          message,
          details: err?.details,
        },
        durationMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Initialize all 14 canonical tools with definitions and default fallback stubs.
   */
  private registerDefaults(): void {
    // 1. student.getDashboard
    this.registerTool({
      name: 'student.getDashboard',
      category: 'data',
      description: 'Fetch the comprehensive academic dashboard for the authenticated student.',
      parameters: [],
      handler: async (_args, ctx) => defaultStubHandlers['student.getDashboard'](_args, ctx),
    });

    // 2. student.getProfile
    this.registerTool({
      name: 'student.getProfile',
      category: 'data',
      description: "Fetch the authenticated student's personal and academic profile details.",
      parameters: [],
      handler: async (_args, ctx) => defaultStubHandlers['student.getProfile'](_args, ctx),
    });

    // 3. student.getClass
    this.registerTool({
      name: 'student.getClass',
      category: 'data',
      description: "Fetch details of the class in which the student is currently enrolled.",
      parameters: [],
      handler: async (_args, ctx) => defaultStubHandlers['student.getClass'](_args, ctx),
    });

    // 4. student.getBatch
    this.registerTool({
      name: 'student.getBatch',
      category: 'data',
      description: "Fetch the batch (e.g. 2022-2026) associated with the student's class.",
      parameters: [],
      handler: async (_args, ctx) => defaultStubHandlers['student.getBatch'](_args, ctx),
    });

    // 5. student.getProgram
    this.registerTool({
      name: 'student.getProgram',
      category: 'data',
      description: "Fetch the academic degree program (e.g. B.Tech Computer Science) of the student.",
      parameters: [],
      handler: async (_args, ctx) => defaultStubHandlers['student.getProgram'](_args, ctx),
    });

    // 6. student.getDepartment
    this.registerTool({
      name: 'student.getDepartment',
      category: 'data',
      description: "Fetch the student's academic department details and HOD affiliation.",
      parameters: [],
      handler: async (_args, ctx) => defaultStubHandlers['student.getDepartment'](_args, ctx),
    });

    // 7. student.getSubjects
    this.registerTool({
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
      handler: async (args, ctx) => defaultStubHandlers['student.getSubjects'](args, ctx),
    });

    // 8. student.getClassIncharge
    this.registerTool({
      name: 'student.getClassIncharge',
      category: 'data',
      description: "Fetch faculty contact details for the student's assigned Class Incharge.",
      parameters: [],
      handler: async (_args, ctx) => defaultStubHandlers['student.getClassIncharge'](_args, ctx),
    });

    // 9. student.getAcademicYears
    this.registerTool({
      name: 'student.getAcademicYears',
      category: 'data',
      description: "Fetch list of academic years registered for the student's affiliated college.",
      parameters: [],
      handler: async (_args, ctx) => defaultStubHandlers['student.getAcademicYears'](_args, ctx),
    });

    // 10. student.getSemesters
    this.registerTool({
      name: 'student.getSemesters',
      category: 'data',
      description: "Fetch semester calendar terms for the current academic year.",
      parameters: [],
      handler: async (_args, ctx) => defaultStubHandlers['student.getSemesters'](_args, ctx),
    });

    // 11. student.getTimetable
    this.registerTool({
      name: 'student.getTimetable',
      category: 'data',
      description: "Fetch the official weekly period timetable for the student's enrolled class.",
      parameters: [],
      handler: async (_args, ctx) => defaultStubHandlers['student.getTimetable'](_args, ctx),
    });

    // 12. student.getAttendance
    this.registerTool({
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
      handler: async (args, ctx) => defaultStubHandlers['student.getAttendance'](args, ctx),
    });

    // 13. student.searchKnowledge
    this.registerTool({
      name: 'student.searchKnowledge',
      category: 'rag',
      description: "Search institutional academic regulations, exam bylaws, attendance condonation, and student policies.",
      parameters: [
        {
          name: 'query',
          type: 'string',
          description: 'The semantic question or keywords to search in institutional knowledge.',
          required: true,
        },
        {
          name: 'category',
          type: 'string',
          description: 'Category filter: policy, regulation, exam, handbook, general, dress_code, or discipline.',
          required: false,
          enum: ['policy', 'regulation', 'exam', 'handbook', 'general', 'dress_code', 'discipline'],
        },
        {
          name: 'limit',
          type: 'number',
          description: 'Maximum number of relevant knowledge passages to retrieve (1-20).',
          required: false,
          default: 5,
        },
      ],
      handler: async (args, ctx) => defaultStubHandlers['student.searchKnowledge'](args, ctx),
    });

    // 14. student.getKnowledgeContext
    this.registerTool({
      name: 'student.getKnowledgeContext',
      category: 'rag',
      description: "Retrieve full document text or specific section for a referenced institutional guideline.",
      parameters: [
        {
          name: 'documentId',
          type: 'string',
          description: 'The unique ID of the institutional guideline or handbook document.',
          required: true,
        },
        {
          name: 'section',
          type: 'string',
          description: 'Optional specific section or clause identifier.',
          required: false,
        },
      ],
      handler: async (args, ctx) => defaultStubHandlers['student.getKnowledgeContext'](args, ctx),
    });
  }
}

/**
 * Default fallback handlers used when real service singletons are not yet wired or in unit tests.
 */
export const defaultStubHandlers: Record<
  StudentToolName,
  (args: any, context: StudentContext) => Promise<any>
> = {
  'student.getDashboard': async (_args, context) => ({
    student: {
      displayName: context.displayName || 'Enrolled Student',
      email: context.email,
      registerNumber: context.registerNumber || 'REG-PENDING',
    },
    class: { id: context.classId || 'cls-default', name: 'Computer Science Section A' },
    attendanceSummary: { percentage: 85.5, isEligible: true, safeMargin: 3 },
  }),

  'student.getProfile': async (_args, context) => ({
    uid: context.uid,
    displayName: context.displayName || 'Enrolled Student',
    email: context.email,
    registerNumber: context.registerNumber || 'REG-PENDING',
    role: 'STUDENT',
    collegeId: context.collegeId,
    departmentId: context.departmentId,
    classId: context.classId,
  }),

  'student.getClass': async (_args, context) => ({
    id: context.classId || 'cls-default',
    name: 'B.Tech CSE - Section A',
    currentSemester: 6,
  }),

  'student.getBatch': async (_args, _context) => ({
    startYear: 2022,
    endYear: 2026,
    name: '2022-2026 Batch',
  }),

  'student.getProgram': async (_args, _context) => ({
    name: 'Bachelor of Technology in Computer Science & Engineering',
    type: 'UG',
    durationYears: 4,
  }),

  'student.getDepartment': async (_args, context) => ({
    id: context.departmentId || 'dept-cse',
    name: 'Department of Computer Science & Engineering',
    code: 'CSE',
  }),

  'student.getSubjects': async (args, _context) => [
    { code: 'CS601', name: 'Compiler Design', credits: 4, semesterNumber: args.semesterNumber || 6 },
    { code: 'CS602', name: 'Computer Networks', credits: 3, semesterNumber: args.semesterNumber || 6 },
    { code: 'CS603', name: 'Cloud Computing & DevOps', credits: 3, semesterNumber: args.semesterNumber || 6 },
  ],

  'student.getClassIncharge': async (_args, _context) => ({
    name: 'Dr. Robert Vance',
    email: 'robert.vance@institution.edu',
    designation: 'Associate Professor',
    department: 'Computer Science & Engineering',
  }),

  'student.getAcademicYears': async (_args, _context) => [
    { name: '2025-2026', isCurrent: true, startDate: '2025-07-01', endDate: '2026-06-30' },
  ],

  'student.getSemesters': async (_args, _context) => [
    { termNumber: 6, startDate: '2026-01-05', endDate: '2026-05-20' },
  ],

  'student.getTimetable': async (_args, _context) => [],

  'student.getAttendance': async (_args, _context) => ({
    summary: {
      totalSessions: 120,
      attendedSessions: 104,
      presentCount: 100,
      lateCount: 4,
      absentCount: 16,
      excusedCount: 0,
      percentage: 86.7,
      isEligible: true,
      safeMargin: 14,
      todayTotal: 4,
      todayAttended: 4,
      todayPresent: 4,
      todayLate: 0,
      todayAbsent: 0,
      todayExcused: 0,
      todayEffectivePercentage: 100,
    },
    subjectBreakdown: [
      {
        id: 'sub-cs601',
        code: 'CS601',
        name: 'Compiler Design',
        held: 40,
        attended: 36,
        excused: 0,
        absent: 4,
        percentage: 90.0,
        status: 'SAFE',
      },
      {
        id: 'sub-cs602',
        code: 'CS602',
        name: 'Computer Networks',
        held: 40,
        attended: 34,
        excused: 0,
        absent: 6,
        percentage: 85.0,
        status: 'SAFE',
      },
    ],
    dailySchedule: [],
  }),

  'student.searchKnowledge': async (args, _context) => ({
    query: args.query,
    category: args.category || 'general',
    results: [
      {
        documentId: 'doc-student-att-policy',
        title: 'Institutional Attendance & Condonation Regulations',
        category: 'policy',
        snippet:
          'Students must maintain a minimum of 75% attendance in each course. A condonation range of 65%-74% is permitted on medical grounds subject to approved documentation and payment of prescribed condonation fee.',
        score: 0.94,
        source: 'Academic Regulations 2024-2028 Clause 4.2',
      },
    ],
    totalMatches: 1,
  }),

  'student.getKnowledgeContext': async (args, _context) => ({
    documentId: args.documentId,
    title: 'Academic Handbook & Student Code of Conduct',
    category: 'policy',
    content:
      'Official Institutional Academic Regulations:\n\n1. Attendance Requirement: Minimum 75% overall attendance is mandatory to appear for semester end examinations.\n2. Condonation: Medical leave certificates must be verified by the institutional medical officer within 7 working days of absence.\n3. Continuous Internal Assessment (CIA): CIA comprises 40% of overall course marks (tests, assignments, attendance).',
  }),
};

export const studentToolRegistry = new StudentToolRegistry();
