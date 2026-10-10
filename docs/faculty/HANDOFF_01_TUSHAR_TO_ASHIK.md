# Faculty AI Orchestrator Handoff: Tushar to Ashik

**STATUS:** COMPLETE  
**CURRENT OWNER:** TUSHAR (Step 1 of 5)  
**NEXT OWNER:** ASHIK (Step 2 of 5)  
**CURRENT BRANCH:** `feature/faculty-ai-orchestrator`  
**NEXT BRANCH:** `feature/faculty-tools`  

---

## 1. What Was Implemented

Tushar (Step 1) established the core Faculty/Class Incharge AI Chatbot orchestrator, canonical tool registry, request validation, prompt injection defense, and default schema-compliant stub handlers for all 19 tools.

Specifically:
1. **Public Chat APIs:**
   - Mounted `POST /api/faculty/chat` (Primary Faculty Chat endpoint).
   - Mounted `POST /api/faculty/ai/chat` (Sub-router AI chat endpoint).
2. **Auxiliary Inspection & Execution Endpoints:**
   - `GET /api/faculty/ai/tools`: Lists all 19 canonical tools, parameter descriptions, and permissions.
   - `POST /api/faculty/ai/tools/execute`: Direct controlled tool execution for headless testing and verification.
3. **Canonical Tool Registry (`FacultyToolRegistry`):**
   - Freezes 19 canonical tool names without naming drift.
   - Provides realistic default stub handlers adhering 100% to output Zod schemas.
   - Features dynamic registration hook: `facultyToolRegistry.registerToolHandler(toolName, handler)` for Ashik (Step 2: backend data tools) and Jeresh (Step 3: RAG).
   - Enforces identity isolation: client-supplied `uid`, `facultyUid`, `collegeId`, `departmentId` are unconditionally stripped prior to tool execution.
4. **Prompt Injection & Input Sanitization:**
   - Detects jailbreak patterns, system prompt revelation, and SQL injection attempts.
   - Neutralizes suspicious inputs with safe boundary responses without crashing.
   - Strips malicious HTML/script tags.
5. **Existing Authentication Reuse:**
   - Consistently relies on `facultyAuthMiddleware` and `requireFaculty`.
   - Never creates redundant or parallel token verification schemes.
   - Binds verified `FacultyContext` to all tool executions.
6. **Automated Vitest Test Suite:**
   - 39 automated tests in `backend/tests/faculty-ai-orchestrator.test.ts`.
   - 100% pass rate: all 201 backend tests are green.
7. **Canonical Documentation:**
   - Contract: `docs/faculty/FACULTY_AI_TOOL_CONTRACT.md`.
   - Handoff: `docs/faculty/HANDOFF_01_TUSHAR_TO_ASHIK.md`.

---

## 2. Implemented Files

| File | Purpose |
|------|---------|
| `backend/src/modules/faculty/ai/facultyAi.types.ts` | Canonical tool names array (`FACULTY_TOOL_NAMES`), `FacultyContext`, chat request/response interfaces, typed I/O interfaces for all 19 tools. |
| `backend/src/modules/faculty/ai/facultyAi.validation.ts` | Zod validation schemas for chat requests, direct execution, and input/output schemas for all 19 tools. |
| `backend/src/modules/faculty/ai/toolRegistry.ts` | `FacultyToolRegistry` class, default schema-compliant stub handlers, metadata catalog, dynamic handler registration. |
| `backend/src/modules/faculty/ai/facultyAi.service.ts` | `FacultyAiOrchestratorService` with prompt sanitizer, regex intent detection, tool execution dispatcher, response synthesizer. |
| `backend/src/modules/faculty/ai/facultyAi.controller.ts` | `FacultyAiController` handling `chat`, `listTools`, `executeTool`. |
| `backend/src/modules/faculty/ai/facultyAi.routes.ts` | Sub-router mounted at `/api/faculty/ai`. |
| `backend/src/modules/faculty/ai/index.ts` | Central barrel export for all types, schemas, services, and registries. |
| `backend/src/modules/faculty/faculty.routes.ts` | Mounted `POST /api/faculty/chat` and `router.use('/ai', facultyAiRoutes)`. |
| `backend/tests/setup.ts` | Added `authedUser` and `department` mock models to Prisma test client. |
| `backend/tests/faculty-ai-orchestrator.test.ts` | 39 automated unit and integration tests. |
| `docs/faculty/FACULTY_AI_TOOL_CONTRACT.md` | Frozen tool contracts and architecture specifications. |
| `docs/faculty/HANDOFF_01_TUSHAR_TO_ASHIK.md` | This handoff guide. |

---

## 3. Exact Classes, Functions & Types Created

### Classes & Singletons
- `facultyToolRegistry` (`FacultyToolRegistry`):
  - `registerToolHandler<TInput, TOutput>(name: FacultyToolName, handler: ToolHandler<TInput, TOutput>): void`
  - `executeTool(name: string, rawArgs: Record<string, any>, context: FacultyContext): Promise<ToolExecutionResult>`
  - `listTools(): ToolMetadata[]`
  - `getToolMetadata(name: FacultyToolName): ToolMetadata`
  - `resetToDefaultStubs(): void`
- `facultyAiOrchestratorService` (`FacultyAiOrchestratorService`):
  - `processChat(request: FacultyChatRequest, context: FacultyContext): Promise<FacultyChatResponseData>`
  - `sanitizeAndValidateInput(message: string): { sanitized: string; isSuspicious: boolean }`
  - `detectToolIntent(message: string): { toolName: FacultyToolName | null; args: Record<string, any> }`
  - `synthesizeResponse(userMessage: string, toolsExecuted: ToolExecutionResult[], context: FacultyContext, isSuspicious?: boolean): string`
