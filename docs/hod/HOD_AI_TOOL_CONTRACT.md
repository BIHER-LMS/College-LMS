# HOD AI Tool Contract & API Specification

**Author:** Abhinav (Step 1 of 5)  
**Target Consumer:** Varun (Step 2), Harini (Step 3), Faisal (Step 4), Adhithi (Step 5)  
**Status:** CANONICAL & STABLE  
**Feature Branch:** `feature/hod-ai-orchestrator`  
**Handoff Branch for Varun:** `feature/hod-analytics-tools`  

---

## 1. System Overview & Architecture

The HOD AI Chatbot provides departmental intelligence, attendance surveillance, and academic regulatory lookup for Heads of Department.

```text
HTTP Request (POST /api/hod/ai/chat)
  ├── 1. Firebase Authentication (`requireAuth`)
  │      └── Verifies Bearer ID token; resolves verified UID & authedUser
  ├── 2. HOD Authorization Context (`requireHOD`)
  │      └── Asserts role in ['HOD', 'ADMIN', 'COLLEGE_ADMIN']
  │      └── Resolves trusted `req.hod: HODContext` with verified departmentId & collegeId
  ├── 3. Zod Request Validation (`validate(hodChatRequestSchema)`)
  │      └── Validates message length, history structure, and tool choices
  ├── 4. HOD AI Orchestrator (`hodAiOrchestratorService`)
  │      └── Sanitizes input & screens prompt injection attempts
  │      └── Detects tool intent or honors explicit tool choices
  ├── 5. Canonical Tool Registry (`hodToolRegistry`)
  │      └── Validates tool name against canonical 7-tool whitelist
  │      └── Enforces tenant boundaries (client cannot override department/college)
  │      └── Validates arguments against input Zod schema
  │      └── Executes registered tool handler with trusted `HODContext`
  │      └── Validates output against output Zod schema
  │      └── Captures structured results & execution timing
  └── 6. Executive Response Synthesis (`synthesizeResponse`)
         └── Formats professional markdown response with metrics & alerts
         └── Returns structured JSON payload via `sendSuccess`
```

---

## 2. API Contract

### Primary Chat Endpoint
- **URL:** `/api/hod/ai/chat`
- **Method:** `POST`
- **Authentication:** Bearer Firebase ID Token (Header: `Authorization: Bearer <TOKEN>`)
- **Required Role:** `HOD`, `ADMIN`, `COLLEGE_ADMIN`
- **Content-Type:** `application/json`

#### Request Schema
```typescript
interface HodChatRequest {
  message: string; // Required, 1-2000 characters
  history?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string; // 1-5000 characters
  }>; // Max 30 messages
  toolChoice?: 'auto' | 'none' | { type: 'tool'; name: HodToolName };
}
```

**Example Request:**
```json
{
  "message": "What is the attendance summary for our department this semester?",
  "history": [
    { "role": "user", "content": "Good morning." },
    { "role": "assistant", "content": "Good morning Dr. Turing. How can I assist you with CSE department operations today?" }
  ],
  "toolChoice": "auto"
}
```

