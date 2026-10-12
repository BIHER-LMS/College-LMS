# STUDENT AI TOOL & CHAT CONTRACT

**Document Version:** 1.0.0  
**Status:** FROZEN  
**Module:** Student AI Orchestrator & Canonical Tools  
**Author / Position:** 01 — Tushar (Student AI Orchestrator)  
**Consumer:** 02 — Ashik (Student Data Tools), 03 — Jeresh (Student RAG), 04 — Aravind (Integration & Testing)

---

## 1. Architectural Overview & Boundaries

The Student AI Chatbot module follows an authoritative, zero-trust backend architecture:
```text
Student Client / UI
   │ (Authorization: Bearer <FirebaseIdToken>)
   ▼
POST /api/student/ai/chat (or /api/student/chat)
   │
   ├─► 1. authenticateFirebaseUser (validates token cryptographically)
   ├─► 2. buildStudentContext (fetches approved student user, validates college, department, class)
   ├─► 3. studentChatRequestBodySchema (Zod validation)
   │
   ▼
StudentAiOrchestratorService
   │
   ├─► Input Sanitizer & Prompt Injection Detector
   ├─► Tool Intent Detection (Auto) or Explicit Tool Choice
   │
   ▼
studentToolRegistry.executeTool
   │
   ├─► 12 Deterministic Data Tools (Ashik -> StudentService / StudentRepository)
   └─► 2 Grounded RAG Tools (Jeresh -> Qdrant + Groq / Local Corpus)
   │
   ▼
Response Synthesis (Groq LLM Grounding or High-Fidelity Local Markdown)
   │
   ▼
HTTP 200 JSON Response (Structured Contract)
```

### Critical Security Boundaries
1. **Zero IDOR:** Client-supplied identifiers (`uid`, `role`, `college_id`, `department_id`, `class_id`, `register_number`) in request bodies/params are **STRICTLY IGNORED**. All operations are strictly derived from trusted `req.studentContext`.
2. **Deterministic Data vs RAG Boundary:**
   - **Student Data Tools:** Live facts (attendance percentage, timetable periods, class incharge, enrolled subjects, academic years) **MUST** come from deterministic tools.
   - **RAG Knowledge Tools:** Institutional bylaws, examination passing criteria, attendance condonation policies (75% rule, medical leave), code of conduct.
   - **RAG is NEVER the source of truth for live student records.**
3. **No Direct Database Access:** The LLM receives **zero database credentials**, no Prisma instance, and no arbitrary SQL execution tools.

---

## 2. API Endpoints

