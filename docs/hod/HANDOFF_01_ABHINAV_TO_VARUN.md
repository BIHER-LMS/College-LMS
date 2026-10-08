# HOD AI Orchestrator Handoff: Abhinav to Varun

STATUS: COMPLETE  
CURRENT OWNER: ABHINAV  
NEXT OWNER: VARUN  
BRANCH: feature/hod-analytics-tools  

---

## 1. WHAT WAS IMPLEMENTED

Abhinav (Step 1) established the core HOD AI Chatbot backend entry point, safe tool execution pipeline, prompt injection defense, and canonical tool registry contracts for all 7 tools.

Specifically:
1. Created the HOD AI chat endpoint: `POST /api/hod/ai/chat` (mounted behind `requireHODOrAdmin`).
2. Created the tool inspection endpoint: `GET /api/hod/ai/tools`.
3. Created the direct controlled tool execution endpoint: `POST /api/hod/ai/tools/execute`.
4. Implemented `HodToolRegistry` managing canonical contracts for the 7 tools, including default schema-compliant stubs for seamless testing prior to live database integration.
5. Implemented `registerToolHandler(toolName, handler)` method enabling Varun (Step 2) and Harini (Step 3) to plug in live SQL and RAG implementations without touching the orchestrator engine.
6. Implemented Zod validation schemas for requests and for all 7 tool inputs and outputs.
7. Implemented prompt injection detection and tenant boundary validation ensuring HOD queries remain strictly locked to `context.departmentId` and `context.collegeId`.
8. Created 30 automated Vitest tests covering auth failure, role authorization, validation errors, unknown tools, malformed arguments, prompt injection, and tool registration. All 138 backend tests are green.

---

## 2. IMPLEMENTED FILES

- `backend/src/modules/hod_temp/ai/hodAi.types.ts`: Canonical TypeScript types and tool interfaces.
- `backend/src/modules/hod_temp/ai/hodAi.validation.ts`: Zod validation schemas for requests and all 7 tools.
- `backend/src/modules/hod_temp/ai/toolRegistry.ts`: Canonical `HodToolRegistry` class, default stubs, execution pipeline.
- `backend/src/modules/hod_temp/ai/hodAi.service.ts`: `HodAiOrchestratorService` with prompt sanitizer, tool dispatcher, executive response synthesizer.
- `backend/src/modules/hod_temp/ai/hodAi.controller.ts`: `HodAiController` handling `chat`, `listTools`, `executeTool`.
- `backend/src/modules/hod_temp/ai/hodAi.routes.ts`: Express routes protected by `requireHODOrAdmin`.
- `backend/src/modules/hod_temp/ai/index.ts`: Barrel export.
- `backend/src/modules/hod_temp/routes/hodRoutes.ts`: Mounted `/ai` sub-router.
- `backend/tests/hod-ai-orchestrator.test.ts`: 30 automated Vitest unit & integration tests.
- `docs/hod/HOD_AI_TOOL_CONTRACT.md`: Complete canonical API and tool contract documentation.
- `docs/hod/HANDOFF_01_ABHINAV_TO_VARUN.md`: This machine-readable handoff document.

---

## 3. EXACT FUNCTIONS & CLASSES

### Classes & Singletons
- `HodToolRegistry`: Singleton instance `hodToolRegistry` in `backend/src/modules/hod_temp/ai/toolRegistry.ts`
  - `registerToolHandler<TInput, TOutput>(toolName: HodToolName, handler: ToolHandler<TInput, TOutput>): void`
  - `executeTool(toolName: string, rawArgs: Record<string, any>, context: HODContext): Promise<ToolExecutionResult>`
  - `getRegisteredTools(): ToolMetadata[]`
  - `getToolMetadata(toolName: string): ToolMetadata`
  - `resetToDefaultStub(toolName?: HodToolName): void`
- `HodAiOrchestratorService`: Singleton instance `hodAiOrchestratorService` in `backend/src/modules/hod_temp/ai/hodAi.service.ts`
  - `processChat(request: HodChatRequest, context: HODContext): Promise<HodChatResponseData>`
  - `sanitizeAndValidateInput(message: string): { sanitized: string; isSuspicious: boolean }`
  - `detectToolIntent(message: string): { toolName: HodToolName | null; args: Record<string, any> }`
  - `synthesizeResponse(userMessage: string, toolsExecuted: ToolExecutionResult[], context: HODContext, isSuspicious: boolean): string`
- `HodAiController`: Singleton instance `hodAiController` in `backend/src/modules/hod_temp/ai/hodAi.controller.ts`
  - `chat(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>`
  - `listTools(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>`
  - `executeTool(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>`

---

## 4. EXACT TYPES

