# HOD AI Tool Contract

<<<<<<< Updated upstream
**Canonical Document**
**Owner**: Abhinav
**Last Updated**: 2026-10-08

This document is the single source of truth for the HOD AI Orchestrator's interfaces. **All downstream developers MUST implement exactly these interfaces.** Do not rename tools, change input/output schemas, or create second authentication mechanisms.

---

## Architecture Overview

```text
HTTP request
 -> existing Firebase authentication (token verified, UID extracted)
 -> requireHOD middleware (resolves role, collegeId, departmentId)
 -> Zod request validation (hodAIChatRequestSchema)
 -> AI orchestrator (intent resolution & response formatting)
 -> Canonical tool registry (authorization checks & schema validation)
 -> Approved backend tool executor (e.g., Varun's/Harini's code)
 -> Structured result
 -> LLM response formatting
 -> API response
```

The LLM determines *which* tool to call, but the **Tool Registry** enforces authorization before calling the executor. The LLM NEVER receives raw SQL access, database credentials, or permissive access to other tenants' data.

---

## API Contract

### Chat Endpoint

**URL**: `/api/hod/ai/chat`
**Method**: `POST`
**Authorization**: `Bearer <firebase-id-token>`
**Required Roles**: `HOD` or `COLLEGE_ADMIN` (with assigned `collegeId` and `departmentId`)

#### Request Schema

```typescript
{
  /** The user's current message — required, 1–2000 chars */
  message: string;
  
  /** Optional conversation history — max 50 messages */
  conversationHistory?: Array<{
    role: "user" | "assistant" | "system";
    content: string;
    timestamp?: string;
  }>;
  
  /** Optional conversation ID for multi-turn tracking */
  conversationId?: string;
}
```

#### Response Schema

```typescript
{
  success: true,
  data: {
    /** The AI-generated response message */
    message: string;
    /** Conversation ID for multi-turn tracking */
    conversationId: string;
    /** Tools that were invoked during this request */
    toolsInvoked: Array<{
      toolName: string;
      input: Record<string, unknown>;
      success: boolean;
      error?: string;
      durationMs: number;
    }>;
    /** ISO 8601 timestamp */
    timestamp: string;
  }
}
```

---

## Canonical Tools

All tools are executed via the registry. Downstream developers must register their executor via:
`toolRegistry.registerExecutor('tool.name', executorFunction)`

### 1. `hod.getAttendanceSummary`

**Purpose**: Get an overall attendance summary for the HOD's department.
**Executor Path**: `backend/src/modules/hod-ai/tools/attendance.tools.ts`
**Authorization**: Roles `['HOD', 'COLLEGE_ADMIN']`, Requires Department, Requires College

**Input Schema**:
```typescript
{
  startDate?: string; // Optional (YYYY-MM-DD)
  endDate?: string;   // Optional (YYYY-MM-DD)
}
```

**Output Schema**:
```typescript
{
  totalSessions: number;
  totalStudents: number;
  averageAttendanceRate: number;
  classBreakdown: Array<{
    classId: string;
    className: string;
    attendanceRate: number;
    totalSessions: number;
  }>;
}
```

### 2. `hod.getStudentAttendance`

**Purpose**: Get attendance details for a specific student within the HOD's department.
**Executor Path**: `backend/src/modules/hod-ai/tools/attendance.tools.ts`
**Authorization**: Roles `['HOD', 'COLLEGE_ADMIN']`, Requires Department, Requires College

**Input Schema**:
```typescript
{
  studentUid: string; // Required (Firebase UID)
  startDate?: string; // Optional (YYYY-MM-DD)
  endDate?: string;   // Optional (YYYY-MM-DD)
}
```

**Output Schema**:
```typescript
{
  studentUid: string;
  studentName: string;
  className: string;
  overallAttendanceRate: number;
  totalPresent: number;
  totalAbsent: number;
  totalSessions: number;
  subjectBreakdown: Array<{
    subjectName: string;
    attendanceRate: number;
    held: number;
    attended: number;
  }>;
}
```

### 3. `hod.getClassAttendance`

**Purpose**: Get attendance details for a specific class within the HOD's department.
**Executor Path**: `backend/src/modules/hod-ai/tools/attendance.tools.ts`
**Authorization**: Roles `['HOD', 'COLLEGE_ADMIN']`, Requires Department, Requires College

**Input Schema**:
```typescript
{
  classId: string; // Required (UUID)
  date?: string;   // Optional (YYYY-MM-DD)
}
```

**Output Schema**:
```typescript
{
  classId: string;
  className: string;
  date: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
  sessions: Array<{
    period: string;
    subjectName: string;
    facultyName: string;
    presentCount: number;
    absentCount: number;
  }>;
}
```

### 4. `hod.getDepartmentAttendance`

**Purpose**: Get a comprehensive attendance report for the entire department.
**Executor Path**: `backend/src/modules/hod-ai/tools/attendance.tools.ts`
**Authorization**: Roles `['HOD', 'COLLEGE_ADMIN']`, Requires Department, Requires College

**Input Schema**:
```typescript
{
  startDate?: string; // Optional (YYYY-MM-DD)
  endDate?: string;   // Optional (YYYY-MM-DD)
}
```

**Output Schema**:
```typescript
{
  departmentId: string;
  departmentName: string;
  overallAttendanceRate: number;
  totalStudents: number;
  totalFaculty: number;
  classBreakdown: Array<{
    classId: string;
    className: string;
    studentCount: number;
    attendanceRate: number;
  }>;
}
```

### 5. `hod.getAttendanceAnalytics`

**Purpose**: Get attendance analytics: trends, comparisons, or risk identification.
**Executor Path**: `backend/src/modules/hod-ai/tools/attendance.tools.ts`
**Authorization**: Roles `['HOD', 'COLLEGE_ADMIN']`, Requires Department, Requires College

