/**
 * Faculty AI Chat & Tool Response Types (Frontend)
 * Conforms to canonical backend contract established in Step 1 (Tushar),
 * Step 2 (Ashik), and Step 3 (Jeresh).
 */

export interface ToolExecuted {
  toolName: string;
  arguments: Record<string, any>;
  status: 'success' | 'error';
  result?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  executionDurationMs: number;
}

export interface FacultyChatMetadata {
  facultyUid: string;
  departmentId: string;
  collegeId: string;
  timestamp: string;
  model: string;
}

export interface FacultyChatResponseData {
  message: string;
  toolsExecuted: ToolExecuted[];
  metadata: FacultyChatMetadata;
}

export interface FacultyChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolsExecuted?: ToolExecuted[];
  error?: boolean;
  isOptimistic?: boolean;
}

export interface FacultyChatRequest {
  message: string;
  history?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  toolChoice?: 'auto' | 'none' | { type: 'tool'; name: string };
}

// ---------------------------------------------------------------------------
// Structured Tool Result Interfaces for Rich UI Cards
// ---------------------------------------------------------------------------

export interface KnowledgeSearchResultItem {
  id: string;
  title: string;
  snippet: string;
  score: number;
  category: string;
  sourceUrl?: string;
}

export interface KnowledgeSearchResult {
  query: string;
  results: KnowledgeSearchResultItem[];
  totalMatches: number;
  _isStub?: boolean;
}

export interface KnowledgeContextResult {
  topic: string;
  contextText: string;
  citations: string[];
  lastUpdated: string;
  _isStub?: boolean;
}

export interface ClassAttendanceStatsResult {
  classId: string;
  className: string;
  totalStudents: number;
  averageAttendancePercentage: number;
  totalSessionsConducted: number;
  defaultersCount: number;
  goodAttendanceCount: number;
  _isStub?: boolean;
}

export interface AssignedClassItem {
  id: string;
  name: string;
  batch: string | null;
  program: string | null;
  department: string | null;
  currentSemester: number | null;
  isActive: boolean;
  inchargeFaculty: {
    uid: string;
    name: string;
  };
  studentCount: number;
}

export interface AssignedClassesResult {
  classes: AssignedClassItem[];
  total: number;
  _isStub?: boolean;
}

export interface ClassStudentItem {
  uid: string;
  name: string;
  registerNumber: string | null;
  email: string;
  phone: string | null;
  parentPhone: string | null;
  profilePhoto: string | null;
  accountStatus: string;
  isClassRep: boolean;
  attendancePercentage: number | null;
  performanceGrade: string | null;
  performanceScore: number | null;
}

export interface ClassStudentsResult {
  classId: string;
  students: ClassStudentItem[];
  total: number;
  _isStub?: boolean;
}

export interface TimetableSlotItem {
  id: string;
  dayOfWeek: number;
  period: number;
  startTime: string;
  endTime: string;
  subjectName: string;
  subjectCode: string;
  className?: string;
  classId?: string;
  facultyName?: string;
  roomNumber: string | null;
}

export interface TimetableResult {
  facultyUid?: string;
  classId?: string;
  slots?: TimetableSlotItem[];
  timetable?: TimetableSlotItem[];
  totalSlots: number;
  _isStub?: boolean;
}

export interface ReminderItem {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  dueTime: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'COMPLETED';
  type: string;
}

export interface RemindersResult {
  reminders: ReminderItem[];
  total: number;
  pendingCount: number;
  _isStub?: boolean;
}

export interface PerformanceItem {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  classId: string;
  className: string;
  averageScore: number;
  passPercentage: number;
  totalStudents: number;
  highestScore: number;
  lowestScore: number;
}

export interface PerformanceResult {
  performances: PerformanceItem[];
  total: number;
  _isStub?: boolean;
}