Exported from `backend/src/modules/hod_temp/ai/hodAi.types.ts`:
- `HOD_TOOL_NAMES`: Canonical array of 7 tool names.
- `HodToolName`: Union `'hod.getAttendanceSummary' | 'hod.getStudentAttendance' | 'hod.getClassAttendance' | 'hod.getDepartmentAttendance' | 'hod.getAttendanceAnalytics' | 'hod.searchKnowledge' | 'hod.getKnowledgeContext'`
- `HodChatRequest`: `{ message: string; history?: ChatMessage[]; toolChoice?: ToolChoiceOption }`
- `HodChatResponseData`: `{ message: string; toolsExecuted: ToolExecutionResult[]; metadata: { departmentId: string; collegeId: string; timestamp: string; model: string } }`
- `ToolExecutionResult`: `{ toolName: HodToolName; arguments: Record<string, any>; status: 'success' | 'error'; result?: any; error?: { code: string; message: string; details?: any }; executionDurationMs: number }`
- `ToolHandler<TInput, TOutput>`: `(input: TInput, context: HODContext) => Promise<TOutput>`
- `HodAttendanceSummaryInput`, `HodAttendanceSummaryOutput`
- `HodStudentAttendanceInput`, `HodStudentAttendanceOutput`
- `HodClassAttendanceInput`, `HodClassAttendanceOutput`
- `HodDepartmentAttendanceInput`, `HodDepartmentAttendanceOutput`
- `HodAttendanceAnalyticsInput`, `HodAttendanceAnalyticsOutput`
- `HodSearchKnowledgeInput`, `HodSearchKnowledgeOutput`
- `HodGetKnowledgeContextInput`, `HodGetKnowledgeContextOutput`

---

## 5. EXACT TOOL CONTRACTS FOR VARUN (TOOLS 1-5)

Varun is responsible for replacing the default stubs for the first 5 attendance tools:

### Tool 1: `hod.getAttendanceSummary`
- **Input:** `{ batchId?: string, classId?: string, startDate?: string, endDate?: string }`
- **Output:** `{ departmentId: string, departmentAverage: number, totalStudents: number, totalClasses: number, cohorts: Array<{ cohortName: string, batchId: string, percentage: number, studentCount: number, isAlert: boolean }>, dateRange: { startDate: string | null, endDate: string | null } }`

### Tool 2: `hod.getStudentAttendance`
- **Input:** `{ studentId: string, subjectId?: string, startDate?: string, endDate?: string }`
- **Output:** `{ studentId: string, studentName: string, registerNumber: string, classId: string, className: string, overallPercentage: number, isLowAttendance: boolean, totalSessions: number, attendedSessions: number, subjects: Array<{ subjectId: string, subjectCode: string, subjectName: string, percentage: number, attended: number, total: number }> }`

### Tool 3: `hod.getClassAttendance`
- **Input:** `{ classId: string, startDate?: string, endDate?: string }`
- **Output:** `{ classId: string, className: string, batch: string, section: string, classInchargeName: string | null, averagePercentage: number, totalStudents: number, presentTodayCount: number | null, atRiskStudentsCount: number, atRiskStudents: Array<{ studentId: string, studentName: string, registerNumber: string, percentage: number }> }`

### Tool 4: `hod.getDepartmentAttendance`
- **Input:** `{ startDate?: string, endDate?: string, filterBy?: 'all' | 'at_risk' | 'low_attendance' }`
- **Output:** `{ departmentId: string, departmentName: string, overallPercentage: number, totalClasses: number, totalStudents: number, atRiskCount: number, classes: Array<{ classId: string, className: string, averagePercentage: number, studentCount: number, atRiskCount: number }> }`

### Tool 5: `hod.getAttendanceAnalytics`
- **Input:** `{ timeframe?: 'week' | 'month' | 'semester' | 'academic_year', metric?: 'trends' | 'defaulters' | 'subject_breakdown' | 'distribution' }`
- **Output:** `{ timeframe: string, metric: string, trends: Array<{ period: string, percentage: number, sessionsHeld: number }>, defaulterBuckets: { below65: number, between65And75: number, above75: number }, insights: string[] }`

---

## 6. EXACT IMPORT PATHS

Varun must import canonical definitions using either:
```typescript
// Relative path from backend/src/modules/hod_temp/services/
import { hodToolRegistry } from '../ai/toolRegistry';
import type {
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
} from '../ai/hodAi.types';
import type { HODContext } from '../middleware/authMiddleware';
```

---

## 7. API CONTRACT

- Primary Chat Endpoint: `POST /api/hod/ai/chat`
- Tool Catalog: `GET /api/hod/ai/tools`
- Tool Execution Endpoint: `POST /api/hod/ai/tools/execute`
- Headers: `Authorization: Bearer <FIREBASE_ID_TOKEN>`

---

## 8. AUTHORIZATION & TENANT CONSTRAINTS

- All endpoints pass through `requireHODOrAdmin`.
- `req.hod: HODContext` contains verified `{ uid, email, role, departmentId, collegeId }`.
- Varun **MUST NOT** accept `departmentId` or `collegeId` from user input without asserting equality to `context.departmentId` and `context.collegeId`.
- Queries must always filter by `WHERE department_id = context.departmentId AND college_id = context.collegeId`.