#### Response Schema
```typescript
interface ApiResponse<HodChatResponseData> {
  success: true;
  data: {
    message: string;
    toolsExecuted: Array<{
      toolName: HodToolName;
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
      departmentId: string;
      collegeId: string;
      timestamp: string;
      model: string;
    };
  };
  message?: string;
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "message": "### Departmental Attendance Summary\n\n- **Department Average:** 92.4%\n- **Total Students:** 180\n- **Total Classes:** 4\n\n**Cohort Breakdown:**\n• **Year 1 Freshmen**: 95.2% (45 students)\n• **Year 2 Sophomores**: 91.8% (45 students)\n• **Year 3 Juniors**: 88.5% (45 students) ⚠️ *Below Target Alert*\n• **Year 4 Seniors**: 94.1% (45 students)",
    "toolsExecuted": [
      {
        "toolName": "hod.getAttendanceSummary",
        "arguments": {},
        "status": "success",
        "result": {
          "departmentId": "dept-cse-101",
          "departmentAverage": 92.4,
          "totalStudents": 180,
          "totalClasses": 4,
          "cohorts": [
            {
              "cohortName": "Year 1 Freshmen",
              "batchId": "batch-2024-2028",
              "percentage": 95.2,
              "studentCount": 45,
              "isAlert": false
            },
            {
              "cohortName": "Year 2 Sophomores",
              "batchId": "batch-2023-2027",
              "percentage": 91.8,
              "studentCount": 45,
              "isAlert": false
            },
            {
              "cohortName": "Year 3 Juniors",
              "batchId": "batch-2022-2026",
              "percentage": 88.5,
              "studentCount": 45,
              "isAlert": true
            },
            {
              "cohortName": "Year 4 Seniors",
              "batchId": "batch-2021-2025",
              "percentage": 94.1,
              "studentCount": 45,
              "isAlert": false
            }
          ],
          "dateRange": {
            "startDate": null,
            "endDate": null
          }
        },
        "executionDurationMs": 14
      }
    ],
    "metadata": {
      "departmentId": "dept-cse-101",
      "collegeId": "college-alpha-001",
      "timestamp": "2026-10-08T10:15:00.000Z",
      "model": "hod-ai-orchestrator-v1"
    }
  },
  "message": "Chat response generated successfully"
}
```

---

### Secondary Utility Endpoints

#### 1. Tool Catalog
- **URL:** `/api/hod/ai/tools`
- **Method:** `GET`
- **Authentication:** Bearer Firebase ID Token (HOD role required)
- **Response:** Array of `ToolMetadata` for the 7 canonical tools.

#### 2. Controlled Direct Tool Execution
- **URL:** `/api/hod/ai/tools/execute`
- **Method:** `POST`
- **Authentication:** Bearer Firebase ID Token (HOD role required)
- **Request:** `{ "toolName": HodToolName, "arguments": Record<string, any> }`
- **Response:** `ToolExecutionResult` containing status, result/error, and duration.

---

## 3. The 7 Canonical Tool Contracts

### Tool Ownership Summary
| Tool Name | Owner | Responsibility |
|:---|:---|:---|
| `hod.getAttendanceSummary` | **Varun** | Cohort & high-level department attendance |
| `hod.getStudentAttendance` | **Varun** | Individual student attendance & subject breakdown |
| `hod.getClassAttendance` | **Varun** | Class statistics, in-charge & at-risk student roster |
| `hod.getDepartmentAttendance` | **Varun** | Department-wide class comparison & filtering |
| `hod.getAttendanceAnalytics` | **Varun** | Temporal trends & defaulter distributions |
| `hod.searchKnowledge` | **Harini** | RAG search over institutional regulations |
| `hod.getKnowledgeContext` | **Harini** | Full text extraction for specific knowledge documents |

---

### Tool 1: `hod.getAttendanceSummary`
- **Owner:** Varun
- **Purpose:** Retrieve aggregate attendance metrics across cohorts and batches for the HOD's department.
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
      isAlert: boolean;
    }>;
    dateRange: {
      startDate: string | null;
      endDate: string | null;
    };
    _isStub?: boolean;
  }
  ```

---

### Tool 2: `hod.getStudentAttendance`
- **Owner:** Varun
- **Purpose:** Retrieve student attendance percentages and individual subject session statistics.
- **Input Schema:**
  ```typescript
  interface HodStudentAttendanceInput {
    studentId: string; // Required
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
    _isStub?: boolean;
  }
  ```

---

### Tool 3: `hod.getClassAttendance`
- **Owner:** Varun
- **Purpose:** Retrieve class-level attendance statistics and identify students falling below the 75% attendance threshold.
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
    _isStub?: boolean;
  }
  ```

---

### Tool 4: `hod.getDepartmentAttendance`
- **Owner:** Varun
- **Purpose:** Compare attendance performance across all active classes within the HOD's department.
- **Input Schema:**
  ```typescript
  interface HodDepartmentAttendanceInput {
    startDate?: string; // YYYY-MM-DD
    endDate?: string;   // YYYY-MM-DD
    filterBy?: 'all' | 'at_risk' | 'low_attendance';
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
    _isStub?: boolean;
  }
  ```

---

