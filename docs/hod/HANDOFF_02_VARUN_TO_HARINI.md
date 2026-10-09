# HOD AI Attendance & Analytics Handoff: Varun to Harini

**STATUS:** COMPLETE  
**CURRENT OWNER:** VARUN (Step 2 of 5)  
**NEXT OWNER:** HARINI (Step 3 of 5)  
**BRANCH:** `feature/hod-analytics-tools`  
**NEXT BRANCH FOR HARINI:** `feature/hod-rag`  

---

## 1. WHAT WAS IMPLEMENTED

Varun (Step 2) implemented the 5 deterministic attendance and analytics backend tools matching Abhinav's canonical contract (`HOD_AI_TOOL_CONTRACT.md`), connecting live PostgreSQL/Prisma relations and raw attendance tables, with strict department and college tenant isolation.

Specifically:
1. Created `HodAnalyticsToolService` in `backend/src/modules/hod_temp/services/hodAnalyticsToolService.ts` providing live deterministic calculations for:
   - `hod.getAttendanceSummary` (Tool 1)
   - `hod.getStudentAttendance` (Tool 2)
   - `hod.getClassAttendance` (Tool 3)
   - `hod.getDepartmentAttendance` (Tool 4)
   - `hod.getAttendanceAnalytics` (Tool 5)
2. Registered all 5 live handlers into Abhinav's canonical `hodToolRegistry` via `registerToolHandler`, seamlessly replacing the temporary default stubs while preserving canonical tool names and Zod contracts.
3. Connected live PostgreSQL tables: `attendance_sessions`, `attendance_records` (using the correct foreign key `attendance_session_id`, strictly avoiding `session_id`), `classes`, `batches`, `programs`, `departments`, `subjects`, and `authed_users`.
4. Enforced strict tenant boundaries and authorization checks: All queries and calculations are strictly bound to `context.departmentId` and `context.collegeId`. Cross-department and cross-college queries throw `ForbiddenError`.
5. Automated test suite: Created 24 unit, authorization, tenant isolation, no-data, and API integration tests in `backend/tests/hod-analytics-tools.test.ts`. All 162 backend tests are green across 10 test files. Zero TypeScript compiler errors (`npx tsc --noEmit`).

---

## 2. CANONICAL TOOL CONTRACTS IMPLEMENTED (TOOLS 1–5)

Canonical tool names were **not changed**. The exact names registered in `hodToolRegistry` are:

```text
1. hod.getAttendanceSummary
2. hod.getStudentAttendance
3. hod.getClassAttendance
4. hod.getDepartmentAttendance
5. hod.getAttendanceAnalytics
```

### Tool 1: `hod.getAttendanceSummary`
- **Executor:** `hodAnalyticsToolService.getAttendanceSummary(input, context)`
- **Input Schema:**
  ```typescript
  interface HodAttendanceSummaryInput {
    batchId?: string;
    classId?: string;
    startDate?: string; // YYYY-MM-DD
    endDate?: string;   // YYYY-MM-DD
  }
  ```
- **Output Schema:**
  ```typescript
  interface HodAttendanceSummaryOutput {
    departmentId: string;
    departmentAverage: number;
    totalStudents: number;
    totalClasses: number;
    cohorts: Array<{
      cohortName: string;
      batchId: string;
      percentage: number;
      studentCount: number;
      isAlert: boolean; // true if < 75%
    }>;
    dateRange: {
      startDate: string | null;
      endDate: string | null;
    };
  }
  ```

### Tool 2: `hod.getStudentAttendance`
- **Executor:** `hodAnalyticsToolService.getStudentAttendance(input, context)`
- **Input Schema:**
  ```typescript
  interface HodStudentAttendanceInput {
    studentId: string; // Required (Firebase UID or Register Number)
    subjectId?: string;
    startDate?: string; // YYYY-MM-DD
    endDate?: string;   // YYYY-MM-DD
  }
  ```
- **Output Schema:**
  ```typescript
  interface HodStudentAttendanceOutput {
    studentId: string;
    studentName: string;
    registerNumber: string;
    classId: string;
    className: string;
    overallPercentage: number;
    isLowAttendance: boolean; // true if < 75%
    totalSessions: number;
    attendedSessions: number;
    subjects: Array<{
      subjectId: string;
      subjectCode: string;
      subjectName: string;
      percentage: number;
      attended: number;
      total: number;
    }>;
  }
  ```

### Tool 3: `hod.getClassAttendance`
- **Executor:** `hodAnalyticsToolService.getClassAttendance(input, context)`
- **Input Schema:**
  ```typescript
  interface HodClassAttendanceInput {
    classId: string; // Required
    startDate?: string; // YYYY-MM-DD
    endDate?: string;   // YYYY-MM-DD
  }
  ```
