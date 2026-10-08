import type { HODContext } from '../middleware/authMiddleware';
import {
  BadRequestError,
  ForbiddenError,
  ValidationError,
} from '../utils/errors';
import {
  HOD_TOOL_NAMES,
  HodToolName,
  isHodToolName,
  ToolExecutionResult,
  ToolHandler,
  ToolMetadata,
  HodAttendanceSummaryInput,
  HodAttendanceSummaryOutput,
  HodStudentAttendanceInput,
  HodStudentAttendanceOutput,
  HodClassAttendanceInput,
  HodClassAttendanceOutput,
  HodDepartmentAttendanceInput,
  HodDepartmentAttendanceOutput,
  HodAttendanceAnalyticsInput,
  HodAttendanceAnalyticsOutput,
  HodSearchKnowledgeInput,
  HodSearchKnowledgeOutput,
  HodGetKnowledgeContextInput,
  HodGetKnowledgeContextOutput,
} from './hodAi.types';
import {
  TOOL_INPUT_SCHEMAS,
  TOOL_OUTPUT_SCHEMAS,
} from './hodAi.validation';

/**
 * ============================================================================
 * Default Stub Handlers
 * ============================================================================
 * These provide deterministic, schema-compliant placeholder execution
 * during Step 1 (Abhinav). Varun (Step 2) and Harini (Step 3) will provide
 * live database/RAG implementations via `registerToolHandler`.
 */

