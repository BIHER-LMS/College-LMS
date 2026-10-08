import type { HODContext } from '../middleware/authMiddleware';

/**
 * ============================================================================
 * Canonical HOD AI Tool Names
 * ============================================================================
 * Strictly defined per 01_Abhinav_HOD_AI_Orchestrator_implementation_plan.md.
 * No variant names or drift permitted.
 */
export const HOD_TOOL_NAMES = [
  'hod.getAttendanceSummary',
  'hod.getStudentAttendance',
  'hod.getClassAttendance',
  'hod.getDepartmentAttendance',
  'hod.getAttendanceAnalytics',
  'hod.searchKnowledge',
  'hod.getKnowledgeContext',
] as const;

export type HodToolName = (typeof HOD_TOOL_NAMES)[number];

export function isHodToolName(name: string): name is HodToolName {
  return (HOD_TOOL_NAMES as readonly string[]).includes(name);
}

/**
 * ============================================================================
 * Chat Request & Response Types
 * ============================================================================
 */

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type ToolChoiceOption =
  | 'auto'
  | 'none'
  | { type: 'tool'; name: HodToolName };

export interface HodChatRequest {
  message: string;
  history?: ChatMessage[];
  toolChoice?: ToolChoiceOption;
}

export interface ToolExecutionResult<T = any> {
  toolName: HodToolName;
  arguments: Record<string, any>;
  status: 'success' | 'error';
  result?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  executionDurationMs: number;
}

export interface HodChatResponseData {
  message: string;
  toolsExecuted: ToolExecutionResult[];
  metadata: {
    departmentId: string;
    collegeId: string;
    timestamp: string;
    model: string;
  };
}

/**
 * ============================================================================
 * Tool 1: hod.getAttendanceSummary
 * ============================================================================
 */
export interface HodAttendanceSummaryInput {
  batchId?: string;
  classId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CohortAttendanceSummary {
  cohortName: string;
  batchId: string;
  percentage: number;
  studentCount: number;
  isAlert: boolean;
}

export interface HodAttendanceSummaryOutput {
  departmentId: string;
  departmentAverage: number;
  totalStudents: number;
  totalClasses: number;
  cohorts: CohortAttendanceSummary[];
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  _isStub?: boolean;
}

/**
 * ============================================================================
 * Tool 2: hod.getStudentAttendance
 * ============================================================================
 */
export interface HodStudentAttendanceInput {
  studentId: string;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
}

export interface SubjectAttendanceItem {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  percentage: number;
  attended: number;
  total: number;
}

export interface HodStudentAttendanceOutput {
  studentId: string;
  studentName: string;
  registerNumber: string;
  classId: string;
  className: string;
  overallPercentage: number;
  isLowAttendance: boolean;
  totalSessions: number;
  attendedSessions: number;
  subjects: SubjectAttendanceItem[];
  _isStub?: boolean;
}

/**
 * ============================================================================
 * Tool 3: hod.getClassAttendance
 * ============================================================================
 */
export interface HodClassAttendanceInput {
  classId: string;
  startDate?: string;
  endDate?: string;
}

export interface AtRiskStudentItem {
  studentId: string;
  studentName: string;
  registerNumber: string;
  percentage: number;
}

export interface HodClassAttendanceOutput {
  classId: string;
  className: string;
  batch: string;
  section: string;
  classInchargeName: string | null;
  averagePercentage: number;
  totalStudents: number;
  presentTodayCount: number | null;
  atRiskStudentsCount: number;
  atRiskStudents: AtRiskStudentItem[];
  _isStub?: boolean;
}

/**
 * ============================================================================
 * Tool 4: hod.getDepartmentAttendance
 * ============================================================================
 */
export interface HodDepartmentAttendanceInput {
  startDate?: string;
  endDate?: string;
  filterBy?: 'all' | 'at_risk' | 'low_attendance';
}

export interface ClassAttendanceSummaryItem {
  classId: string;
  className: string;
  averagePercentage: number;
  studentCount: number;
  atRiskCount: number;
}

export interface HodDepartmentAttendanceOutput {
  departmentId: string;
  departmentName: string;
  overallPercentage: number;
  totalClasses: number;
  totalStudents: number;
  atRiskCount: number;
  classes: ClassAttendanceSummaryItem[];
  _isStub?: boolean;
}

/**
 * ============================================================================
 * Tool 5: hod.getAttendanceAnalytics
 * ============================================================================
 */
export interface HodAttendanceAnalyticsInput {
  timeframe?: 'week' | 'month' | 'semester' | 'academic_year';
  metric?: 'trends' | 'defaulters' | 'subject_breakdown' | 'distribution';
}

export interface AttendanceTrendPoint {
  period: string;
  percentage: number;
  sessionsHeld: number;
}

export interface DefaulterBuckets {
  below65: number;
  between65And75: number;
  above75: number;
}

export interface HodAttendanceAnalyticsOutput {
  timeframe: 'week' | 'month' | 'semester' | 'academic_year';
  metric: 'trends' | 'defaulters' | 'subject_breakdown' | 'distribution';
  trends: AttendanceTrendPoint[];
  defaulterBuckets: DefaulterBuckets;
  insights: string[];
  _isStub?: boolean;
}

/**
 * ============================================================================
 * Tool 6: hod.searchKnowledge
 * ============================================================================
 */
export interface HodSearchKnowledgeInput {
  query: string;
  category?: 'policy' | 'curriculum' | 'handbook' | 'general';
  limit?: number;
}

export interface KnowledgeSearchResultItem {
  documentId: string;
  title: string;
  category: string;
  snippet: string;
  score: number;
  url?: string;
}

export interface HodSearchKnowledgeOutput {
  query: string;
  resultsCount: number;
  results: KnowledgeSearchResultItem[];
  _isStub?: boolean;
}

/**
 * ============================================================================
 * Tool 7: hod.getKnowledgeContext
 * ============================================================================
 */
export interface HodGetKnowledgeContextInput {
  documentId: string;
  section?: string;
}

export interface HodGetKnowledgeContextOutput {
  documentId: string;
  title: string;
  section: string | null;
  content: string;
  lastUpdated: string;
  metadata: Record<string, any>;
  _isStub?: boolean;
}

/**
 * ============================================================================
 * Tool Handler & Tool Definition Signatures
 * ============================================================================
 */

export type ToolHandler<TInput, TOutput> = (
  input: TInput,
  context: HODContext,
) => Promise<TOutput>;

export interface ToolMetadata {
  name: HodToolName;
  description: string;
  parameterDescription: string;
  requiredRole: 'HOD';
  owner: 'VARUN' | 'HARINI';
}

export interface HodToolDefinition<TInput = any, TOutput = any> {
  name: HodToolName;
  metadata: ToolMetadata;
  execute: ToolHandler<TInput, TOutput>;
}
