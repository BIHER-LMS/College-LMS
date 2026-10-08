/**
 * HOD AI Orchestrator — Canonical Tool Registry
 *
 * This registry is the SINGLE source of truth for all tools the
 * HOD AI orchestrator may invoke. The LLM is restricted to only
 * the tools registered here.
 *
 * Tool executors are initially stubs returning NOT_IMPLEMENTED.
 * Varun will implement the attendance/analytics executors.
 * Harini will implement the knowledge/RAG executors.
 *
 * IMPORTANT: Do NOT add tools to this registry without updating
 * the HOD_AI_TOOL_CONTRACT.md document.
 *
 * @module hod-ai/tool-registry
 * @owner Abhinav
 */

import type {
  HODAIToolDefinition,
  ToolExecutor,
  ToolExecutionResult,
  HODAIContext,
} from './hod-ai.types';
import { toolArgSchemas } from './hod-ai.validation';
import { logger } from '../../utils/logger';

// ─── Stub Executor ───────────────────────────────────────────────────

/**
 * Default stub executor that returns a NOT_IMPLEMENTED result.
 * Downstream developers replace this with real implementations
 * by calling `toolRegistry.registerExecutor(toolName, executor)`.
 */
const stubExecutor: ToolExecutor = async (
  _context: HODAIContext,
  _args: Record<string, unknown>,
): Promise<ToolExecutionResult> => {
  return {
    success: false,
    data: null,
    error: 'Tool executor not yet implemented. Awaiting downstream developer implementation.',
  };
};

// ─── Tool Definitions ────────────────────────────────────────────────

