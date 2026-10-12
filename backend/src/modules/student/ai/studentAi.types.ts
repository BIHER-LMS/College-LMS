import { StudentContext } from '../student.types';

export { StudentContext };

/**
 * The 14 Canonical Student Chatbot Tools
 * 12 Deterministic Data Tools + 2 Grounded RAG Knowledge Tools
 */
export const STUDENT_TOOL_NAMES = [
  'student.getDashboard',
  'student.getProfile',
  'student.getClass',
  'student.getBatch',
  'student.getProgram',
  'student.getDepartment',
  'student.getSubjects',
  'student.getClassIncharge',
  'student.getAcademicYears',
  'student.getSemesters',
  'student.getTimetable',
  'student.getAttendance',
  'student.searchKnowledge',
  'student.getKnowledgeContext',
] as const;

export type StudentToolName = (typeof STUDENT_TOOL_NAMES)[number];

export function isStudentToolName(name: string): name is StudentToolName {
  return (STUDENT_TOOL_NAMES as readonly string[]).includes(name);
}

export type ToolCategory = 'data' | 'rag';

export interface ToolParameterDefinition {
  name: string;
  type: string;
  description: string;
  required: boolean;
  enum?: string[];
  default?: any;
}

export interface CanonicalToolDefinition {
  name: StudentToolName;
  category: ToolCategory;
  description: string;
  parameters: ToolParameterDefinition[];
  handler: (args: any, context: StudentContext) => Promise<any>;
}

export interface ToolExecutionResult {
  toolName: StudentToolName;
  status: 'success' | 'error';
  args: Record<string, any>;
  result?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  durationMs: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolsExecuted?: ToolExecutionResult[];
}

export interface StudentChatRequest {
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  toolChoice?: 'auto' | 'none' | StudentToolName;
  directToolArgs?: Record<string, any>;
}

export interface StudentChatResponseData {
  reply: string;
  messageId: string;
  toolsExecuted: ToolExecutionResult[];
  confidence: number;
  processingTimeMs: number;
  provider: 'groq' | 'local';
}

export interface DirectToolExecutionRequest {
  toolName: StudentToolName;
  args: Record<string, any>;
}