export const defaultStubHandlers: {
  [K in HodToolName]: ToolHandler<any, any>;
} = {
  'hod.getAttendanceSummary': async (
    input: HodAttendanceSummaryInput,
    context: HODContext,
  ): Promise<HodAttendanceSummaryOutput> => {
    return {
      departmentId: context.departmentId,
      departmentAverage: 92.4,
      totalStudents: 180,
      totalClasses: 4,
      cohorts: [
        {
          cohortName: 'Year 1 Freshmen',
          batchId: input.batchId || 'batch-2024-2028',
          percentage: 95.2,
          studentCount: 45,
          isAlert: false,
        },
        {
          cohortName: 'Year 2 Sophomores',
          batchId: 'batch-2023-2027',
          percentage: 91.8,
          studentCount: 45,
          isAlert: false,
        },
        {
          cohortName: 'Year 3 Juniors',
          batchId: 'batch-2022-2026',
          percentage: 88.5,
          studentCount: 45,
          isAlert: true,
        },
        {
          cohortName: 'Year 4 Seniors',
          batchId: 'batch-2021-2025',
          percentage: 94.1,
          studentCount: 45,
          isAlert: false,
        },
      ],
      dateRange: {
        startDate: input.startDate || null,
        endDate: input.endDate || null,
      },
      _isStub: true,
    };
  },

  'hod.getStudentAttendance': async (
    input: HodStudentAttendanceInput,
    _context: HODContext,
  ): Promise<HodStudentAttendanceOutput> => {
    return {
      studentId: input.studentId,
      studentName: 'Stub Student',
      registerNumber: 'REG-STUB-001',
      classId: 'class-stub-1',
      className: 'CSE-A (3rd Year)',
      overallPercentage: 72.5,
      isLowAttendance: true,
      totalSessions: 40,
      attendedSessions: 29,
      subjects: [
        {
          subjectId: input.subjectId || 'sub-1',
          subjectCode: 'CS301',
          subjectName: 'Operating Systems',
          percentage: 70.0,
          attended: 14,
          total: 20,
        },
        {
          subjectId: 'sub-2',
          subjectCode: 'CS302',
          subjectName: 'Database Management Systems',
          percentage: 75.0,
          attended: 15,
          total: 20,
        },
      ],
      _isStub: true,
    };
  },

  'hod.getClassAttendance': async (
    input: HodClassAttendanceInput,
    _context: HODContext,
  ): Promise<HodClassAttendanceOutput> => {
    return {
      classId: input.classId,
      className: 'CSE-A',
      batch: '2022-2026',
      section: 'A',
      classInchargeName: 'Dr. Faculty Incharge',
      averagePercentage: 86.4,
      totalStudents: 45,
      presentTodayCount: 41,
      atRiskStudentsCount: 3,
      atRiskStudents: [
        {
          studentId: 'stud-101',
          studentName: 'Alice Johnson',
          registerNumber: 'REG-101',
          percentage: 68.0,
        },
        {
          studentId: 'stud-102',
          studentName: 'Bob Smith',
          registerNumber: 'REG-102',
          percentage: 71.5,
        },
        {
          studentId: 'stud-103',
          studentName: 'Charlie Brown',
          registerNumber: 'REG-103',
          percentage: 73.0,
        },
      ],
      _isStub: true,
    };
  },

  'hod.getDepartmentAttendance': async (
    input: HodDepartmentAttendanceInput,
    context: HODContext,
  ): Promise<HodDepartmentAttendanceOutput> => {
    return {
      departmentId: context.departmentId,
      departmentName: 'Computer Science and Engineering',
      overallPercentage: 89.2,
      totalClasses: 4,
      totalStudents: 180,
      atRiskCount: 14,
      classes: [
        {
          classId: 'cls-1',
          className: 'CSE 1st Year Sec A',
          averagePercentage: 94.2,
          studentCount: 45,
          atRiskCount: 1,
        },
        {
          classId: 'cls-2',
          className: 'CSE 2nd Year Sec A',
          averagePercentage: 90.5,
          studentCount: 45,
          atRiskCount: 3,
        },
        {
          classId: 'cls-3',
          className: 'CSE 3rd Year Sec A',
          averagePercentage: 84.1,
          studentCount: 45,
          atRiskCount: 8,
        },
        {
          classId: 'cls-4',
          className: 'CSE 4th Year Sec A',
          averagePercentage: 88.0,
          studentCount: 45,
          atRiskCount: 2,
        },
      ].filter((cls) => {
        if (input.filterBy === 'at_risk' || input.filterBy === 'low_attendance') {
          return cls.averagePercentage < 85 || cls.atRiskCount > 5;
        }
        return true;
      }),
      _isStub: true,
    };
  },

  'hod.getAttendanceAnalytics': async (
    input: HodAttendanceAnalyticsInput,
    _context: HODContext,
  ): Promise<HodAttendanceAnalyticsOutput> => {
    return {
      timeframe: input.timeframe || 'semester',
      metric: input.metric || 'trends',
      trends: [
        { period: 'Week 1-4', percentage: 94.0, sessionsHeld: 80 },
        { period: 'Week 5-8', percentage: 91.2, sessionsHeld: 84 },
        { period: 'Week 9-12', percentage: 87.5, sessionsHeld: 76 },
        { period: 'Week 13-16', percentage: 89.1, sessionsHeld: 70 },
      ],
      defaulterBuckets: {
        below65: 4,
        between65And75: 10,
        above75: 166,
      },
      insights: [
        'Junior cohort attendance dropped 6% during mid-term examination weeks.',
        '4 students are currently below the critical 65% university threshold.',
        'Highest departmental attendance recorded in 1st year cohort (95.2%).',
      ],
      _isStub: true,
    };
  },

  'hod.searchKnowledge': async (
    input: HodSearchKnowledgeInput,
    _context: HODContext,
  ): Promise<HodSearchKnowledgeOutput> => {
    return {
      query: input.query,
      resultsCount: 2,
      results: [
        {
          documentId: 'doc-policy-01',
          title: 'Institutional Attendance Policy 2026',
          category: input.category || 'policy',
          snippet:
            'Students require a minimum of 75% aggregate attendance to qualify for university end-semester examinations...',
          score: 0.94,
        },
        {
          documentId: 'doc-handbook-02',
          title: 'HOD Academic Governance Handbook',
          category: 'handbook',
          snippet:
            'HODs must conduct monthly attendance surveillance meetings with designated class in-charges...',
          score: 0.88,
        },
      ],
      _isStub: true,
    };
  },

  'hod.getKnowledgeContext': async (
    input: HodGetKnowledgeContextInput,
    _context: HODContext,
  ): Promise<HodGetKnowledgeContextOutput> => {
    return {
      documentId: input.documentId,
      title: 'Institutional Academic Regulations 2026',
      section: input.section || 'Attendance & Condonation',
      content:
        'Full document context excerpt: Section 4.2 states that condonation of attendance between 65% and 74% may only be granted on valid medical grounds approved by the HOD and Dean.',
      lastUpdated: '2026-08-15T00:00:00.000Z',
      metadata: {
        departmentScoped: false,
        classification: 'PUBLIC_INTERNAL',
      },
      _isStub: true,
    };
  },
};