const HOD_TOOL_DEFINITIONS: HODAIToolDefinition[] = [
  {
    name: 'hod.getAttendanceSummary',
    purpose:
      'Get an overall attendance summary for the HOD\'s department. ' +
      'Returns aggregate attendance statistics (total sessions, average attendance rate, etc.) ' +
      'optionally filtered by date range.',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: { type: 'string', format: 'date', description: 'Optional start date (YYYY-MM-DD)' },
        endDate: { type: 'string', format: 'date', description: 'Optional end date (YYYY-MM-DD)' },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        totalSessions: { type: 'number' },
        totalStudents: { type: 'number' },
        averageAttendanceRate: { type: 'number' },
        classBreakdown: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              classId: { type: 'string' },
              className: { type: 'string' },
              attendanceRate: { type: 'number' },
              totalSessions: { type: 'number' },
            },
          },
        },
      },
    },
    authorization: {
      roles: ['HOD', 'COLLEGE_ADMIN'],
      requiresDepartment: true,
      requiresCollege: true,
    },
    executorPath: 'backend/src/modules/hod-ai/tools/attendance.tools.ts',
    errorBehavior:
      'Returns { success: false, error: "..." } with sanitized message. ' +
      'Never exposes SQL, Prisma, or database details.',
  },
  {
    name: 'hod.getStudentAttendance',
    purpose:
      'Get attendance details for a specific student within the HOD\'s department. ' +
      'The student must belong to the HOD\'s department (enforced server-side).',
    inputSchema: {
      type: 'object',
      properties: {
        studentUid: { type: 'string', description: 'Firebase UID of the student' },
        startDate: { type: 'string', format: 'date', description: 'Optional start date (YYYY-MM-DD)' },
        endDate: { type: 'string', format: 'date', description: 'Optional end date (YYYY-MM-DD)' },
      },
      required: ['studentUid'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        studentUid: { type: 'string' },
        studentName: { type: 'string' },
        className: { type: 'string' },
        overallAttendanceRate: { type: 'number' },
        totalPresent: { type: 'number' },
        totalAbsent: { type: 'number' },
        totalSessions: { type: 'number' },
        subjectBreakdown: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              subjectName: { type: 'string' },
              attendanceRate: { type: 'number' },
              held: { type: 'number' },
              attended: { type: 'number' },
            },
          },
        },
      },
    },
    authorization: {
      roles: ['HOD', 'COLLEGE_ADMIN'],
      requiresDepartment: true,
      requiresCollege: true,
    },
    executorPath: 'backend/src/modules/hod-ai/tools/attendance.tools.ts',
    errorBehavior:
      'Returns { success: false, error: "..." } with sanitized message. ' +
      'Returns TOOL_ARGS_INVALID if studentUid is missing. ' +
      'Returns FORBIDDEN if student is not in the HOD\'s department.',
  },
  {
    name: 'hod.getClassAttendance',
    purpose:
      'Get attendance details for a specific class within the HOD\'s department. ' +
      'The class must belong to the HOD\'s department (enforced server-side).',
    inputSchema: {
      type: 'object',
      properties: {
        classId: { type: 'string', format: 'uuid', description: 'UUID of the class' },
        date: { type: 'string', format: 'date', description: 'Optional specific date (YYYY-MM-DD)' },
      },
      required: ['classId'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        classId: { type: 'string' },
        className: { type: 'string' },
        date: { type: 'string' },
        totalStudents: { type: 'number' },
        presentCount: { type: 'number' },
        absentCount: { type: 'number' },
        attendanceRate: { type: 'number' },
        sessions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              period: { type: 'string' },
              subjectName: { type: 'string' },
              facultyName: { type: 'string' },
              presentCount: { type: 'number' },
              absentCount: { type: 'number' },
            },
          },
        },
      },
    },
    authorization: {
      roles: ['HOD', 'COLLEGE_ADMIN'],
      requiresDepartment: true,
      requiresCollege: true,
    },
    executorPath: 'backend/src/modules/hod-ai/tools/attendance.tools.ts',
    errorBehavior:
      'Returns { success: false, error: "..." } with sanitized message. ' +
      'Returns FORBIDDEN if class is not in the HOD\'s department.',
  },
  {
    name: 'hod.getDepartmentAttendance',
    purpose:
      'Get a comprehensive attendance report for the entire department. ' +
      'Automatically scoped to the HOD\'s department.',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: { type: 'string', format: 'date', description: 'Optional start date (YYYY-MM-DD)' },
        endDate: { type: 'string', format: 'date', description: 'Optional end date (YYYY-MM-DD)' },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        departmentId: { type: 'string' },
        departmentName: { type: 'string' },
        overallAttendanceRate: { type: 'number' },
        totalStudents: { type: 'number' },
        totalFaculty: { type: 'number' },
        classBreakdown: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              classId: { type: 'string' },
              className: { type: 'string' },
              studentCount: { type: 'number' },
              attendanceRate: { type: 'number' },
            },
          },
        },
      },
    },
    authorization: {
      roles: ['HOD', 'COLLEGE_ADMIN'],
      requiresDepartment: true,
      requiresCollege: true,
    },
    executorPath: 'backend/src/modules/hod-ai/tools/attendance.tools.ts',
    errorBehavior:
      'Returns { success: false, error: "..." } with sanitized message.',
  },
  {
    name: 'hod.getAttendanceAnalytics',
    purpose:
      'Get attendance analytics: trends over time, class comparisons, ' +
      'or at-risk student identification.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['trend', 'comparison', 'risk'],
          description: 'Type of analytics',
        },
        periodDays: {
          type: 'number',
          description: 'Period in days for trend analysis (default: 30)',
        },
        classId: {
          type: 'string',
          format: 'uuid',
          description: 'Optional class UUID filter',
        },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        data: { type: 'object', description: 'Analytics data (shape varies by type)' },
      },
    },
    authorization: {
      roles: ['HOD', 'COLLEGE_ADMIN'],
      requiresDepartment: true,
      requiresCollege: true,
    },
    executorPath: 'backend/src/modules/hod-ai/tools/attendance.tools.ts',
    errorBehavior:
      'Returns { success: false, error: "..." } with sanitized message.',
  },
  {
    name: 'hod.searchKnowledge',
    purpose:
      'Search the department knowledge base for relevant documents, policies, or academic information.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        maxResults: { type: 'number', description: 'Max results (default: 5, max: 20)' },
        category: {
          type: 'string',
          enum: ['attendance', 'curriculum', 'academic', 'policy', 'general'],
          description: 'Optional category filter',
        },
      },
      required: ['query'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              documentId: { type: 'string' },
              title: { type: 'string' },
              snippet: { type: 'string' },
              category: { type: 'string' },
              relevanceScore: { type: 'number' },
            },
          },
        },
        totalResults: { type: 'number' },
      },
    },
    authorization: {
      roles: ['HOD', 'COLLEGE_ADMIN'],
      requiresDepartment: true,
      requiresCollege: true,
    },
    executorPath: 'backend/src/modules/hod-ai/tools/knowledge.tools.ts',
    errorBehavior:
      'Returns { success: false, error: "..." } with sanitized message.',
  },
  {
    name: 'hod.getKnowledgeContext',
    purpose:
      'Retrieve the full content of a specific knowledge document by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        documentId: { type: 'string', description: 'Knowledge document ID' },
      },
      required: ['documentId'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        documentId: { type: 'string' },
        title: { type: 'string' },
        content: { type: 'string' },
        category: { type: 'string' },
        lastUpdated: { type: 'string', format: 'date-time' },
      },
    },
    authorization: {
      roles: ['HOD', 'COLLEGE_ADMIN'],
      requiresDepartment: true,
      requiresCollege: true,
    },
    executorPath: 'backend/src/modules/hod-ai/tools/knowledge.tools.ts',
    errorBehavior:
      'Returns { success: false, error: "..." } with sanitized message. ' +
      'Returns NOT_FOUND if documentId does not exist.',
  },
];

// ─── Tool Registry Class ─────────────────────────────────────────────

/**
 * Canonical HOD AI Tool Registry.
 *
 * Manages the set of approved tools the AI orchestrator may invoke.
 * Provides lookup, validation, and execution capabilities.
 *
 * Downstream developers register their executors via `registerExecutor()`.
 */
class HODAIToolRegistry {
  private definitions: Map<string, HODAIToolDefinition> = new Map();
  private executors: Map<string, ToolExecutor> = new Map();

