/**
 * HOD AI Orchestrator — Module Barrel Export
 *
 * Import everything you need from this single entry point:
 *
 *   import { toolRegistry, hodAIOrchestrator, hodAIController } from '../modules/hod-ai';
 *   import type { HODAIContext, HODAIToolDefinition, ... } from '../modules/hod-ai';
 *
 * @module hod-ai
 * @owner Abhinav
 */

// Types
export type {
  HODAIContext,
  HODAIChatRequest,
  HODAIChatResponse,
  ChatMessage,
  ToolInvocationRecord,
  HODAIToolDefinition,
  ToolExecutor,
  ToolExecutionResult,
  ToolAuthorizationRequirement,
  HODAIErrorCode,
} from './hod-ai.types';

export { HODAIErrorCodes } from './hod-ai.types';

// Validation
export {
  hodAIChatRequestSchema,
  chatMessageSchema,
  toolArgSchemas,
  getAttendanceSummaryArgsSchema,
  getStudentAttendanceArgsSchema,
  getClassAttendanceArgsSchema,
  getDepartmentAttendanceArgsSchema,
  getAttendanceAnalyticsArgsSchema,
  searchKnowledgeArgsSchema,
  getKnowledgeContextArgsSchema,
} from './hod-ai.validation';

// Tool Registry
export { toolRegistry } from './hod-ai.tool-registry';

// Orchestrator
export { hodAIOrchestrator } from './hod-ai.orchestrator';

// Controller
export { hodAIController } from './hod-ai.controller';

// Routes
export { default as hodAIRoutes } from './hod-ai.routes';
