import { z } from 'zod';
import { HOD_TOOL_NAMES } from './hodAi.types';

/**
 * ============================================================================
 * Chat Request & Message Validation Schemas
 * ============================================================================
 */

export const chatRoleSchema = z.enum(['user', 'assistant', 'system']);

export const chatMessageSchema = z.object({
  role: chatRoleSchema,
  content: z
    .string()
    .trim()
    .min(1, 'Message content cannot be empty')
    .max(5000, 'Message content cannot exceed 5000 characters'),
});

export const toolChoiceSchema = z.union([
  z.literal('auto'),
  z.literal('none'),
  z.object({
    type: z.literal('tool'),
    name: z.enum(HOD_TOOL_NAMES),
  }),
]);

export const hodChatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Message is required and cannot be empty')
    .max(2000, 'Message cannot exceed 2000 characters'),
  history: z
    .array(chatMessageSchema)
    .max(30, 'Conversation history cannot exceed 30 messages')
    .optional()
    .default([]),
  toolChoice: toolChoiceSchema.optional().default('auto'),
});

/**
 * ============================================================================
 * Tool 1: hod.getAttendanceSummary Schemas
 * ============================================================================
 */
export const dateIsoRegex = /^\d{4}-\d{2}-\d{2}$/;

export const hodAttendanceSummaryInputSchema = z.object({
  batchId: z.string().trim().min(1).optional(),
  classId: z.string().trim().min(1).optional(),
  startDate: z
    .string()
    .regex(dateIsoRegex, 'startDate must be in YYYY-MM-DD format')
    .optional(),
  endDate: z
    .string()
    .regex(dateIsoRegex, 'endDate must be in YYYY-MM-DD format')
    .optional(),
});

export const cohortAttendanceSummarySchema = z.object({
  cohortName: z.string(),
  batchId: z.string(),
  percentage: z.number().min(0).max(100),
  studentCount: z.number().nonnegative(),
  isAlert: z.boolean(),
});

export const hodAttendanceSummaryOutputSchema = z.object({
  departmentId: z.string(),
  departmentAverage: z.number().min(0).max(100),
  totalStudents: z.number().nonnegative(),
  totalClasses: z.number().nonnegative(),
  cohorts: z.array(cohortAttendanceSummarySchema),
  dateRange: z.object({
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
  }),
  _isStub: z.boolean().optional(),
});

/**
 * ============================================================================
 * Tool 2: hod.getStudentAttendance Schemas
 * ============================================================================
 */
export const hodStudentAttendanceInputSchema = z.object({
  studentId: z.string().trim().min(1, 'studentId is required'),
  subjectId: z.string().trim().min(1).optional(),
  startDate: z
    .string()
    .regex(dateIsoRegex, 'startDate must be in YYYY-MM-DD format')
    .optional(),
  endDate: z
    .string()
    .regex(dateIsoRegex, 'endDate must be in YYYY-MM-DD format')
    .optional(),
});

export const subjectAttendanceItemSchema = z.object({
  subjectId: z.string(),
  subjectCode: z.string(),
  subjectName: z.string(),
  percentage: z.number().min(0).max(100),
  attended: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

export const hodStudentAttendanceOutputSchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  registerNumber: z.string(),
  classId: z.string(),
  className: z.string(),
  overallPercentage: z.number().min(0).max(100),
  isLowAttendance: z.boolean(),
  totalSessions: z.number().nonnegative(),
  attendedSessions: z.number().nonnegative(),
  subjects: z.array(subjectAttendanceItemSchema),
  _isStub: z.boolean().optional(),
});

/**
 * ============================================================================
 * Tool 3: hod.getClassAttendance Schemas
 * ============================================================================
 */
export const hodClassAttendanceInputSchema = z.object({
  classId: z.string().trim().min(1, 'classId is required'),
  startDate: z
    .string()
    .regex(dateIsoRegex, 'startDate must be in YYYY-MM-DD format')
    .optional(),
  endDate: z
    .string()
    .regex(dateIsoRegex, 'endDate must be in YYYY-MM-DD format')
    .optional(),
});

export const atRiskStudentItemSchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  registerNumber: z.string(),
  percentage: z.number().min(0).max(100),
});

export const hodClassAttendanceOutputSchema = z.object({
  classId: z.string(),
  className: z.string(),
  batch: z.string(),
  section: z.string(),
  classInchargeName: z.string().nullable(),
  averagePercentage: z.number().min(0).max(100),
  totalStudents: z.number().nonnegative(),
  presentTodayCount: z.number().nullable(),
  atRiskStudentsCount: z.number().nonnegative(),
  atRiskStudents: z.array(atRiskStudentItemSchema),
  _isStub: z.boolean().optional(),
});

/**
 * ============================================================================
 * Tool 4: hod.getDepartmentAttendance Schemas
 * ============================================================================
 */
export const hodDepartmentAttendanceInputSchema = z.object({
  startDate: z
    .string()
    .regex(dateIsoRegex, 'startDate must be in YYYY-MM-DD format')
    .optional(),
  endDate: z
    .string()
    .regex(dateIsoRegex, 'endDate must be in YYYY-MM-DD format')
    .optional(),
  filterBy: z.enum(['all', 'at_risk', 'low_attendance']).optional().default('all'),
});