  constructor() {
    // Register all canonical tool definitions
    for (const def of HOD_TOOL_DEFINITIONS) {
      this.definitions.set(def.name, def);
      this.executors.set(def.name, stubExecutor);
    }
    logger.info(`[HOD-AI] Tool registry initialized with ${this.definitions.size} tools`);
  }

  /**
   * Get all registered tool definitions.
   * Used by the orchestrator to build the LLM's tool list.
   */
  getToolDefinitions(): HODAIToolDefinition[] {
    return Array.from(this.definitions.values());
  }

  /**
   * Get a specific tool definition by canonical name.
   */
  getToolDefinition(name: string): HODAIToolDefinition | undefined {
    return this.definitions.get(name);
  }

  /**
   * Check if a tool name is registered.
   */
  hasTool(name: string): boolean {
    return this.definitions.has(name);
  }

  /**
   * Get the list of all canonical tool names.
   */
  getToolNames(): string[] {
    return Array.from(this.definitions.keys());
  }

  /**
   * Register a real executor for a tool, replacing the stub.
   *
   * This is the entry point for Varun (attendance tools) and
   * Harini (knowledge tools) to plug in their implementations.
   *
   * @param toolName - Must match a canonical tool name
   * @param executor - The executor function
   * @throws if toolName is not registered
   */
  registerExecutor(toolName: string, executor: ToolExecutor): void {
    if (!this.definitions.has(toolName)) {
      throw new Error(
        `[HOD-AI] Cannot register executor for unknown tool: '${toolName}'. ` +
        `Registered tools: ${this.getToolNames().join(', ')}`,
      );
    }
    this.executors.set(toolName, executor);
    logger.info(`[HOD-AI] Executor registered for tool: ${toolName}`);
  }

  /**
   * Execute a tool with the given context and arguments.
   *
   * This method:
   * 1. Validates the tool name exists
   * 2. Validates arguments against the tool's Zod schema
   * 3. Checks authorization (role + department + college)
   * 4. Invokes the executor
   * 5. Returns a sanitized result
   *
   * @param toolName - Canonical tool name
   * @param context  - Trusted HOD context (from authentication)
   * @param rawArgs  - Raw arguments (will be validated)
   */
  async executeTool(
    toolName: string,
    context: HODAIContext,
    rawArgs: Record<string, unknown>,
  ): Promise<ToolExecutionResult> {
    // 1. Tool existence check
    const definition = this.definitions.get(toolName);
    if (!definition) {
      return {
        success: false,
        data: null,
        error: `Tool '${toolName}' is not registered. Available tools: ${this.getToolNames().join(', ')}`,
      };
    }

    // 2. Authorization check
    const authResult = this.checkAuthorization(context, definition);
    if (!authResult.authorized) {
      return {
        success: false,
        data: null,
        error: authResult.reason,
      };
    }

    // 3. Argument validation via Zod
    const argSchema = toolArgSchemas[toolName];
    let validatedArgs = rawArgs;
    if (argSchema) {
      const parseResult = argSchema.safeParse(rawArgs);
      if (!parseResult.success) {
        const errors = parseResult.error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join('; ');
        return {
          success: false,
          data: null,
          error: `Invalid arguments for tool '${toolName}': ${errors}`,
        };
      }
      validatedArgs = parseResult.data as Record<string, unknown>;
    }

    // 4. Execute
    const executor = this.executors.get(toolName)!;
    const startTime = Date.now();
    try {
      const result = await executor(context, validatedArgs);
      const duration = Date.now() - startTime;
      logger.debug(`[HOD-AI] Tool '${toolName}' executed in ${duration}ms`, {
        success: result.success,
      });
      return result;
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`[HOD-AI] Tool '${toolName}' execution failed after ${duration}ms`, {
        error: message,
      });
      // Never expose internal error details
      return {
        success: false,
        data: null,
        error: `Tool '${toolName}' encountered an internal error. Please try again.`,
      };
    }
  }

  /**
   * Check if the HOD context satisfies the tool's authorization requirements.
   */
  private checkAuthorization(
    context: HODAIContext,
    definition: HODAIToolDefinition,
  ): { authorized: boolean; reason?: string } {
    const { authorization } = definition;

    // Role check
    if (!authorization.roles.includes(context.role)) {
      return {
        authorized: false,
        reason: `Role '${context.role}' is not authorized to use tool '${definition.name}'`,
      };
    }

    // Department check
    if (authorization.requiresDepartment && !context.departmentId) {
      return {
        authorized: false,
        reason: `Tool '${definition.name}' requires a department assignment`,
      };
    }

    // College check
    if (authorization.requiresCollege && !context.collegeId) {
      return {
        authorized: false,
        reason: `Tool '${definition.name}' requires a college assignment`,
      };
    }

    return { authorized: true };
  }
}

// ─── Singleton export ────────────────────────────────────────────────

/**
 * The global HOD AI tool registry singleton.
 *
 * Import paths:
 *   import { toolRegistry } from '../modules/hod-ai/hod-ai.tool-registry';
 */
export const toolRegistry = new HODAIToolRegistry();
