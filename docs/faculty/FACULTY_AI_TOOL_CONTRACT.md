# Faculty AI Tool Contract & API Specification

**Author:** Tushar (Step 1 of 5)  
**Target Consumers:** Ashik (Step 2 - Data Tools), Jeresh (Step 3 - RAG), Kishore (Step 4 - UI), Aravind (Step 5 - QA/Integration)  
**Status:** CANONICAL & FROZEN  
**Current Branch:** `feature/faculty-ai-orchestrator`  
**Handoff Branch for Ashik:** `feature/faculty-tools`  

---

## 1. System Overview & Architecture

The Faculty AI Assistant serves academic faculty members and designated class in-charges across academic scheduling, class student rosters, attendance tracking, reminders, departmental data, subject performance, and institutional policy lookups.

```text
HTTP Request (POST /api/faculty/chat or POST /api/faculty/ai/chat)
  ├── 1. Firebase Authentication (`facultyAuthMiddleware`)
  │      └── Verifies Bearer Firebase ID token; resolves verified UID & authed_user profile
  ├── 2. Faculty Authorization (`requireFaculty`)
  │      └── Enforces role in ['FACULTY', 'HOD', 'ADMIN', 'COLLEGE_ADMIN', 'SUPER_ADMIN']
  │      └── Verifies active approval status ('APPROVED' / 'ACTIVE') and active department
  │      └── Attaches trusted `req.facultyUser: AuthenticatedUserContext`
  ├── 3. Zod Request Validation (`validate(facultyChatRequestSchema)`)
  │      └── Validates message presence, length, chat history, and tool choice
  ├── 4. Faculty AI Orchestrator (`facultyAiOrchestratorService`)
  │      └── Sanitizes input & screens prompt injection attempts
  │      └── Converts `req.facultyUser` to trusted `FacultyContext`
  │      └── Detects tool intent or honors explicit tool choice
  ├── 5. Canonical Tool Registry (`facultyToolRegistry`)
  │      └── Validates tool name against canonical 19-tool frozen whitelist
  │      └── Enforces tenant boundaries (strips client-supplied uid, collegeId, departmentId)
  │      └── Validates arguments against input Zod schema
  │      └── Executes registered tool handler (stubs in Step 1; live implementations in Step 2 & 3)
  │      └── Validates outputs against output Zod schema
  │      └── Captures structured results & execution timing
  └── 6. Executive Response Synthesis (`synthesizeResponse`)
         └── Formats professional markdown response with structured metrics
         └── Returns standardized JSON payload via `sendSuccess`
```

---

## 2. API Contract

### Primary Chat Endpoints
- **Endpoints:**
  - `POST /api/faculty/chat` (Primary Faculty Chat route)
  - `POST /api/faculty/ai/chat` (Sub-router AI chat route)
- **Authentication:** Bearer Firebase ID Token (`Authorization: Bearer <ID_TOKEN>`)
- **Authorization Roles:** `FACULTY`, `HOD`, `ADMIN`, `COLLEGE_ADMIN`, `SUPER_ADMIN`
- **Content-Type:** `application/json`

#### Request Payload
```typescript
interface FacultyChatRequest {
  message: string; // Required, 1-2000 characters
  history?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string; // 1-5000 characters
  }>; // Max 30 messages
  toolChoice?: 'auto' | 'none' | { type: 'tool'; name: FacultyToolName };
}
```

#### Response Payload (HTTP 200)
```typescript
interface ApiResponse<FacultyChatResponseData> {
  success: true;
  data: {
    message: string;
    toolsExecuted: Array<{
      toolName: FacultyToolName;
      arguments: Record<string, any>;
      status: 'success' | 'error';
      result?: any;
      error?: {
        code: string;
        message: string;
        details?: any;
      };
      executionDurationMs: number;
    }>;
    metadata: {
      facultyUid: string;
      departmentId: string;
      collegeId: string;
      timestamp: string;
      model: string;
    };
  };
}
```

### Auxiliary AI Endpoints
- `GET /api/faculty/ai/tools`: Returns the list and metadata of all 19 canonical tools.
- `POST /api/faculty/ai/tools/execute`: Direct controlled tool execution for debugging and headless evaluation.
  - Body: `{ toolName: FacultyToolName, arguments?: Record<string, any> }`

---

## 3. Trusted Security Context (`FacultyContext`)