---

## 9. DATABASE ACCESS EXPECTATION

- Database access must use Prisma (`backend/src/modules/hod_temp/config/db` or `backend/src/config/database`).
- Do not create a separate database connection pool.
- Never give the LLM raw SQL access or credentials.
- Note on Attendance Schema: If live attendance tables are not yet present in Prisma, calculate from existing relations (`Batch`, `Class`, `Student`, `FacultySubject`) with deterministic logic, or query the designated attendance source as documented in the master docs.

---

## 10. ERROR CONTRACT

- If a requested resource (e.g. `studentId` or `classId`) does not exist within the HOD's department, return a clean `NotFoundError` or return empty cohorts/students rather than throwing uncaught exceptions.
- Tool handler errors are automatically caught by `hodToolRegistry.executeTool` and formatted as:
  ```json
  {
    "status": "error",
    "error": {
      "code": "TOOL_EXECUTION_FAILED",
      "message": "<Safe error message>"
    }
  }
  ```

---

## 11. TESTS ADDED & STATUS

- Test file: `backend/tests/hod-ai-orchestrator.test.ts`
- Tests added: 30 tests covering:
  - Auth failure (401)
  - Unauthorized role (403 for FACULTY, STUDENT, unapproved accounts)
  - Missing or empty request validation (400)
  - Unknown tool handling
  - Malformed tool arguments
  - Prompt injection neutralization
  - Tenant isolation protection (cannot query outside department/college)
  - Default stub execution for all 7 tools
  - Custom handler registration (Varun simulation)
  - End-to-end `/api/hod/ai/chat` invocation
- Test execution: All 138 backend tests passing (`npm test`).
- TypeScript build: Zero errors (`npx tsc --noEmit`).

---

## 12. HOW VARUN MUST IMPLEMENT (STEP 2 INSTRUCTIONS)

1. Checkout branch `feature/hod-analytics-tools` (branch off `feature/hod-ai-orchestrator`).
2. Create service file: `backend/src/modules/hod_temp/services/hodAnalyticsToolService.ts`.
3. Implement the 5 attendance methods with Prisma queries scoped to `context.departmentId` and `context.collegeId`:
   - `getAttendanceSummary(input: HodAttendanceSummaryInput, context: HODContext)`
   - `getStudentAttendance(input: HodStudentAttendanceInput, context: HODContext)`
   - `getClassAttendance(input: HodClassAttendanceInput, context: HODContext)`
   - `getDepartmentAttendance(input: HodDepartmentAttendanceInput, context: HODContext)`
   - `getAttendanceAnalytics(input: HodAttendanceAnalyticsInput, context: HODContext)`
4. Register your handlers with `hodToolRegistry`:
   ```typescript
   hodToolRegistry.registerToolHandler('hod.getAttendanceSummary', (input, ctx) =>
     hodAnalyticsToolService.getAttendanceSummary(input, ctx)
   );
   hodToolRegistry.registerToolHandler('hod.getStudentAttendance', (input, ctx) =>
     hodAnalyticsToolService.getStudentAttendance(input, ctx)
   );
   hodToolRegistry.registerToolHandler('hod.getClassAttendance', (input, ctx) =>
     hodAnalyticsToolService.getClassAttendance(input, ctx)
   );
   hodToolRegistry.registerToolHandler('hod.getDepartmentAttendance', (input, ctx) =>
     hodAnalyticsToolService.getDepartmentAttendance(input, ctx)
   );
   hodToolRegistry.registerToolHandler('hod.getAttendanceAnalytics', (input, ctx) =>
     hodAnalyticsToolService.getAttendanceAnalytics(input, ctx)
   );
   ```
5. Write your tests in `backend/tests/hod-analytics-tools.test.ts`.
6. Create handoff document: `docs/hod/HANDOFF_02_VARUN_TO_HARINI.md`.

---

## 13. FILES VARUN MUST NOT MODIFY

- `backend/src/modules/hod_temp/ai/hodAi.routes.ts`
- `backend/src/modules/hod_temp/ai/hodAi.controller.ts`
- `backend/src/modules/hod_temp/ai/hodAi.validation.ts`
- `backend/src/modules/hod_temp/middleware/authMiddleware.ts`
- `backend/src/app.ts`

---

## 14. KNOWN LIMITATIONS

- Tools 1-5 currently return typed default stubs (`_isStub: true`) until Varun connects Prisma queries in Step 2.
- Tools 6-7 currently return typed default stubs (`_isStub: true`) until Harini connects the vector database/RAG in Step 3.

---

## 15. NEXT DEVELOPER INSTRUCTION

> **To Varun:** Read `docs/hod/HOD_AI_TOOL_CONTRACT.md` and `docs/hod/HANDOFF_01_ABHINAV_TO_VARUN.md` first. Implement only the attendance/analytics tools specified there. Do not rename the tools or create a second database interface.
