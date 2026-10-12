import { z } from 'zod';
import { STUDENT_TOOL_NAMES, StudentToolName } from './studentAi.types';

// ==========================================
// Tool Arguments Schemas
// ==========================================

export const getDashboardArgsSchema = z.object({}).strict().optional().default({});
export const getProfileArgsSchema = z.object({}).strict().optional().default({});
export const getClassArgsSchema = z.object({}).strict().optional().default({});
export const getBatchArgsSchema = z.object({}).strict().optional().default({});
export const getProgramArgsSchema = z.object({}).strict().optional().default({});
export const getDepartmentArgsSchema = z.object({}).strict().optional().default({});

export const getSubjectsArgsSchema = z.object({
  semesterNumber: z.coerce.number().int().min(1).max(12).optional(),
}).strict().default({});

export const getClassInchargeArgsSchema = z.object({}).strict().optional().default({});
export const getAcademicYearsArgsSchema = z.object({}).strict().optional().default({});
export const getSemestersArgsSchema = z.object({}).strict().optional().default({});
export const getTimetableArgsSchema = z.object({}).strict().optional().default({});

export const getAttendanceArgsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD').optional(),
}).strict().default({});

export const searchKnowledgeArgsSchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty').max(300, 'Search query too long'),
  category: z
    .enum(['policy', 'regulation', 'exam', 'handbook', 'general', 'dress_code', 'discipline'])
    .optional()
    .default('general'),
  limit: z.coerce.number().int().min(1).max(20).optional().default(5),
}).strict();

export const getKnowledgeContextArgsSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required').max(100),
  section: z.string().max(100).optional(),
}).strict();

/**
 * Mapping of tool names to their corresponding Zod schemas
 */
export const toolArgumentSchemas: Record<StudentToolName, z.ZodType<any>> = {
  'student.getDashboard': getDashboardArgsSchema,
  'student.getProfile': getProfileArgsSchema,
  'student.getClass': getClassArgsSchema,
  'student.getBatch': getBatchArgsSchema,
  'student.getProgram': getProgramArgsSchema,
  'student.getDepartment': getDepartmentArgsSchema,
  'student.getSubjects': getSubjectsArgsSchema,
  'student.getClassIncharge': getClassInchargeArgsSchema,
  'student.getAcademicYears': getAcademicYearsArgsSchema,
  'student.getSemesters': getSemestersArgsSchema,
  'student.getTimetable': getTimetableArgsSchema,
  'student.getAttendance': getAttendanceArgsSchema,
  'student.searchKnowledge': searchKnowledgeArgsSchema,
  'student.getKnowledgeContext': getKnowledgeContextArgsSchema,
};

// ==========================================
// Chat Request Schemas
// ==========================================

export const studentChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});

export const studentChatRequestBodySchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000, 'Message cannot exceed 2000 characters'),
  conversationHistory: z.array(studentChatMessageSchema).max(20).optional().default([]),
  toolChoice: z
    .union([
      z.enum(['auto', 'none']),
      z.enum(STUDENT_TOOL_NAMES),
    ])
    .optional()
    .default('auto'),
  directToolArgs: z.record(z.any()).optional().default({}),
});

export const studentChatRequestSchema = z.object({
  body: studentChatRequestBodySchema,
});

export const directToolExecutionBodySchema = z.object({
  toolName: z.enum(STUDENT_TOOL_NAMES, {
    errorMap: () => ({ message: 'Invalid tool name. Must be one of the 14 canonical student tools.' }),
  }),
  args: z.record(z.any()).optional().default({}),
});

export const directToolExecutionSchema = z.object({
  body: directToolExecutionBodySchema,
});
