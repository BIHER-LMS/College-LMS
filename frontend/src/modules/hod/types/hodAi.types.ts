/**
 * ============================================================================
 * HOD AI Module - Canonical TypeScript Types & Contracts
 * ============================================================================
 * Strictly consumes the backend contract defined in:
 * - docs/hod/HOD_AI_TOOL_CONTRACT.md
 * - docs/hod/HANDOFF_03_HARINI_TO_FAISAL.md
 * - backend/src/modules/hod_temp/ai/hodAi.types.ts
 *
 * Owner: Faisal (Step 4)
 * ============================================================================
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

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessagePayload {
  role: ChatRole;
  content: string;
}

export type ToolChoiceOption =
  | 'auto'
  | 'none'
  | { type: 'tool'; name: HodToolName };

export interface HodChatRequest {
  message: string;
  history?: ChatMessagePayload[];
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

export interface HodChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  toolsExecuted?: ToolExecutionResult[];
  error?: boolean;
  errorMessage?: string;
  metadata?: {
    departmentId?: string;
    collegeId?: string;
    timestamp?: string;
    model?: string;
  };
}

// ----------------------------------------------------------------------------
// Tool 1: hod.getAttendanceSummary
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// Tool 2: hod.getStudentAttendance
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// Tool 3: hod.getClassAttendance
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// Tool 4: hod.getDepartmentAttendance
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// Tool 5: hod.getAttendanceAnalytics
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// Tool 6: hod.searchKnowledge (RAG Search)
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// Tool 7: hod.getKnowledgeContext (Grounded Clause / Document)
// ----------------------------------------------------------------------------
export interface HodGetKnowledgeContextOutput {
  documentId: string;
  title: string;
  section: string | null;
  content: string;
  lastUpdated: string;
  metadata: {
    category?: string;
    citations?: string[];
    sourceUrl?: string;
    collegeScoped?: boolean;
    departmentScoped?: boolean;
    [key: string]: any;
  };
  _isStub?: boolean;
}

// ----------------------------------------------------------------------------
// Tool Catalog Metadata
// ----------------------------------------------------------------------------
export interface ToolMetadata {
  name: HodToolName;
  description: string;
  parameterDescription: string;
  requiredRole: string;
  owner: string;
}
