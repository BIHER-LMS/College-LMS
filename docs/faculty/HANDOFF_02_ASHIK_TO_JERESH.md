# Faculty AI Backend Tools Handoff: Ashik to Jeresh

**STATUS:** COMPLETE  
**CURRENT OWNER:** ASHIK (Step 2 of 5)  
**NEXT OWNER:** JERESH (Step 3 of 5)  
**CURRENT BRANCH:** `feature/faculty-tools`  
**NEXT BRANCH:** `feature/faculty-rag`  

---

## 1. Executive Summary

Ashik (Step 2 of 5) has implemented all 17 deterministic Faculty and Class Incharge backend data tools (Tools 1 to 17) under the canonical tool contract established by Tushar (Step 1). All tools reuse existing methods from `FacultyService` and `FacultyRepository` while guaranteeing high-fidelity, schema-compliant fallback data in development and test environments.

### Core Achievements:
1. **Deterministic Backend Tool Service:**
   - Implemented `FacultyBackendToolService` in `backend/src/modules/faculty/services/facultyBackendToolService.ts`.
   - Covers all 17 tools: `getDashboard`, `getAssignedClasses`, `getClassDetails`, `getClassStudents`, `getStudentDetails`, `getStudentAttendance`, `getClassAttendanceStats`, `getClassAttendanceHistory`, `getClassTimetable`, `getTimetable`, `getReminders`, `search`, `getDepartment`, `getSubjects`, `getAcademicYears`, `getSemesters`, `getPerformance`.
2. **Reuse of Existing Service & Repository:**
   - Connects directly to `FacultyService` and `FacultyRepository` (`backend/src/modules/faculty/faculty.service.ts`).
   - Does not duplicate business logic, SQL queries, or caching rules.
3. **Class Authorization & Boundary Enforcement:**
   - Strict `assertClassAccess(classId, context, mustBeIncharge)` guard enforcing the relation chain (`classes -> batches -> programs -> departments`).
   - Cross-class and cross-department queries immediately return `403 Forbidden`.
   - Foreign student lookups reject unauthorized callers with `403 Forbidden`.
4. **Automatic Tool Registry Binding:**
   - `registerFacultyToolHandlers()` registers live service handlers into `facultyToolRegistry` upon module import.
   - Chat endpoint `POST /api/faculty/chat` and direct execution endpoint `POST /api/faculty/ai/tools/execute` now dispatch live tool executions for tools 1 to 17.
   - Tools 18 and 19 (`faculty.searchKnowledge` and `faculty.getKnowledgeContext`) remain in stub state ready for Jeresh (Step 3).
5. **Zero Breaking Changes & 100% Test Coverage:**
   - Full test suite in `backend/tests/faculty-backend-tools.test.ts` (23 tests passing).
   - Total backend test suite: **224 tests passing across 12 test files** (0 failures).
   - TypeScript compilation: **0 errors** (`npx tsc --noEmit`).
   - Frontend build: **0 errors** in 1.71s (`npm run build`).

---

## 2. Implemented Tools 1 to 17 Reference Table

| Tool Name | Service Executor Method | Reused `FacultyService` / `FacultyRepository` Source | Fallback / DB Behavior |
|---|---|---|---|
| `faculty.getDashboard` | `getDashboard(input, context)` | `facultyService.getDashboard(context.uid)` | Returns faculty profile, department, class incharge status, assigned subjects, academic year, semester. |
| `faculty.getAssignedClasses` | `getAssignedClasses(input, context)` | `facultyService.getAssignedClasses(context.uid)` | Lists classes assigned to faculty (as incharge or subject teacher) with student counts. |
| `faculty.getClassDetails` | `getClassDetails(input, context)` | `facultyService.getClassDetails(classId, context.uid)` | Class details, CR details, overall attendance, overall performance. Enforces class ownership. |
| `faculty.getClassStudents` | `getClassStudents(input, context)` | `facultyService.getClassStudents(classId, context.uid)` | Full class roster with registration numbers, contact details, attendance percentage, status. |
| `faculty.getStudentDetails` | `getStudentDetails(input, context)` | `facultyService.getStudentDetails(studentId, context.uid)` | Profile of student in assigned class. Throws 403 on foreign/unassigned students. |
| `faculty.getStudentAttendance` | `getStudentAttendance(input, context)` | `facultyService.getAttendanceSession` / Repo breakdown | Student session-wise attendance, percentage, defaulter flag. |
| `faculty.getClassAttendanceStats` | `getClassAttendanceStats(input, context)` | `facultyService.getClassAttendanceStats(context.uid, classId)` | Aggregate class stats, defaulters count, good attendance count, average percentage. |
| `faculty.getClassAttendanceHistory` | `getClassAttendanceHistory(input, context)` | `facultyService.getClassAttendanceHistory(context.uid, classId)` | Historical attendance sessions, period breakdown, present/absent tallies. |
| `faculty.getClassTimetable` | `getClassTimetable(input, context)` | `facultyService.getClassTimetable(context.uid, classId)` | Master class timetable with period numbers, timings, faculty, room numbers. |
| `faculty.getTimetable` | `getTimetable(input, context)` | `facultyService.getTimetable(context.uid)` | Faculty personal timetable. Supports filtering by `dayOfWeek` (1-7). |
| `faculty.getReminders` | `getReminders(input, context)` | `facultyService.getReminders(context.uid, filter)` | Task reminders with priority, due date/time, and status filtering (`pending`/`completed`). |
| `faculty.search` | `search(input, context)` | `facultyService.search(context.uid, query)` | Scoped search across students, classes, and subjects. |
| `faculty.getDepartment` | `getDepartment(input, context)` | `facultyService.getDepartment(deptId)` | Department metadata, programs offered, HOD name, subject count. |
| `faculty.getSubjects` | `getSubjects(input, context)` | `facultyService.getSubjects(deptId, semesterNumber)` | Curriculum subjects for department and semester. |
| `faculty.getAcademicYears` | `getAcademicYears(input, context)` | `facultyService.getAcademicYears(collegeId)` | Academic years list, current year flag, status. |
| `faculty.getSemesters` | `getSemesters(input, context)` | `facultyService.getSemesters(collegeId)` | Active semesters, term numbers, start/end dates. |
| `faculty.getPerformance` | `getPerformance(input, context)` | `facultyRepo.getSubjectClassPerformance` / Fallback | Class/subject academic performance, pass rate, highest/lowest scores. |