### Tool 5: `hod.getAttendanceAnalytics`
- **Owner:** Varun
- **Purpose:** Aggregate temporal attendance trends, defaulter distributions (<65%, 65-75%, 75%+), and generate reporting insights.
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
    _isStub?: boolean;
  }
  ```

---

### Tool 6: `hod.searchKnowledge`
- **Owner:** Harini
- **Purpose:** Perform semantic/RAG search over academic regulations, university policies, and department handbooks.
- **Input Schema:**
  ```typescript
  interface HodSearchKnowledgeInput {
    query: string; // Min 2 characters, max 255
    category?: 'policy' | 'curriculum' | 'handbook' | 'general';
    limit?: number; // 1 to 20, default 5
  }
  ```
- **Output Schema:**
  ```typescript
  interface HodSearchKnowledgeOutput {
    query: string;
    resultsCount: number;
    results: Array<{
      documentId: string;
      title: string;
      category: string;
      snippet: string;
      score: number; // 0.0 - 1.0
      url?: string;
    }>;
    _isStub?: boolean;
  }
  ```

---

### Tool 7: `hod.getKnowledgeContext`
- **Owner:** Harini
- **Purpose:** Retrieve grounded document content or specific regulatory clauses.
- **Input Schema:**
  ```typescript
  interface HodGetKnowledgeContextInput {
    documentId: string; // Required
    section?: string;
  }
  ```
- **Output Schema:**
  ```typescript
  interface HodGetKnowledgeContextOutput {
    documentId: string;
    title: string;
    section: string | null;
    content: string;
    lastUpdated: string; // ISO date
    metadata: Record<string, any>;
    _isStub?: boolean;
  }
  ```

---

## 4. Exact Import Paths & Registration API

For Varun (Step 2) and Harini (Step 3), import from:

```typescript
// Tool Registry Singleton
import { hodToolRegistry } from '@/modules/hod_temp/ai/toolRegistry';
// Or relative from hod_temp/services:
import { hodToolRegistry } from '../ai/toolRegistry';

// Canonical Types
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
} from '@/modules/hod_temp/ai/hodAi.types';
```

### Registration Pattern for Varun
In your service file (e.g. `backend/src/modules/hod_temp/services/hodAnalyticsToolService.ts`):

```typescript
import { hodToolRegistry } from '../ai/toolRegistry';
import type {
  HODContext,
  HodAttendanceSummaryInput,
  HodAttendanceSummaryOutput,
} from '../ai/hodAi.types';

export class HodAnalyticsToolService {
  async getAttendanceSummary(
    input: HodAttendanceSummaryInput,
    context: HODContext,
  ): Promise<HodAttendanceSummaryOutput> {
    // 1. Enforce departmental isolation: context.departmentId & context.collegeId
    // 2. Query attendance records using Prisma
    // 3. Return structured output matching HodAttendanceSummaryOutput
  }
}

export const hodAnalyticsToolService = new HodAnalyticsToolService();

// Register with Abhinav's canonical registry:
hodToolRegistry.registerToolHandler(
  'hod.getAttendanceSummary',
  (input, ctx) => hodAnalyticsToolService.getAttendanceSummary(input, ctx),
);
```

---

## 5. Security & Authorization Guarantees

1. **Backend Authorization Enforcement:**
   - Every route is protected by `requireHODOrAdmin`.
   - The verified identity is attached to `req.hod: HODContext`.
   - `departmentId` and `collegeId` are **never** accepted from client request bodies.
2. **Tenant Isolation Enforcement:**
   - The tool registry validates that if `rawArgs` contains `departmentId` or `collegeId`, it must match `context.departmentId` and `context.collegeId`.
   - Any attempt by the client or LLM to query a different department or college throws `ForbiddenError('Tenant isolation violation')`.
3. **No Direct SQL/Prisma to LLM:**
   - The LLM interacts strictly with the tool registry via typed inputs and outputs.
   - Database credentials and arbitrary query generation are prohibited.
4. **Prompt Injection Mitigation:**
   - Input is screened for known prompt injection vectors (`ignore previous instructions`, `you are now superadmin`, `bypass tenant boundary`).
   - Flagged queries are neutralized without executing unauthorized tools.