Client arguments must never be trusted for identity or isolation:
```typescript
export interface FacultyContext {
  uid: string;           // Verified Firebase UID from token
  email: string;         // Verified email
  role: string;          // Role (FACULTY, HOD, ADMIN)
  departmentId: string;  // Verified department ID from database
  collegeId: string;     // Verified tenant college ID from database
  displayName?: string | null;
  photoUrl?: string | null;
}
```

---

## 4. Canonical Tool Registry & Dynamic Registration Hook

All 19 tools are managed by `FacultyToolRegistry` (`backend/src/modules/faculty/ai/toolRegistry.ts`).

### Dynamic Registration Hook for Subsequent Developers
Ashik (Step 2) and Jeresh (Step 3) will plug in live implementations using:
```typescript
import { facultyToolRegistry } from '../modules/faculty/ai';

facultyToolRegistry.registerToolHandler(
  'faculty.getAssignedClasses',
  async (input, context) => {
    // Call existing FacultyService or FacultyRepository
    return await facultyService.getAssignedClasses(context.uid);
  }
);
```

---

## 5. The 19 Canonical Faculty Tools Contract

### 1. `faculty.getDashboard`
- **Description:** Retrieve faculty dashboard summary: profile, stats, assigned classes, today's schedule, and pending reminders.
- **Input:** `{}`
- **Output:**
  ```typescript
  {
    faculty: {
      uid: string;
      name: string;
      email: string;
      phone?: string;
      employeeId?: string;
      designation?: string;
      departmentName?: string;
    };
    stats: {
      totalClasses: number;
      totalStudents: number;
      pendingAttendanceCount: number;
      todayScheduleCount: number;
      remindersCount: number;
    };
    assignedClasses: Array<{
      id: string;
      name: string;
      section: string;
      studentCount: number;
      isClassIncharge: boolean;
    }>;
    todaySchedule: Array<{
      id: string;
      dayOfWeek: string;
      periodNumber: number;
      startTime: string;
      endTime: string;
      subjectName: string;
      subjectCode: string;
      className: string;
      roomNumber?: string;
    }>;
    pendingReminders: Array<{
      id: string;
      title: string;
      reminderDate: string;
      isCompleted: boolean;
      priority: string;
    }>;
  }
  ```
- **Existing Service Mapping:** `FacultyService.getDashboard(facultyUid)`

### 2. `faculty.getAssignedClasses`
- **Description:** List all classes assigned to the authenticated faculty member.
- **Input:** `{}`
- **Output:**
  ```typescript
  {
    classes: Array<{
      id: string;
      name: string;
      section: string;
      batch: string;
      program: string;
      department: string;
      academicYear: string;
      currentSemester: number;
      studentCount: number;
      isClassIncharge: boolean;
      isActive: boolean;
      inchargeFaculty?: { uid: string; name: string; email: string };
    }>;
    total: number;
  }
  ```
- **Existing Service Mapping:** `FacultyService.getAssignedClasses(facultyUid)`

### 3. `faculty.getClassDetails`
- **Description:** Retrieve detailed information for an assigned class.
- **Input:** `{ classId: string }`
- **Output:** Class metadata, academic year, semester, student count, incharge status.
- **Existing Service Mapping:** `FacultyService.getClassDetails(facultyUid, classId)`

### 4. `faculty.getClassStudents`
- **Description:** Retrieve student roster for an assigned class.
- **Input:** `{ classId: string }`
- **Output:** List of enrolled students with roll number, register number, name, and representative status.
- **Existing Service Mapping:** `FacultyService.getClassStudents(facultyUid, classId)`

### 5. `faculty.getStudentDetails`
- **Description:** View student profile and academic details.
- **Input:** `{ studentId: string }`
- **Output:** Student details, class, section, batch, department.
- **Existing Service Mapping:** `FacultyService.getStudentDetails(facultyUid, studentId)`

### 6. `faculty.getStudentAttendance`
- **Description:** Retrieve individual attendance record and percentage for a student.
- **Input:** `{ studentId: string, subjectId?: string, startDate?: string, endDate?: string }`
- **Output:** Overall percentage, attended sessions, total sessions, session history.
- **Existing Service Mapping:** `FacultyService.getAttendanceStats(classId)` / student session queries.

### 7. `faculty.getClassAttendanceStats`
- **Description:** Get overall class attendance percentages, subject breakdown, and low attendance alerts (< 75%).
- **Input:** `{ classId: string, subjectId?: string }`
- **Output:** Average attendance percentage, total sessions, subject stats, low attendance students.
- **Existing Service Mapping:** `FacultyService.getClassAttendanceStats(facultyUid, classId)`