- **Output Schema:**
  ```typescript
  interface HodClassAttendanceOutput {
    classId: string;
    className: string;
    batch: string;
    section: string;
    classInchargeName: string | null;
    averagePercentage: number;
    totalStudents: number;
    presentTodayCount: number | null;
    atRiskStudentsCount: number;
    atRiskStudents: Array<{
      studentId: string;
      studentName: string;
      registerNumber: string;
      percentage: number;
    }>;
  }
  ```

### Tool 4: `hod.getDepartmentAttendance`
- **Executor:** `hodAnalyticsToolService.getDepartmentAttendance(input, context)`
- **Input Schema:**
  ```typescript
  interface HodDepartmentAttendanceInput {
    startDate?: string; // YYYY-MM-DD
    endDate?: string;   // YYYY-MM-DD
    filterBy?: 'all' | 'at_risk' | 'low_attendance'; // Default: 'all'
  }
  ```
- **Output Schema:**
  ```typescript
  interface HodDepartmentAttendanceOutput {
    departmentId: string;
    departmentName: string;
    overallPercentage: number;
    totalClasses: number;
    totalStudents: number;
    atRiskCount: number;
    classes: Array<{
      classId: string;
      className: string;
      averagePercentage: number;
      studentCount: number;
      atRiskCount: number;
    }>;
  }
  ```

### Tool 5: `hod.getAttendanceAnalytics`
- **Executor:** `hodAnalyticsToolService.getAttendanceAnalytics(input, context)`
- **Input Schema:**
  ```typescript
  interface HodAttendanceAnalyticsInput {
    timeframe?: 'week' | 'month' | 'semester' | 'academic_year'; // Default: 'semester'
    metric?: 'trends' | 'defaulters' | 'subject_breakdown' | 'distribution'; // Default: 'trends'
  }
  ```
- **Output Schema:**
  ```typescript
  interface HodAttendanceAnalyticsOutput {
    timeframe: 'week' | 'month' | 'semester' | 'academic_year';
    metric: 'trends' | 'defaulters' | 'subject_breakdown' | 'distribution';
    trends: Array<{
      period: string;
      percentage: number;
      sessionsHeld: number;
    }>;
    defaulterBuckets: {
      below65: number;
      between65And75: number;
      above75: number;
    };
    insights: string[];
  }
  ```

---

## 3. EXACT FILES CHANGED OR CREATED

| File | Status | Description |
|:---|:---|:---|
| `backend/src/modules/hod_temp/services/hodAnalyticsToolService.ts` | **CREATED** | Core service implementing the 5 attendance & analytics methods and registration |
| `backend/src/modules/hod_temp/ai/index.ts` | **UPDATED** | Exported `hodAnalyticsToolService` in ai module barrel |
| `backend/src/modules/hod_temp/routes/hodRoutes.ts` | **UPDATED** | Mounted `hodAnalyticsToolService` import for auto-registration on route loading |
| `backend/tests/hod-analytics-tools.test.ts` | **CREATED** | 24 automated unit, authorization, tenant isolation, and API integration tests |
| `docs/hod/HANDOFF_02_VARUN_TO_HARINI.md` | **CREATED** | This canonical handoff document for Harini |

---

## 4. EXACT IMPORT PATHS

For Harini (Step 3) and downstream developers:

```typescript
// Canonical Service & Registration:
import {
  hodAnalyticsToolService,
  registerAnalyticsToolHandlers,
} from '@/modules/hod_temp/services/hodAnalyticsToolService';
// Or relative from hod_temp:
import { hodAnalyticsToolService } from '../services/hodAnalyticsToolService';

// Canonical Tool Registry:
import { hodToolRegistry } from '@/modules/hod_temp/ai/toolRegistry';

// Canonical Types & Interfaces:
import type {
  HODContext,
  HodAttendanceSummaryInput,
  HodAttendanceSummaryOutput,
  HodStudentAttendanceInput,
  HodStudentAttendanceOutput,
  HodClassAttendanceInput,
  HodClassAttendanceOutput,
  HodDepartmentAttendanceInput,
  HodDepartmentAttendanceOutput,
  HodAttendanceAnalyticsInput,
  HodAttendanceAnalyticsOutput,
  HodSearchKnowledgeInput,
  HodSearchKnowledgeOutput,
  HodGetKnowledgeContextInput,
  HodGetKnowledgeContextOutput,
} from '@/modules/hod_temp/ai/hodAi.types';
```

---

## 5. DATABASE TABLES & COLUMNS USED

1. `attendance_sessions` (`s`):
   - `id` (uuid)
   - `class_id` (uuid)
   - `faculty_uid` (text)
   - `subject_id` (uuid)
   - `date` (date)
   - `period` (text)
   - `remarks` (text)
