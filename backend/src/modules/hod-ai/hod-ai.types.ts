<<<<<<< Updated upstream
/**
 * HOD AI Orchestrator — Canonical Types
 *
 * These types define the stable contract for the HOD AI chatbot system.
 * Downstream developers (Varun, Harini, Faisal, Adhithi) MUST consume
 * these types exactly. Do NOT create variants.
 *
 * @module hod-ai/types
 * @owner Abhinav
 */

// ─── HOD Context (derived from authentication, never from client) ────

/**
 * Trusted HOD context built from Firebase token + DB lookup.
 * Reuses the existing HODContext from hod_temp/middleware/authMiddleware.ts
 * but re-exported here for AI orchestrator consumers.
 */
export interface HODAIContext {
  /** Firebase UID of the authenticated HOD */
  uid: string;
  /** Verified email from Firebase token */
  email: string;
  /** Display name from authed_users */
  displayName: string | null;
  /** Photo URL from authed_users */
  photoUrl: string | null;
  /** Role (always 'HOD' or 'COLLEGE_ADMIN') */
  role: string;
  /** Department UUID — always present for HOD AI context */
  departmentId: string;
  /** College UUID — always present for HOD AI context */
  collegeId: string;
}

// ─── Chat Request / Response ─────────────────────────────────────────

/**
 * A single message in the conversation history.
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  /** ISO 8601 timestamp */
  timestamp?: string;
}

/**
 * Incoming chat request body (after Zod validation).
 */
export interface HODAIChatRequest {
  /** The user's current message */
  message: string;
  /** Optional conversation history for multi-turn context */
  conversationHistory?: ChatMessage[];
  /** Optional conversation ID for tracking */
  conversationId?: string;
}

/**
 * Tool invocation record included in the response for transparency.
 */
export interface ToolInvocationRecord {
  /** Canonical tool name (e.g. 'hod.getAttendanceSummary') */
  toolName: string;
  /** Input arguments passed to the tool */
  input: Record<string, unknown>;
  /** Whether the tool executed successfully */
  success: boolean;
  /** Error message if the tool failed */
  error?: string;
  /** Execution time in milliseconds */
  durationMs: number;
}

/**
 * Outgoing chat response.
 */
export interface HODAIChatResponse {
  /** The AI-generated response message */
  message: string;
  /** Conversation ID for multi-turn tracking */
  conversationId: string;
  /** Tools that were invoked during this request */
  toolsInvoked: ToolInvocationRecord[];
  /** ISO 8601 timestamp */
  timestamp: string;
}

// ─── Tool Contract ───────────────────────────────────────────────────

/**
 * Authorization requirements for a tool.
 */
export interface ToolAuthorizationRequirement {
  /** Minimum roles that can use this tool */
  roles: string[];
  /** Whether departmentId scoping is required */
  requiresDepartment: boolean;
  /** Whether collegeId scoping is required */
  requiresCollege: boolean;
}

/**
 * A registered HOD AI tool definition.
 * Every tool in the registry MUST conform to this contract.
 */
export interface HODAIToolDefinition {
  /** Canonical tool name (e.g. 'hod.getAttendanceSummary') */
  name: string;
  /** Human-readable purpose description */
  purpose: string;
  /** JSON Schema describing the input parameters */
  inputSchema: Record<string, unknown>;
  /** JSON Schema describing the output shape */
  outputSchema: Record<string, unknown>;
  /** Authorization requirements */
  authorization: ToolAuthorizationRequirement;
  /** Import path for the executor function */
  executorPath: string;
  /** Error behavior description */
  errorBehavior: string;
}

/**
 * The executor function signature that all tool implementations must follow.
 *
 * @param context - The trusted HOD context (from authentication)
 * @param args    - Validated tool arguments (from Zod schema)
 * @returns       - Structured result (never raw SQL/Prisma objects)
 */
export type ToolExecutor = (
  context: HODAIContext,
  args: Record<string, unknown>,
) => Promise<ToolExecutionResult>;

/**
 * Structured result from a tool execution.
 */
export interface ToolExecutionResult {
  success: boolean;
  data: unknown;
  error?: string;
  /** Optional metadata (row count, query info, etc.) */
  metadata?: Record<string, unknown>;
}

// ─── Error Contract ──────────────────────────────────────────────────

/**
 * Safe error codes that the AI orchestrator may return.
 * These are the ONLY error codes the AI chatbot exposes.
 * Internal details (SQL errors, Prisma errors) are NEVER exposed.
 */
export const HODAIErrorCodes = {
  /** Authentication failed or token invalid */
  AUTH_FAILED: 'HOD_AI_AUTH_FAILED',
  /** User does not have HOD/COLLEGE_ADMIN role */
  UNAUTHORIZED_ROLE: 'HOD_AI_UNAUTHORIZED_ROLE',
  /** Request body failed Zod validation */
  INVALID_REQUEST: 'HOD_AI_INVALID_REQUEST',
  /** Requested tool does not exist in the registry */
  TOOL_NOT_FOUND: 'HOD_AI_TOOL_NOT_FOUND',
  /** Tool arguments failed schema validation */
  TOOL_ARGS_INVALID: 'HOD_AI_TOOL_ARGS_INVALID',
  /** Tool execution failed (internal error sanitized) */
  TOOL_EXECUTION_FAILED: 'HOD_AI_TOOL_EXECUTION_FAILED',
  /** AI orchestration error (LLM call failed, etc.) */
  ORCHESTRATION_ERROR: 'HOD_AI_ORCHESTRATION_ERROR',
  /** Rate limit exceeded */
  RATE_LIMITED: 'HOD_AI_RATE_LIMITED',
  /** Generic internal error (details hidden) */
  INTERNAL_ERROR: 'HOD_AI_INTERNAL_ERROR',
} as const;

export type HODAIErrorCode = (typeof HODAIErrorCodes)[keyof typeof HODAIErrorCodes];
=======
import { z } from 'zod';
import { HODContext } from '../hod_temp/middleware/authMiddleware';

// Reusable schema for the AI request
export const AIRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })).optional().default([]),
});

export type AIRequestDTO = z.infer<typeof AIRequestSchema>;

export interface AIToolResponse {
  toolName: string;
  result: any;
  error?: string;
}

export interface AIResponseDTO {
  success: boolean;
  message: string;
  toolsUsed: AIToolResponse[];
}

export type ToolExecutor<T = any> = (input: T, context: HODContext) => Promise<any>;

export interface HODToolConfig<T = any> {
  name: string;
  description: string;
  inputSchema: z.ZodSchema<T>;
  execute: ToolExecutor<T>;
}
>>>>>>> Stashed changes
