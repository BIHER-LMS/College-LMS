# Handoff: Abhinav to Varun

STATUS: COMPLETE
NEXT OWNER: VARUN
BRANCH: feature/hod-ai-orchestrator (or feature/hod-analytics-tools, depending on your team's branch strategy)

## IMPLEMENTED FILES:
- `backend/src/modules/hod-ai/hod-ai.types.ts`
- `backend/src/modules/hod-ai/hod-ai.validation.ts`
- `backend/src/modules/hod-ai/hod-ai.tool-registry.ts`
- `backend/src/modules/hod-ai/hod-ai.orchestrator.ts`
- `backend/src/modules/hod-ai/hod-ai.controller.ts`
- `backend/src/modules/hod-ai/hod-ai.routes.ts`
- `backend/src/modules/hod-ai/index.ts`
- `backend/src/app.ts` (Modified: mounted `/api/hod/ai` routes)
- `docs/hod/HOD_AI_TOOL_CONTRACT.md`
- `backend/tests/hod-ai-orchestrator.test.ts`

## EXACT FUNCTIONS:
- `hodAIController.chat(req, res, next)`
- `hodAIController.getTools(req, res, next)`
- `hodAIController.health(req, res, next)`
- `hodAIOrchestrator.chat(context, request)`
- `toolRegistry.registerExecutor(toolName, executor)`
- `toolRegistry.executeTool(toolName, context, args)`

## EXACT TYPES:
Defined in `hod-ai.types.ts`:
- `HODAIContext`
- `HODAIChatRequest`
- `HODAIChatResponse`
- `HODAIToolDefinition`
- `ToolExecutor`
- `ToolExecutionResult`
- `HODAIErrorCodes`

## EXACT TOOL CONTRACTS:
1. `hod.getAttendanceSummary`
2. `hod.getStudentAttendance`
3. `hod.getClassAttendance`
4. `hod.getDepartmentAttendance`
5. `hod.getAttendanceAnalytics`
6. `hod.searchKnowledge` (For Harini)
7. `hod.getKnowledgeContext` (For Harini)

All exact inputs/outputs are detailed in `docs/hod/HOD_AI_TOOL_CONTRACT.md`.

## EXACT IMPORT PATHS:
You can import everything needed from the module barrel file:
```typescript
import { toolRegistry } from '../modules/hod-ai';
import type { ToolExecutor, HODAIContext, ToolExecutionResult } from '../modules/hod-ai';
```

## API CONTRACT:
**Endpoint**: `POST /api/hod/ai/chat`
**Auth**: Bearer Firebase ID Token
Requires the user to have the `HOD` or `COLLEGE_ADMIN` role and a valid `departmentId` and `collegeId` in their DB profile.

## AUTHORIZATION:
- Do **NOT** verify tokens or roles in your tool executors. The Orchestrator already does this.
- You **WILL** receive `context: HODAIContext` containing the user's `uid`, `departmentId`, and `collegeId`.
- **CRITICAL**: Use `context.departmentId` and `context.collegeId` in your Prisma/SQL queries to ensure the AI cannot fetch data outside the HOD's department. Do not trust the LLM to filter by department.

## DATABASE ACCESS EXPECTATION:
- Do **NOT** return raw Prisma objects or raw SQL results.
- Do **NOT** expose database credentials or Prisma clients to the LLM.
- Map your database results exactly to the output schemas defined in `HOD_AI_TOOL_CONTRACT.md`.

## ERROR CONTRACT:
- If a tool fails (e.g., class not found, invalid date), return:
  `{ success: false, data: null, error: "Human readable reason" }`
- Do **NOT** throw raw errors containing Prisma details. The orchestrator expects a graceful return of the error so it can inform the user (or LLM) what went wrong without leaking system details.

## TESTS:
- `backend/tests/hod-ai-orchestrator.test.ts` (Green)
- Covers auth failure, unauthorized role, malformed requests, tool validation, safe error handling, prompt injection protection, and schema validation.
- All existing tests in the suite remain green.

## HOW VARUN MUST IMPLEMENT:

> Read `HOD_AI_TOOL_CONTRACT.md` and `HANDOFF_01_ABHINAV_TO_VARUN.md` first. Implement only the attendance/analytics tools specified there. Do not rename the tools or create a second database interface.

1. Implement your executors in `backend/src/modules/hod-ai/tools/attendance.tools.ts` (you will need to create this file).
5. Register your executors with the registry, e.g.:
   ```typescript
   import { toolRegistry } from '../hod-ai.tool-registry';
   
   toolRegistry.registerExecutor('hod.getAttendanceSummary', async (context, args) => {
     // Your implementation using context.departmentId and context.collegeId
     return { success: true, data: { ... } };
   });
   ```
6. You will need to hook up your registration file so it executes at runtime (e.g., importing it in `backend/src/modules/hod-ai/index.ts` or `app.ts`).

## FILES VARUN MUST NOT MODIFY:
- Do not modify `backend/src/modules/hod-ai/hod-ai.types.ts`
- Do not modify `backend/src/modules/hod-ai/hod-ai.validation.ts`
- Do not modify `backend/src/modules/hod-ai/hod-ai.orchestrator.ts`
- Do not modify `backend/src/modules/hod-ai/hod-ai.routes.ts`
- Do not change the existing student/faculty core routing logic.

## KNOWN LIMITATIONS:
- Intent resolution is currently a deterministic keyword-based stub (`resolveToolCalls` in `hod-ai.orchestrator.ts`). When an actual LLM is integrated, that function should be replaced to use the LLM to select tools based on `toolRegistry.getToolDefinitions()`.
- Knowledge tools (`searchKnowledge`, `getKnowledgeContext`) remain as stubs returning `NOT_IMPLEMENTED` until Harini implements them.