2. `attendance_records` (`ar`):
   - `id` (uuid)
   - `attendance_session_id` (uuid FK → `attendance_sessions.id`) — **Note:** never use `session_id`.
   - `student_uid` (text)
   - `status` (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`)
   - `remarks` (text)
3. `authed_users`:
   - `uid`, `display_name`, `email`, `role`, `college_id`, `department_id`, `class_id`, `register_number`
4. `classes`:
   - `id`, `batch_id`, `name`, `current_semester`, `faculty_uid`, `is_active`
5. `batches`:
   - `id`, `program_id`, `start_year`, `end_year`, `is_active`
6. `programs`:
   - `id`, `department_id`, `name`, `is_active`
7. `departments`:
   - `id`, `college_id`, `name`, `code`, `hod_uid`, `is_active`
8. `subjects`:
   - `id`, `department_id`, `name`, `code`, `credits`, `semester_number`, `is_active`

---

## 6. AUTHORIZATION & TENANT CONSTRAINTS

- **Enforcement Point:** Backend service (`assertContext`) and tool registry (`executeTool`).
- Verified identity is extracted strictly from `req.hod: HODContext`.
- Roles permitted: `HOD`, `ADMIN`, `COLLEGE_ADMIN`.
- Request arguments `departmentId` and `collegeId` are **never trusted**.
- Cross-department queries (`batchId`, `classId`, `studentId`, `subjectId` belonging to another department) throw `ForbiddenError`.
- Cross-college queries throw `ForbiddenError`.

---

## 7. CRITICAL ARCHITECTURAL MANDATE: RAG VS ATTENDANCE TOOLS

> ### **CRITICAL REQUIREMENT FOR HARINI (STEP 3)**
> 
> **RAG MUST NOT replace these attendance tools for live database facts.**
> 
> Use the attendance tools for:
> - Live attendance
> - Student attendance
> - Class attendance
> - Department attendance
> - Analytics & defaulter distributions
> 
> RAG (Tools 6 & 7: `hod.searchKnowledge`, `hod.getKnowledgeContext`) MUST be reserved exclusively for:
> - Institutional policies
> - University regulations & bylaws
> - Handbooks & guidelines
> - Curriculum syllabus & course descriptions

---

## 8. ENVIRONMENT VARIABLES & DEPENDENCIES

- Environment variables added: `NONE`
- New dependencies added: `NONE`
- Database helpers added: `NONE` (Reused canonical Prisma client in `backend/src/modules/hod_temp/config/db.ts`).

---

## 9. TESTS ADDED & PASSING STATUS

- Test file: `backend/tests/hod-analytics-tools.test.ts`
- Tests added: 24 tests covering:
  - Tool 1: batch/cohort percentage calculation, date range filtering, invalid batch/class rejection, empty data handling.
  - Tool 2: student attendance retrieval, low attendance alert (< 75%), cross-department denial, cross-college denial, student not found.
  - Tool 3: class statistics, class incharge resolution, at-risk student list (< 75%), present today count, cross-department class denial.
  - Tool 4: department overview, `filterBy: 'all'`, `filterBy: 'at_risk'` filtering.
  - Tool 5: defaulter buckets (<65%, 65-75%, >=75%), weekly/monthly/semester trends, automated insight generation.
  - Authorization & context validation: missing departmentId/collegeId rejection, unauthorized role rejection.
  - Registry execution pipeline: tool execution via `hodToolRegistry.executeTool` with timing.
  - Direct API endpoint execution: `POST /api/hod/ai/tools/execute`.
  - Chatbot end-to-end integration: `POST /api/hod/ai/chat` invoking live tool and synthesizing executive response.
- **Test execution result:** All 162 backend tests passing (`npm test`).
- **TypeScript build:** Zero errors (`npx tsc --noEmit`).

---

## 10. FILES HARINI MUST NOT MODIFY

Harini (Step 3) must NOT modify:
- `backend/src/modules/hod_temp/services/hodAnalyticsToolService.ts`
- `backend/src/modules/hod_temp/ai/hodAi.routes.ts`
- `backend/src/modules/hod_temp/ai/hodAi.controller.ts`
- `backend/src/modules/hod_temp/ai/hodAi.validation.ts`
- `backend/src/modules/hod_temp/middleware/authMiddleware.ts`
- `backend/src/app.ts`

---

## 11. INSTRUCTIONS FOR HARINI (STEP 3)

Harini owns Tools 6 & 7:
1. `hod.searchKnowledge`:
   - Semantic/RAG search over academic regulations, university policies, and department handbooks.
2. `hod.getKnowledgeContext`:
   - Grounded document text extraction for specific institutional clauses.

Harini will implement:
- Service: `backend/src/modules/hod_temp/services/hodRagToolService.ts`
- Register handlers via `hodToolRegistry.registerToolHandler('hod.searchKnowledge', ...)` and `hodToolRegistry.registerToolHandler('hod.getKnowledgeContext', ...)`.
- Tests: `backend/tests/hod-rag-tools.test.ts`.
- Handoff document: `docs/hod/HANDOFF_03_HARINI_TO_FAISAL.md`.

> **MANDATORY INSTRUCTION FOR HARINI:**  
> Read `HANDOFF_02_VARUN_TO_HARINI.md` and the canonical HOD tool contract (`HOD_AI_TOOL_CONTRACT.md`) before implementing RAG. Do not use RAG for live attendance data and do not create a new database helper.