- `facultyAiController` (`FacultyAiController`):
  - `chat(req: Request, res: Response, next: NextFunction): Promise<void>`
  - `listTools(req: Request, res: Response, next: NextFunction): Promise<void>`
  - `executeTool(req: Request, res: Response, next: NextFunction): Promise<void>`

### Import Paths
```typescript
import {
  facultyToolRegistry,
  FACULTY_TOOL_NAMES,
  FacultyToolName,
  FacultyContext,
  toFacultyContext,
} from './src/modules/faculty/ai';
```

---

## 4. Exact Service & Repository Reuse Mapping for Ashik (Step 2)

Ashik should register live database handlers in `feature/faculty-tools` by connecting to the existing `FacultyService` (`backend/src/modules/faculty/faculty.service.ts`):

| Tool Name | Proposed Existing Service Method |
|---|---|
| `faculty.getDashboard` | `facultyService.getDashboard(context.uid)` |
| `faculty.getAssignedClasses` | `facultyService.getAssignedClasses(context.uid)` |
| `faculty.getClassDetails` | `facultyService.getClassDetails(context.uid, input.classId)` |
| `faculty.getClassStudents` | `facultyService.getClassStudents(context.uid, input.classId)` |
| `faculty.getStudentDetails` | `facultyService.getStudentDetails(context.uid, input.studentId)` |
| `faculty.getStudentAttendance` | `facultyService.getAttendanceStats(input.classId)` (or student session queries) |
| `faculty.getClassAttendanceStats` | `facultyService.getClassAttendanceStats(context.uid, input.classId)` |
| `faculty.getClassAttendanceHistory` | `facultyService.getClassAttendanceHistory(context.uid, input.classId)` |
| `faculty.getClassTimetable` | `facultyService.getClassTimetable(context.uid, input.classId)` |
| `faculty.getTimetable` | `facultyService.getTimetable(context.uid)` |
| `faculty.getReminders` | `facultyService.getReminders(context.uid)` |
| `faculty.search` | `facultyService.search(context.uid, input.query)` |
| `faculty.getDepartment` | `facultyService.getDepartment(context.uid)` |
| `faculty.getSubjects` | `facultyService.getSubjects(context.uid, input.semesterNumber)` |
| `faculty.getAcademicYears` | `facultyService.getAcademicYears(context.collegeId)` |
| `faculty.getSemesters` | `facultyService.getSemesters(context.collegeId, input.academicYearId)` |
| `faculty.getPerformance` | `facultyService.getMySubjectsPerformance(context.uid)` |
| `faculty.searchKnowledge` | Owned by Jeresh (Step 3: RAG) |
| `faculty.getKnowledgeContext` | Owned by Jeresh (Step 3: RAG) |

---

## 5. Authorization & Tenant/Class Access Rules
- **No Client Identity Trust:** Always use `context.uid`, `context.collegeId`, `context.departmentId`.
- **Existing Class Scoping:** Follow existing `facultyClassAccessSql` pattern: classes belong to the faculty member through active batches, programs, and department matching the faculty member's college and department.
- **Never bypass `facultyAuthMiddleware` or `requireFaculty`**.

---

## 6. Error Behavior Contract
- Missing token: `401 Unauthorized` (`{ error: 'Unauthorized: Firebase ID token required' }`).
- Non-faculty role (e.g. STUDENT): `403 Forbidden` (`{ error: 'Forbidden: Access restricted to Faculty...' }`).
- Inactive department or unapproved status: `403 Forbidden`.
- Unknown tool in execution: `{ status: 'error', error: { code: 'TOOL_NOT_FOUND' } }`.
- Invalid tool arguments: `{ status: 'error', error: { code: 'INVALID_TOOL_ARGUMENTS', details: [...] } }`.

---

## 7. Test & Build Execution Results
- **Vitest Unit & Integration Tests:** 39 tests passing (`backend/tests/faculty-ai-orchestrator.test.ts`).
- **Full Backend Test Suite:** 201 tests passing across 11 test suites.
- **TypeScript Compile Check:** `npx tsc --noEmit` exited with code 0 (zero errors).
- **Environment Variables Added:** NONE.
- **Packages Added:** NONE.

---

## 8. Known Limitations
- Stub Handlers: All 19 tools currently return realistic dummy data conforming to Zod output schemas with flag `_isStub: true`.
- Ashik (Step 2) will replace stubs 1-17 with live database queries.
- Jeresh (Step 3) will replace stubs 18-19 with ChromaDB/Pinecone/Gemini RAG queries.

---

## 9. Explicit List of Files Ashik Must NOT Modify
Ashik must NOT modify:
- `backend/src/modules/student/**` (Student OS / Student module)
- `backend/src/modules/hod_temp/**` (HOD module)
- `backend/src/modules/faculty/ai/facultyAi.types.ts` (Frozen contract types)
- `backend/src/modules/faculty/ai/facultyAi.validation.ts` (Frozen Zod schemas)
- `prisma/schema.prisma` (Database schema)
- Frontend files

---

## 10. Direct Instructions for Ashik

> Read `FACULTY_AI_TOOL_CONTRACT.md` and `HANDOFF_01_TUSHAR_TO_ASHIK.md` before changing code. Implement only the backend data/tool executors specified there. Reuse the existing Faculty service/repository and authorization functions. Do not create a second Faculty authorization layer.