### Endpoint A: Student AI Chat
- **Route:** `POST /api/student/ai/chat` (Aliased at `POST /api/student/chat`)
- **Authentication:** Bearer Firebase ID Token (Header: `Authorization: Bearer <token>`)
- **Required Role:** `STUDENT` (with status `APPROVED` or `ACTIVE`)
- **Request Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <firebase_id_token>`

#### Request Body Schema
```json
{
  "message": "What is my current attendance percentage and safe margin?",
  "conversationHistory": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hello! How can I help you today?" }
  ],
  "toolChoice": "auto",
  "directToolArgs": {}
}
```
*Fields:*
- `message` (string, required, min 1, max 2000 chars)
- `conversationHistory` (array of objects, optional, max 20 items, `{ role: 'user' | 'assistant', content: string }`)
- `toolChoice` (string, optional, default `'auto'`): `'auto' | 'none' | <StudentToolName>`
- `directToolArgs` (object, optional, default `{}`): Used when `toolChoice` is explicitly set to a tool name.

#### Response Body Schema (HTTP 200)
```json
{
  "success": true,
  "data": {
    "reply": "### 📊 Your Attendance Summary\n\n- **Overall Attendance:** **86.7%** ✅...",
    "messageId": "msg-1728631200000-abc1234",
    "toolsExecuted": [
      {
        "toolName": "student.getAttendance",
        "status": "success",
        "args": {},
        "result": { ... },
        "durationMs": 142
      }
    ],
    "confidence": 0.95,
    "processingTimeMs": 185,
    "provider": "local"
  }
}
```

---

### Endpoint B: List Canonical Tools
- **Route:** `GET /api/student/ai/tools`
- **Authentication:** Bearer Firebase ID Token
- **Response Body Schema (HTTP 200):**
```json
{
  "success": true,
  "data": {
    "tools": [
      {
        "name": "student.getAttendance",
        "category": "data",
        "description": "Fetch student attendance metrics, 75% eligibility, safe margin, and subject breakdowns.",
        "parameters": [
          {
            "name": "date",
            "type": "string",
            "description": "Optional date string in YYYY-MM-DD format to inspect attendance logs.",
            "required": false
          }
        ]
      }
      // ... remaining 13 tools
    ]
  }
}
```

---

### Endpoint C: Direct Tool Execution
- **Route:** `POST /api/student/ai/tools/execute`
- **Authentication:** Bearer Firebase ID Token
- **Request Body Schema:**
```json
{
  "toolName": "student.getAttendance",
  "args": {
    "date": "2026-10-11"
  }
}
```
- **Response Body Schema (HTTP 200):**
```json
{
  "success": true,
  "data": {
    "toolName": "student.getAttendance",
    "status": "success",
    "args": { "date": "2026-10-11" },
    "result": { ... },
    "durationMs": 48
  }
}
```

---

## 3. The 14 Canonical Student Tools

| # | Tool Name | Category | Primary Service Method | Purpose |
|---|---|---|---|---|
| 1 | `student.getDashboard` | `data` | `studentService.getDashboard(ctx)` | Complete student academic dashboard |
| 2 | `student.getProfile` | `data` | `studentService.getProfile(ctx)` | View authenticated student profile |
| 3 | `student.getClass` | `data` | `studentService.getClass(ctx)` | Student enrolled class and section details |
| 4 | `student.getBatch` | `data` | `studentService.getBatch(ctx)` | Enrolled batch (start year, end year) |
| 5 | `student.getProgram` | `data` | `studentService.getProgram(ctx)` | Academic degree program (B.Tech, etc.) |
| 6 | `student.getDepartment` | `data` | `studentService.getDepartment(ctx)` | Department and HOD affiliation |
| 7 | `student.getSubjects` | `data` | `studentService.getSubjects(ctx, sem)` | Prescribed department subjects/courses |
| 8 | `student.getClassIncharge` | `data` | `studentService.getClassIncharge(ctx)` | Faculty contact details for Class Incharge |
| 9 | `student.getAcademicYears` | `data` | `studentService.getAcademicYears(ctx)` | College academic years |
| 10 | `student.getSemesters` | `data` | `studentService.getSemesters(ctx)` | Current academic year semesters |
| 11 | `student.getTimetable` | `data` | `studentService.getClassTimetable(ctx)` | Weekly period schedule & classroom rooms |
| 12 | `student.getAttendance` | `data` | `studentService.getAttendance(ctx, date)` | Metrics, 75% rule, safeMargin, subject breakdown |
| 13 | `student.searchKnowledge` | `rag` | `studentRagToolService.searchKnowledge(args, ctx)` | Qdrant/local semantic search for policies |
| 14 | `student.getKnowledgeContext` | `rag` | `studentRagToolService.getKnowledgeContext(args, ctx)` | Document text and clauses retrieval |

---

## 4. Input & Output Contracts per Tool

### 1. `student.getDashboard`
- **Input:** `{}`
- **Output:**
```json
{
  "student": { "displayName": "...", "email": "...", "registerNumber": "..." },
  "class": { "id": "...", "name": "...", "currentSemester": 6 },
  "batch": { "startYear": 2022, "endYear": 2026 },
  "program": { "name": "B.Tech CSE" },
  "department": { "name": "Computer Science & Engineering" },
  "classIncharge": { "name": "Dr. Vance", "email": "..." },
  "academicYear": { "name": "2025-2026" },
  "semester": { "termNumber": 6 },
  "subjects": []
}
```

### 2. `student.getProfile`
- **Input:** `{}`
- **Output:** `StudentProfile` (uid, displayName, email, registerNumber, phone, address, city, state, bio, profilePhotoUrl)

### 3. `student.getClass`
- **Input:** `{}`
- **Output:** `ClassInfo` (id, batchId, name, currentSemester, facultyUid, isActive, batch, program, department, classIncharge)

### 4. `student.getBatch`
- **Input:** `{}`
- **Output:** `BatchInfo` (id, programId, startYear, endYear, name, isActive)

### 5. `student.getProgram`
- **Input:** `{}`
- **Output:** `ProgramInfo` (id, departmentId, name, type, durationYears, isActive)

### 6. `student.getDepartment`
- **Input:** `{}`
- **Output:** `DepartmentInfo` (id, collegeId, name, code, hodUid, isActive, hod)

### 7. `student.getSubjects`
- **Input:** `{ semesterNumber?: number }`
- **Output:** `SubjectInfo[]` (`[{ id, departmentId, name, code, credits, semesterNumber, isActive }]`)

### 8. `student.getClassIncharge`
- **Input:** `{}`
- **Output:** `ClassInchargeInfo` (facultyUid, name, email, phone, photoUrl, designation, department)

### 9. `student.getAcademicYears`
- **Input:** `{}`
- **Output:** `AcademicYearInfo[]` (`[{ id, collegeId, name, startDate, endDate, isCurrent }]`)

### 10. `student.getSemesters`
- **Input:** `{}`
- **Output:** `SemesterInfo[]` (`[{ id, academicYearId, termNumber, startDate, endDate }]`)

### 11. `student.getTimetable`
- **Input:** `{}`
- **Output:** `ClassTimetableSlot[]` (`[{ id, class_id, day_of_week, period, start_time, end_time, subject_name, subject_code, faculty_name, room }]`)

### 12. `student.getAttendance`
- **Input:** `{ date?: "YYYY-MM-DD" }`
- **Output:** `StudentAttendanceResponse`:
  - `summary`: `{ totalSessions, attendedSessions, presentCount, lateCount, absentCount, excusedCount, percentage, isEligible, safeMargin, todayTotal, todayAttended, todayPresent, todayLate, todayAbsent, todayExcused, todayEffectivePercentage }`
  - `subjectBreakdown`: `[{ id, code, name, held, attended, excused, absent, percentage, status: "SAFE" | "CRITICAL" | "NO_DATA" }]`
  - `dailySchedule`: `[{ dayName, dayOfWeek, dateStr, periods: [{ period, periodLabel, timeSlot, courseCode, courseName, facultyName, venue, status, markedAt, verificationMethod, topic }] }]`
- **Status Rules:**
  - `SAFE`: `percentage >= 75%`
  - `CRITICAL`: `percentage < 75%`
  - `NO_DATA`: `held === 0`
- **Foreign Key:** `ar.attendance_session_id = s.id` (NEVER `session_id`)

### 13. `student.searchKnowledge`
- **Input:** `{ query: string, category?: "policy" | "regulation" | "exam" | "handbook" | "general", limit?: number }`
- **Output:**
```json
{
  "query": "...",
  "category": "policy",
  "results": [
    {
      "documentId": "doc-student-att-policy",
      "title": "Institutional Attendance & Condonation Regulations",
      "category": "policy",
      "snippet": "...",
      "score": 0.94,
      "source": "Academic Regulations Clause 4.2"
    }
  ],
  "totalMatches": 1
}
```

### 14. `student.getKnowledgeContext`
- **Input:** `{ documentId: string, section?: string }`
- **Output:**
```json
{
  "documentId": "doc-student-att-policy",
  "title": "Academic Handbook & Student Code of Conduct",
  "category": "policy",
  "content": "Official Institutional Academic Regulations..."
}
```

---

## 5. Error Contract & Status Codes

All errors conform to the standard project `AppError` and `sendError`:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": []
  }
}
```