### 8. `faculty.getClassAttendanceHistory`
- **Description:** List historical attendance sessions for an assigned class.
- **Input:** `{ classId: string, limit?: number }`
- **Output:** List of recorded sessions with date, period, subject, marked count, present count, absent count.
- **Existing Service Mapping:** `FacultyService.getClassAttendanceHistory(facultyUid, classId)`

### 9. `faculty.getClassTimetable`
- **Description:** View weekly period-wise master schedule for an assigned class.
- **Input:** `{ classId: string }`
- **Output:** Slots categorized by day of week, period number, time, subject, and assigned faculty.
- **Existing Service Mapping:** `FacultyService.getClassTimetable(facultyUid, classId)`

### 10. `faculty.getTimetable`
- **Description:** Retrieve the personal teaching schedule for the authenticated faculty member.
- **Input:** `{ dayOfWeek?: string }`
- **Output:** Slots for each day of week (Monday - Saturday).
- **Existing Service Mapping:** `FacultyService.getTimetable(facultyUid)`

### 11. `faculty.getReminders`
- **Description:** Retrieve personal reminders and tasks.
- **Input:** `{ status?: 'pending' | 'completed' | 'all', date?: string }`
- **Output:** Reminders with status, priority, due date.
- **Existing Service Mapping:** `FacultyService.getReminders(facultyUid)`

### 12. `faculty.search`
- **Description:** Search across assigned classes, students, subjects, and reminders.
- **Input:** `{ query: string }`
- **Output:** Matching classes, students, subjects, reminders.
- **Existing Service Mapping:** `FacultyService.search(facultyUid, query)`

### 13. `faculty.getDepartment`
- **Description:** Retrieve department profile, HOD name, active programs, and subject counts.
- **Input:** `{ departmentId?: string }`
- **Output:** Department name, code, HOD name, programs, subject count.
- **Existing Service Mapping:** `FacultyService.getDepartment(facultyUid)`

### 14. `faculty.getSubjects`
- **Description:** List active subjects in the faculty's department.
- **Input:** `{ semesterNumber?: number }`
- **Output:** List of subjects with code, name, credits, semester.
- **Existing Service Mapping:** `FacultyService.getSubjects(facultyUid, semester)`

### 15. `faculty.getAcademicYears`
- **Description:** List institution academic years and terms.
- **Input:** `{}`
- **Output:** Academic years with start/end dates and active flag.
- **Existing Service Mapping:** `FacultyService.getAcademicYears(collegeId)`

### 16. `faculty.getSemesters`
- **Description:** List academic semesters.
- **Input:** `{ academicYearId?: string }`
- **Output:** Semesters with number, term type (ODD/EVEN), active flag.
- **Existing Service Mapping:** `FacultyService.getSemesters(collegeId, academicYearId)`

### 17. `faculty.getPerformance`
- **Description:** Retrieve class-wise academic performance and subject pass percentages.
- **Input:** `{ subjectId?: string, classId?: string }`
- **Output:** Subject performance, average marks, highest/lowest marks, grade distribution.
- **Existing Service Mapping:** `FacultyService.getMySubjectsPerformance(facultyUid)`

### 18. `faculty.searchKnowledge` (RAG Boundary - Jeresh)
- **Description:** Query academic regulations, faculty handbook, examination bylaws, and evaluation criteria.
- **Input:** `{ query: string, category?: string, topK?: number }`
- **Output:** Relevant document chunks with title, content, score, and citation.
- **Owner:** Jeresh (Step 3).

### 19. `faculty.getKnowledgeContext` (RAG Boundary - Jeresh)
- **Description:** Retrieve authoritative regulatory excerpt for a topic.
- **Input:** `{ topic: string, maxTokens?: number }`
- **Output:** Excerpt, document title, section, effective date.
- **Owner:** Jeresh (Step 3).

---

## 6. Security & Invariant Rules
1. **Never trust client-supplied identity:** Client parameters `uid`, `collegeId`, `departmentId`, and `facultyUid` are unconditionally stripped prior to tool execution.
2. **Deterministic execution for database operations:** Live database queries are executed strictly through TypeScript methods, never via dynamic SQL generation.
3. **No direct RLS bypass from clients:** All operations flow through server-side authenticated controllers.
4. **All tools require valid faculty session:** Non-faculty access receives 403 Forbidden.