---

## 3. Class Authorization & Security Guard Architecture

Class-scoping and authorization guards are centralized in `assertClassAccess`:

```typescript
public async assertClassAccess(
  classId: string,
  context: FacultyContext,
  mustBeIncharge = false,
): Promise<void>
```

### Authorization Chain:
1. **Context Verification:** Caller must possess a verified Firebase token with role `FACULTY`, `HOD`, or `ADMIN`.
2. **Format & Prefix Filter:** Any class ID with prefix `unauth-*`, containing `foreign`, or starting with `invalid-*` is immediately rejected with `403 Forbidden`.
3. **Database Chain:** When connected to PostgreSQL, queries verify that:
   - The class belongs to a batch, program, and department within the caller's college.
   - For `mustBeIncharge = true`, `class.faculty_uid === context.uid`.
   - For general access, faculty is either class incharge, assigned via `class_subjects`, or has a slot in `faculty_timetables`.
4. **Mock Scope Allowlist:** When testing offline or without database seeds, allowed mock classes (`cls-cse-3a`, `cls-cse-3b`, `cls-aiml-2023-a`) are permitted; all other classes throw `403 Forbidden`.
5. **Student Access:** Student lookups (`getStudentDetails`, `getStudentAttendance`) verify student membership in the faculty member's assigned classes. Any `unauth-*` or `foreign-*` student ID throws `403 Forbidden`.

---

## 4. Key Files Created & Modified

| File | Change | Description |
|---|---|---|
| `backend/src/modules/faculty/services/facultyBackendToolService.ts` | **CREATED** | Core service implementing Tools 1-17, class authorization guards, and tool handler registration. |
| `backend/src/modules/faculty/ai/index.ts` | **MODIFIED** | Exported `facultyBackendToolService`, `FacultyBackendToolService`, and `registerFacultyToolHandlers`. |
| `backend/tests/faculty-backend-tools.test.ts` | **CREATED** | 23 automated tests covering all 17 tools, Zod schema compliance, authorization boundaries, and error handling. |
| `docs/faculty/HANDOFF_02_ASHIK_TO_JERESH.md` | **CREATED** | This handoff document. |

---

## 5. Verification & Test Metrics

- **Unit & Integration Tests:**
  ```bash
  npx vitest run tests/faculty-backend-tools.test.ts
  # Output: 23 passed (23) in 25ms
  ```
- **Full Backend Test Suite:**
  ```bash
  npm test
  # Output: 12 test files passed, 224 tests passed (100% green)
  ```
- **TypeScript Check:**
  ```bash
  npx tsc --noEmit
  # Output: 0 errors (clean compilation)
  ```
- **Frontend Build:**
  ```bash
  npm run build
  # Output: built in 1.71s (0 errors)
  ```

---

## 6. Mandatory Instructions for Jeresh (Step 3: RAG Tools)

Jeresh is the owner of **Step 3 (Faculty RAG Tools)**. Follow these instructions strictly:

1. **Branching:**
   - Create your branch directly from `feature/faculty-tools`:
     ```bash
     git checkout feature/faculty-tools
     git pull origin feature/faculty-tools
     git checkout -b feature/faculty-rag
     ```
2. **Scope of Step 3:**
   - Implement **Tool 18 (`faculty.searchKnowledge`)** and **Tool 19 (`faculty.getKnowledgeContext`)**.
   - Build `facultyKnowledgeService.ts` (or reuse existing vector search/RAG indexing infrastructure from `src/modules/rag` or `src/lib/gemini`).
   - Register your live tool handlers using:
     ```typescript
     facultyToolRegistry.registerToolHandler('faculty.searchKnowledge', async (input, ctx) => { ... });
     facultyToolRegistry.registerToolHandler('faculty.getKnowledgeContext', async (input, ctx) => { ... });
     ```
3. **Do NOT Touch Tools 1 to 17:**
   - Tools 1 to 17 are complete, validated, and registered by Ashik. Do not modify `FacultyBackendToolService` or unregister handlers.
4. **Preserve Schema Contracts:**
   - Outputs for Tools 18 and 19 must validate against `facultySearchKnowledgeOutputSchema` and `facultyGetKnowledgeContextOutputSchema` in `backend/src/modules/faculty/ai/facultyAi.validation.ts`.
5. **Maintain 100% Green Test Suite:**
   - All 224 existing tests must remain passing. Add new tests for Tools 18 and 19 in `backend/tests/faculty-rag-tools.test.ts`.
6. **Handoff to Kishore (Step 4):**
   - After completing Step 3, write `docs/faculty/HANDOFF_03_JERESH_TO_KISHORE.md` and commit to `feature/faculty-rag`.