/**
 * ============================================================================
 * Canonical Tool Registry Implementation
 * ============================================================================
 */
export class HodToolRegistry {
  private handlers = new Map<HodToolName, ToolHandler<any, any>>();

  private metadata: Record<HodToolName, ToolMetadata> = {
    'hod.getAttendanceSummary': {
      name: 'hod.getAttendanceSummary',
      description:
        'Retrieve high-level departmental attendance summary across batches, cohorts, or date intervals.',
      parameterDescription:
        'Optional batchId, classId, startDate (YYYY-MM-DD), endDate (YYYY-MM-DD).',
      requiredRole: 'HOD',
      owner: 'VARUN',
    },
    'hod.getStudentAttendance': {
      name: 'hod.getStudentAttendance',
      description:
        'Retrieve detailed attendance record, percentage, and subject breakdown for a specific student.',
      parameterDescription:
        'studentId (required), optional subjectId, startDate, endDate.',
      requiredRole: 'HOD',
      owner: 'VARUN',
    },
    'hod.getClassAttendance': {
      name: 'hod.getClassAttendance',
      description:
        'Retrieve detailed attendance statistics, averages, and at-risk student list for a class.',
      parameterDescription:
        'classId (required), optional startDate, endDate.',
      requiredRole: 'HOD',
      owner: 'VARUN',
    },
    'hod.getDepartmentAttendance': {
      name: 'hod.getDepartmentAttendance',
      description:
        'Retrieve comprehensive attendance across all classes in the HOD department with optional filtering.',
      parameterDescription:
        'optional startDate, endDate, filterBy ("all" | "at_risk" | "low_attendance").',
      requiredRole: 'HOD',
      owner: 'VARUN',
    },
    'hod.getAttendanceAnalytics': {
      name: 'hod.getAttendanceAnalytics',
      description:
        'Retrieve departmental analytics, attendance trends over time, and defaulter distributions.',
      parameterDescription:
        'optional timeframe ("week" | "month" | "semester" | "academic_year"), metric ("trends" | "defaulters" | "subject_breakdown" | "distribution").',
      requiredRole: 'HOD',
      owner: 'VARUN',
    },
    'hod.searchKnowledge': {
      name: 'hod.searchKnowledge',
      description:
        'Search academic policies, institutional regulations, curriculum syllabi, and administrative guidelines.',
      parameterDescription:
        'query (required string min 2 chars), optional category, optional limit.',
      requiredRole: 'HOD',
      owner: 'HARINI',
    },
    'hod.getKnowledgeContext': {
      name: 'hod.getKnowledgeContext',
      description:
        'Retrieve full text or specific section of an institutional knowledge document.',
      parameterDescription:
        'documentId (required), optional section.',
      requiredRole: 'HOD',
      owner: 'HARINI',
    },
  };

  constructor() {
    // Register default stubs initially
    for (const name of HOD_TOOL_NAMES) {
      this.handlers.set(name, defaultStubHandlers[name]);
    }
  }

  /**
   * Register or replace a tool handler implementation.
   * Varun (Step 2) and Harini (Step 3) will call this method to mount live logic.
   */
  public registerToolHandler<TInput = any, TOutput = any>(
    toolName: HodToolName,
    handler: ToolHandler<TInput, TOutput>,
  ): void {
    if (!isHodToolName(toolName)) {
      throw new BadRequestError(`Cannot register invalid tool name: ${toolName}`);
    }
    this.handlers.set(toolName, handler);
  }

