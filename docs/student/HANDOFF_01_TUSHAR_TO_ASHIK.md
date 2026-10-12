# HANDOFF 01: TUSHAR (Student AI Orchestrator) TO ASHIK (Student Data Tools)

**Author:** 01 — Tushar (Student AI Orchestrator)  
**Recipient:** 02 — Ashik (Student Data Tools)  
**Date:** 2026-10-11  
**Status:** COMPLETE & FROZEN  

---

## 1. Executive Summary

The Student AI Orchestrator and Chat API foundations are implemented and frozen. The canonical 14-tool registry, Zod schemas, input sanitization pipeline, and chat endpoints have been delivered and integrated into `student.routes.ts`.

Ashik, your role is to implement the **12 deterministic Student Data Tools** (Tools 1 to 12) wrapping the existing `studentService` singleton and methods.

> **MANDATORY INSTRUCTION TO ASHIK:**  
> Read `docs/student/STUDENT_AI_TOOL_CONTRACT.md` and `docs/student/HANDOFF_01_TUSHAR_TO_ASHIK.md` first. Implement only the documented Student data tools. Reuse `studentContext`, `studentService`, and `studentRepository`; do not invent a second authorization or database interface.

---

## 2. Exact Files Changed & Created

### Created:
1. `backend/src/modules/student/ai/studentAi.types.ts`:
   - `STUDENT_TOOL_NAMES`: 14 canonical tool names.
   - Types: `StudentToolName`, `StudentChatRequest`, `StudentChatResponseData`, `ToolExecutionResult`, `CanonicalToolDefinition`.
2. `backend/src/modules/student/ai/studentAi.validation.ts`:
   - Tool argument Zod schemas for all 14 tools (`toolArgumentSchemas`).
   - Chat request schemas: `studentChatRequestBodySchema`, `studentChatRequestSchema`.
   - Tool execution schemas: `directToolExecutionBodySchema`, `directToolExecutionSchema`.
3. `backend/src/modules/student/ai/toolRegistry.ts`:
   - `studentToolRegistry`: Singleton instance of `StudentToolRegistry`.
   - Method: `registerTool(tool: CanonicalToolDefinition)` to plug in Ashik's and Jeresh's implementations.
   - Method: `executeTool(name, rawArgs, context)`: validates arguments via Zod, catches errors, returns `ToolExecutionResult`.
   - Method: `listTools()`: returns tool metadata without execution handlers.
   - Includes fallback `defaultStubHandlers` for resilient offline operation and tests.
4. `backend/src/modules/student/ai/studentAi.service.ts`:
   - `studentAiOrchestratorService`: Singleton instance of `StudentAiOrchestratorService`.
   - Method: `sanitizeAndValidateInput(message)`: checks `INJECTION_PATTERNS`, strips unsafe HTML and control chars.
   - Method: `detectToolIntent(message)`: maps user intents to the 14 tools.
   - Method: `synthesizeResponse(userMessage, toolsExecuted, context, isSuspicious)`: Groq LLM grounding with local markdown formatting fallback.
   - Method: `processChat(request, context)`: main orchestrator pipeline.
5. `backend/src/modules/student/ai/studentAi.controller.ts`:
   - `studentAiController`: Endpoints `chat`, `listTools`, `executeTool`.
6. `backend/src/modules/student/ai/studentAi.routes.ts`:
   - Router mounted with `POST /chat`, `GET /tools`, `POST /tools/execute`.
7. `backend/src/modules/student/ai/index.ts`:
   - Export barrel for the Student AI module.
8. `docs/student/STUDENT_AI_TOOL_CONTRACT.md`:
   - The frozen tool and API specification contract.

### Modified:
1. `backend/src/modules/student/student.routes.ts`:
   - Exported `buildStudentContext(req, res, next)`.
   - Mounted `router.use('/ai', studentAiRoutes)`.
   - Aliased `router.post('/chat', validate(studentChatRequestBodySchema), (req, res, next) => studentAiController.chat(req, res, next))`.

---

## 3. Exact Endpoints

- `POST /api/student/ai/chat` (Aliased at `POST /api/student/chat`)
- `GET /api/student/ai/tools`
- `POST /api/student/ai/tools/execute`

---

## 4. Exact Service & Repository Mapping for Ashik (Tools 1–12)

Ashik, implement `backend/src/modules/student/services/studentDataToolService.ts` and register the following 12 tool handlers in `studentToolRegistry`:

| Tool Name | Target Method on `studentService` | Arguments Expected |
|---|---|---|
| `student.getDashboard` | `studentService.getDashboard(ctx)` | `{}` |
| `student.getProfile` | `studentService.getProfile(ctx)` | `{}` |
| `student.getClass` | `studentService.getClass(ctx)` | `{}` |
| `student.getBatch` | `studentService.getBatch(ctx)` | `{}` |
| `student.getProgram` | `studentService.getProgram(ctx)` | `{}` |
| `student.getDepartment` | `studentService.getDepartment(ctx)` | `{}` |
| `student.getSubjects` | `studentService.getSubjects(ctx, args.semesterNumber)` | `{ semesterNumber?: number }` |
| `student.getClassIncharge` | `studentService.getClassIncharge(ctx)` | `{}` |
| `student.getAcademicYears` | `studentService.getAcademicYears(ctx)` | `{}` |
| `student.getSemesters` | `studentService.getSemesters(ctx)` | `{}` |
| `student.getTimetable` | `studentService.getClassTimetable(ctx)` | `{}` |
| `student.getAttendance` | `studentService.getAttendance(ctx, args.date)` | `{ date?: string }` |

---

## 5. Security & Authorization Rules for Ashik

1. **Context Source of Truth:** Every tool consumes trusted `studentContext: StudentContext`.
2. **Zero IDOR:** Never accept `uid`, `classId`, `departmentId`, or `collegeId` from user input to scope records.
3. **Attendance Constraints:**
   - Attendance must preserve `attendance_session_id` FK (never `session_id`).
   - Percentages must evaluate:
     - `SAFE`: `>= 75%`
     - `CRITICAL`: `< 75%`
     - `NO_DATA`: `held === 0`
   - Calculate `safeMargin`: positive sessions safe to miss, or negative sessions needed to recover.
4. **Profile Updates Boundary:**
   - Only allow: `phone`, `address`, `city`, `state`, `profilePhotoUrl`, `bio`.
   - Never expose tool allowing changes to `role`, `department`, `class`, `batch`, `program`, `college`, or `registerNumber`.
5. **No Generic SQL/DB Tool:** Do NOT create `getDb()`, `queryDatabase()`, or arbitrary Prisma tools.

---

## 6. Files Ashik Must NOT Modify

- `backend/src/modules/student/ai/studentAi.types.ts` (tool names and shapes are frozen)
- `backend/src/modules/student/ai/studentAi.validation.ts` (Zod schemas are frozen)
- `backend/src/modules/student/ai/studentAi.service.ts` (orchestrator logic is owned by Tushar)
- `backend/src/modules/student/ai/studentAi.controller.ts`
- `backend/src/modules/student/ai/studentAi.routes.ts`
- `backend/src/modules/student/student.repository.ts` (unless an existing query bug is identified)
- HOD, Faculty, Admin modules, Prisma schema, or frontend files.

---

## 7. Next Steps for Ashik

1. Create `backend/src/modules/student/services/studentDataToolService.ts`.
2. Register tools 1–12 into `studentToolRegistry.registerTool(...)`.
3. Write test suite: `backend/tests/student-data-tools.test.ts`.
4. Produce `docs/student/HANDOFF_02_ASHIK_TO_JERESH.md`.