export const classAttendanceSummaryItemSchema = z.object({
  classId: z.string(),
  className: z.string(),
  averagePercentage: z.number().min(0).max(100),
  studentCount: z.number().nonnegative(),
  atRiskCount: z.number().nonnegative(),
});

export const hodDepartmentAttendanceOutputSchema = z.object({
  departmentId: z.string(),
  departmentName: z.string(),
  overallPercentage: z.number().min(0).max(100),
  totalClasses: z.number().nonnegative(),
  totalStudents: z.number().nonnegative(),
  atRiskCount: z.number().nonnegative(),
  classes: z.array(classAttendanceSummaryItemSchema),
  _isStub: z.boolean().optional(),
});

/**
 * ============================================================================
 * Tool 5: hod.getAttendanceAnalytics Schemas
 * ============================================================================
 */
export const hodAttendanceAnalyticsInputSchema = z.object({
  timeframe: z
    .enum(['week', 'month', 'semester', 'academic_year'])
    .optional()
    .default('semester'),
  metric: z
    .enum(['trends', 'defaulters', 'subject_breakdown', 'distribution'])
    .optional()
    .default('trends'),
});

export const attendanceTrendPointSchema = z.object({
  period: z.string(),
  percentage: z.number().min(0).max(100),
  sessionsHeld: z.number().nonnegative(),
});

export const defaulterBucketsSchema = z.object({
  below65: z.number().nonnegative(),
  between65And75: z.number().nonnegative(),
  above75: z.number().nonnegative(),
});

export const hodAttendanceAnalyticsOutputSchema = z.object({
  timeframe: z.enum(['week', 'month', 'semester', 'academic_year']),
  metric: z.enum(['trends', 'defaulters', 'subject_breakdown', 'distribution']),
  trends: z.array(attendanceTrendPointSchema),
  defaulterBuckets: defaulterBucketsSchema,
  insights: z.array(z.string()),
  _isStub: z.boolean().optional(),
});

/**
 * ============================================================================
 * Tool 6: hod.searchKnowledge Schemas
 * ============================================================================
 */
export const hodSearchKnowledgeInputSchema = z.object({
  query: z
    .string()
    .trim()
    .min(2, 'Search query must be at least 2 characters')
    .max(255, 'Search query cannot exceed 255 characters'),
  category: z.enum(['policy', 'curriculum', 'handbook', 'general']).optional(),
  limit: z.number().int().min(1).max(20).optional().default(5),
});

export const knowledgeSearchResultItemSchema = z.object({
  documentId: z.string(),
  title: z.string(),
  category: z.string(),
  snippet: z.string(),
  score: z.number().min(0).max(1),
  url: z.string().optional(),
});

export const hodSearchKnowledgeOutputSchema = z.object({
  query: z.string(),
  resultsCount: z.number().nonnegative(),
  results: z.array(knowledgeSearchResultItemSchema),
  _isStub: z.boolean().optional(),
});

/**
 * ============================================================================
 * Tool 7: hod.getKnowledgeContext Schemas
 * ============================================================================
 */
export const hodGetKnowledgeContextInputSchema = z.object({
  documentId: z.string().trim().min(1, 'documentId is required'),
  section: z.string().trim().min(1).optional(),
});

export const hodGetKnowledgeContextOutputSchema = z.object({
  documentId: z.string(),
  title: z.string(),
  section: z.string().nullable(),
  content: z.string(),
  lastUpdated: z.string(),
  metadata: z.record(z.any()),
  _isStub: z.boolean().optional(),
});

/**
 * ============================================================================
 * Tool Execution Request & Schema Map
 * ============================================================================
 */
export const directToolExecutionSchema = z.object({
  toolName: z.enum(HOD_TOOL_NAMES),
  arguments: z.record(z.any()).optional().default({}),
});

export const TOOL_INPUT_SCHEMAS = {
  'hod.getAttendanceSummary': hodAttendanceSummaryInputSchema,
  'hod.getStudentAttendance': hodStudentAttendanceInputSchema,
  'hod.getClassAttendance': hodClassAttendanceInputSchema,
  'hod.getDepartmentAttendance': hodDepartmentAttendanceInputSchema,
  'hod.getAttendanceAnalytics': hodAttendanceAnalyticsInputSchema,
  'hod.searchKnowledge': hodSearchKnowledgeInputSchema,
  'hod.getKnowledgeContext': hodGetKnowledgeContextInputSchema,
} as const;

export const TOOL_OUTPUT_SCHEMAS = {
  'hod.getAttendanceSummary': hodAttendanceSummaryOutputSchema,
  'hod.getStudentAttendance': hodStudentAttendanceOutputSchema,
  'hod.getClassAttendance': hodClassAttendanceOutputSchema,
  'hod.getDepartmentAttendance': hodDepartmentAttendanceOutputSchema,
  'hod.getAttendanceAnalytics': hodAttendanceAnalyticsOutputSchema,
  'hod.searchKnowledge': hodSearchKnowledgeOutputSchema,
  'hod.getKnowledgeContext': hodGetKnowledgeContextOutputSchema,
} as const;
