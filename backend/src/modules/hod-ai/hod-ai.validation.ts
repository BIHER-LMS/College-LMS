/**
 * HOD AI Orchestrator — Zod Validation Schemas
 *
 * All incoming requests to the HOD AI chatbot are validated here.
 * These schemas are the single source of truth for request shapes.
 *
 * @module hod-ai/validation
 * @owner Abhinav
 */

import { z } from 'zod';

// ─── Chat Request Schema ─────────────────────────────────────────────

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, 'Message content cannot be empty').max(10000),
  timestamp: z.string().datetime().optional(),
});

export const hodAIChatRequestSchema = z.object({
  /** The user's current message — required, 1–2000 chars */
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message cannot exceed 2000 characters')
    .trim(),

  /** Optional conversation history — max 50 messages */
  conversationHistory: z
    .array(chatMessageSchema)
    .max(50, 'Conversation history cannot exceed 50 messages')
    .optional(),

  /** Optional conversation ID for multi-turn tracking */
  conversationId: z
    .string()
    .uuid('conversationId must be a valid UUID')
    .optional(),
}).strict({
  message: 'Unknown fields are not allowed in the chat request',
});

export type ValidatedChatRequest = z.infer<typeof hodAIChatRequestSchema>;

// ─── Tool Argument Schemas ───────────────────────────────────────────
// These are the Zod schemas for each canonical tool's input.
// Varun will implement the actual tool executors; these schemas define
// what arguments are valid.

export const getAttendanceSummaryArgsSchema = z.object({
  /** Optional date range start (ISO date string) */
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  /** Optional date range end (ISO date string) */
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
}).strict().optional().default({});

export const getStudentAttendanceArgsSchema = z.object({
  /** Student UID (Firebase UID from authed_users) */
  studentUid: z.string().min(1, 'studentUid is required'),
  /** Optional date range start */
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  /** Optional date range end */
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
}).strict();

export const getClassAttendanceArgsSchema = z.object({
  /** Class UUID */
  classId: z.string().uuid('classId must be a valid UUID'),
  /** Optional date (ISO date string) */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
}).strict();

export const getDepartmentAttendanceArgsSchema = z.object({
  /** Optional date range start */
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  /** Optional date range end */
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
}).strict().optional().default({});

export const getAttendanceAnalyticsArgsSchema = z.object({
  /** Analysis type */
  type: z.enum(['trend', 'comparison', 'risk']).default('trend'),
  /** Optional period in days for trend analysis */
  periodDays: z.number().int().min(1).max(365).default(30),
  /** Optional class ID filter */
  classId: z.string().uuid('classId must be a valid UUID').optional(),
}).strict().optional().default({});

export const searchKnowledgeArgsSchema = z.object({
  /** Search query string */
  query: z.string().min(1, 'query is required').max(500),
  /** Maximum results to return */
  maxResults: z.number().int().min(1).max(20).default(5),
  /** Optional category filter */
  category: z.enum([
    'attendance',
    'curriculum',
    'academic',
    'policy',
    'general',
  ]).optional(),
}).strict();

export const getKnowledgeContextArgsSchema = z.object({
  /** Knowledge document ID */
  documentId: z.string().min(1, 'documentId is required'),
}).strict();

/**
 * Map of canonical tool names to their argument validation schemas.
 * This is used by the orchestrator to validate tool arguments before execution.
 */
export const toolArgSchemas: Record<string, z.ZodSchema> = {
  'hod.getAttendanceSummary': getAttendanceSummaryArgsSchema,
  'hod.getStudentAttendance': getStudentAttendanceArgsSchema,
  'hod.getClassAttendance': getClassAttendanceArgsSchema,
  'hod.getDepartmentAttendance': getDepartmentAttendanceArgsSchema,
  'hod.getAttendanceAnalytics': getAttendanceAnalyticsArgsSchema,
  'hod.searchKnowledge': searchKnowledgeArgsSchema,
  'hod.getKnowledgeContext': getKnowledgeContextArgsSchema,
};