| HTTP Status | Error Code | Trigger Condition |
|---|---|---|
| 400 | `BAD_REQUEST` / `VALIDATION_ERROR` | Empty message, missing required parameter, invalid date format |
| 401 | `UNAUTHORIZED` | Missing or invalid Firebase Bearer token, user not found in DB |
| 403 | `FORBIDDEN` | User role is not `STUDENT`, approval status not `APPROVED`/`ACTIVE`, or mismatched college/department/class |
| 404 | `NOT_FOUND` | Student profile, assigned class, or requested document not found |
| 500 | `TOOL_EXECUTION_ERROR` | Internal database or third-party service exception |

---

## 6. Implementation & Import Reference Table

| Layer | File Path | Primary Export |
|---|---|---|
| Context & Types | `backend/src/modules/student/ai/studentAi.types.ts` | `STUDENT_TOOL_NAMES`, `StudentToolName`, `StudentChatRequest`, `StudentChatResponseData` |
| Validation | `backend/src/modules/student/ai/studentAi.validation.ts` | `studentChatRequestBodySchema`, `directToolExecutionBodySchema`, `toolArgumentSchemas` |
| Registry | `backend/src/modules/student/ai/toolRegistry.ts` | `studentToolRegistry`, `StudentToolRegistry` |
| Orchestrator | `backend/src/modules/student/ai/studentAi.service.ts` | `studentAiOrchestratorService`, `StudentAiOrchestratorService` |
| Controller | `backend/src/modules/student/ai/studentAi.controller.ts` | `studentAiController`, `StudentAiController` |
| AI Routes | `backend/src/modules/student/ai/studentAi.routes.ts` | `default as router` |
| Student Routes | `backend/src/modules/student/student.routes.ts` | Mounts `/ai` and `/chat` |
| Student Service | `backend/src/modules/student/student.service.ts` | `studentService` |
| Student Repository | `backend/src/modules/student/student.repository.ts` | `StudentRepository` |