**Input Schema**:
```typescript
{
  type?: 'trend' | 'comparison' | 'risk'; // Default: 'trend'
  periodDays?: number; // Default: 30
  classId?: string; // Optional UUID
}
```

**Output Schema**:
```typescript
{
  type: string;
  data: Record<string, unknown>; // Shape varies by type
}
```

### 6. `hod.searchKnowledge`

**Purpose**: Search the department knowledge base for documents/policies.
**Executor Path**: `backend/src/modules/hod-ai/tools/knowledge.tools.ts`
**Authorization**: Roles `['HOD', 'COLLEGE_ADMIN']`, Requires Department, Requires College

**Input Schema**:
```typescript
{
  query: string; // Required
  maxResults?: number; // Default: 5
  category?: 'attendance' | 'curriculum' | 'academic' | 'policy' | 'general';
}
```

**Output Schema**:
```typescript
{
  results: Array<{
    documentId: string;
    title: string;
    snippet: string;
    category: string;
    relevanceScore: number;
  }>;
  totalResults: number;
}
```

### 7. `hod.getKnowledgeContext`

**Purpose**: Retrieve full content of a specific knowledge document.
**Executor Path**: `backend/src/modules/hod-ai/tools/knowledge.tools.ts`
**Authorization**: Roles `['HOD', 'COLLEGE_ADMIN']`, Requires Department, Requires College

**Input Schema**:
```typescript
{
  documentId: string; // Required
}
```

**Output Schema**:
```typescript
{
  documentId: string;
  title: string;
  content: string;
  category: string;
  lastUpdated: string; // ISO 8601
}
```

---

## Error Handling

Errors from tools must be handled gracefully. Executors MUST NOT throw exceptions that expose SQL or Prisma errors. If an error occurs, the executor MUST return:

```typescript
{
  success: false,
  data: null,
  error: "A sanitized, human-readable error message"
}
```

The orchestrator guarantees that the LLM only ever sees safe, predefined error messages (e.g., `HOD_AI_TOOL_EXECUTION_FAILED`, `HOD_AI_UNAUTHORIZED_ROLE`).

---

## Authentication / Authorization Context

Every tool executor receives a trusted `HODAIContext`:

```typescript
export interface HODAIContext {
  uid: string;
  email: string;
  displayName: string | null;
  photoUrl: string | null;
  role: string;
  departmentId: string; // Guaranteed present by orchestrator
  collegeId: string;    // Guaranteed present by orchestrator
}
```

Executors **MUST** use `context.departmentId` and `context.collegeId` in their WHERE clauses/Prisma queries to ensure data isolation. Do NOT allow the LLM to query across departments or colleges.
=======
This document specifies the canonical tool interfaces that the LLM Orchestrator will expose, and which Varun (the next developer) must implement.

## API Contract
**Endpoint:** `/api/hod/ai/chat`
**Method:** `POST`

**Request Schema:**
```json
{
  "message": "string (1-4000 chars)",
  "history": [
    {
      "role": "user | assistant | system",
      "content": "string"
    }
  ] // optional
}
```

**Response Schema:**
```json
{
  "success": true,
  "message": "string (LLM text response)",
  "toolsUsed": [
    {
      "toolName": "string",
      "result": "any",
      "error": "string (optional)"
    }
  ]
}
```

## Authorization
All AI routes are protected by `requireHODOrAdmin`.
The LLM Orchestrator will inject a trusted `HODContext` into all tools, ensuring proper multi-tenant and role-based data isolation.
Tools MUST NOT accept roles, tenant IDs, or user IDs as input arguments directly from the LLM.

## Error Contract
All AI tool errors must not expose sensitive stack traces. The orchestrator will gracefully capture tool errors and pass them back as `error` in `toolsUsed`. Use centralized error handling (e.g. `AppError`).

## Tool Registry
The canonical tool registry is exported at `backend/src/modules/hod-ai/hod-ai.registry.ts`.
Tools must be defined and registered using the `HODToolConfig` interface.

### Planned Tools

#### `hod.getAttendanceSummary`
- **Purpose**: Get high-level attendance summary (percentage, count of safe/critical students) for a class or department.
- **Input Schema**:
  ```json
  {
    "targetType": "class | department",
    "targetId": "string (UUID, optional if context restricts)"
  }
  ```
- **Output Schema**: JSON Object with summary stats.

#### `hod.getStudentAttendance`
- **Purpose**: Get detailed attendance breakdown for a specific student.
- **Input Schema**:
  ```json
  {
    "studentUid": "string"
  }
  ```
- **Output Schema**: JSON Object with student attendance records.

#### `hod.getClassAttendance`
- **Purpose**: Get daily or subject-wise attendance for a class.
- **Input Schema**:
  ```json
  {
    "classId": "string (UUID)"
  }
  ```

#### `hod.getDepartmentAttendance`
- **Purpose**: Get comparative attendance across all classes in the department.
- **Input Schema**: Empty `{}`. Use `context.departmentId`.

#### `hod.getAttendanceAnalytics`
- **Purpose**: Get analytics on attendance trends, most absent subjects, etc.
- **Input Schema**: Empty `{}`.

#### `hod.searchKnowledge` / `hod.getKnowledgeContext`
*(Reserved for Harini - Do not implement yet)*

## Implementation Instructions (For Varun)
Varun will implement the attendance/analytics tools.
1. Use `hodToolRegistry.registerTool(config)` in `hod-ai.registry.ts` or in an initialization file.
2. Implement the `execute` function for each tool using the existing secure data repositories and services where applicable. Ensure that queries are strictly scoped to the `HODContext` (department isolation).
>>>>>>> Stashed changes