  /**
   * Reset a tool handler to its default stub (used in tests).
   */
  public resetToDefaultStub(toolName?: HodToolName): void {
    if (toolName) {
      if (isHodToolName(toolName)) {
        this.handlers.set(toolName, defaultStubHandlers[toolName]);
      }
    } else {
      for (const name of HOD_TOOL_NAMES) {
        this.handlers.set(name, defaultStubHandlers[name]);
      }
    }
  }

  /**
   * Retrieve tool metadata for all 7 canonical tools.
   */
  public getRegisteredTools(): ToolMetadata[] {
    return HOD_TOOL_NAMES.map((name) => this.metadata[name]);
  }

  /**
   * Retrieve metadata for a specific tool.
   */
  public getToolMetadata(toolName: string): ToolMetadata {
    if (!isHodToolName(toolName)) {
      throw new BadRequestError(`Tool not found: ${toolName}`);
    }
    return this.metadata[toolName];
  }

  /**
   * Safely execute a tool by name with strict schema validation
   * and server-enforced tenant isolation.
   */
  public async executeTool(
    toolName: string,
    rawArgs: Record<string, any> = {},
    context: HODContext,
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    // 1. Tool existence check
    if (!isHodToolName(toolName)) {
      return {
        toolName: toolName as any,
        arguments: rawArgs,
        status: 'error',
        error: {
          code: 'TOOL_NOT_FOUND',
          message: `Tool "${toolName}" is not registered in the canonical HOD tool registry. Approved tools are: ${HOD_TOOL_NAMES.join(', ')}`,
        },
        executionDurationMs: Date.now() - startTime,
      };
    }

    // 2. Authorization check
    if (!context || !context.departmentId || !context.collegeId) {
      throw new ForbiddenError(
        'Missing verified departmental or institutional authorization context',
      );
    }

    // 3. Prevent tenant / department boundary tampering from LLM or client
    if (rawArgs.departmentId && rawArgs.departmentId !== context.departmentId) {
      throw new ForbiddenError(
        'Tenant isolation violation: HOD cannot query a different department',
      );
    }
    if (rawArgs.collegeId && rawArgs.collegeId !== context.collegeId) {
      throw new ForbiddenError(
        'Tenant isolation violation: HOD cannot query a different college',
      );
    }

    // 4. Input argument validation
    const inputSchema = TOOL_INPUT_SCHEMAS[toolName];
    const parseResult = inputSchema.safeParse(rawArgs);

    if (!parseResult.success) {
      return {
        toolName,
        arguments: rawArgs,
        status: 'error',
        error: {
          code: 'MALFORMED_TOOL_ARGUMENTS',
          message: 'Tool arguments failed schema validation',
          details: parseResult.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        executionDurationMs: Date.now() - startTime,
      };
    }

    // 5. Execution through registered handler
    const handler = this.handlers.get(toolName);
    if (!handler) {
      return {
        toolName,
        arguments: parseResult.data,
        status: 'error',
        error: {
          code: 'HANDLER_MISSING',
          message: `No handler registered for tool: ${toolName}`,
        },
        executionDurationMs: Date.now() - startTime,
      };
    }

    try {
      const output = await handler(parseResult.data, context);

      // 6. Output schema verification
      const outputSchema = TOOL_OUTPUT_SCHEMAS[toolName];
      const outputValidation = outputSchema.safeParse(output);

      if (!outputValidation.success) {
        // Log warning for output schema mismatch, but return output to prevent hard crash
        return {
          toolName,
          arguments: parseResult.data,
          status: 'success',
          result: output,
          error: {
            code: 'OUTPUT_VALIDATION_WARNING',
            message: 'Output from tool handler did not strictly match schema',
            details: outputValidation.error.errors,
          },
          executionDurationMs: Date.now() - startTime,
        };
      }

      return {
        toolName,
        arguments: parseResult.data,
        status: 'success',
        result: outputValidation.data,
        executionDurationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        toolName,
        arguments: parseResult.data,
        status: 'error',
        error: {
          code: err.errorCode || err.code || 'TOOL_EXECUTION_FAILED',
          message: err.message || 'An error occurred during tool execution',
        },
        executionDurationMs: Date.now() - startTime,
      };
    }
  }
}

export const hodToolRegistry = new HodToolRegistry();
