# 01 — Tushar: Student AI Orchestrator + Chat API + Tool Contract

## Branch
`feature/student-ai-orchestrator`

## Position in the chain
You are FIRST. Do not start Ashik's work. Your deliverable is the stable contract the next AI agent must consume.

## Source of truth
Read `MASTER_DOCUMENTATION.md` completely, then inspect the current repository before writing code.

Relevant existing Student files:
- `backend/src/modules/student/student.routes.ts`
- `backend/src/modules/student/student.controller.ts`
- `backend/src/modules/student/student.service.ts`
- `backend/src/modules/student/student.repository.ts`
- `backend/src/modules/student/student.types.ts`
- `backend/src/modules/student/student.validation.ts`
- `backend/src/middleware/auth.middleware.ts`
- `backend/src/utils/errors.ts`
- `backend/src/utils/response.ts`

## Mandatory security model
Reuse the existing `authenticateFirebaseUser` + `buildStudentContext` flow. The documented Student gate requires role STUDENT, approved/active status, token-email binding, college consistency, department consistency, and class→batch→program→department→college consistency. Downstream functions receive trusted `studentContext`:
`{ uid, email, displayName, photoURL, role, collegeId, departmentId, classId, registerNumber }`.

Never authorize from request-body `uid`, `role`, `college_id`, `department_id`, `class_id`, or `register_number`.

## Objective
Implement:
1. Student chatbot API.
2. Existing Firebase authentication/context integration.
3. AI orchestrator.
4. One canonical Student tool registry.
5. Zod validation for tool inputs.
6. Structured tool/result contract.
7. Safe errors using existing project utilities.

Preferred conceptual route: `POST /api/student/chat`. Verify the actual route conventions first and freeze the exact final route in the contract document.

## Canonical chatbot tools
Search the repo first and map to existing Student services. Proposed names:
- `student.getDashboard`
- `student.getProfile`
- `student.getClass`
- `student.getBatch`
- `student.getProgram`
- `student.getDepartment`
- `student.getSubjects`
- `student.getClassIncharge`
- `student.getAcademicYears`
- `student.getSemesters`
- `student.getTimetable`
- `student.getAttendance`
- `student.searchKnowledge`
- `student.getKnowledgeContext`

These are chatbot tool names, not claims that wrappers already exist. Reuse the documented service methods where possible instead of duplicating business logic.

## LLM boundary
The LLM can select approved tools and format structured results. It must NOT receive Prisma, arbitrary SQL, `DATABASE_URL`, Supabase credentials, or unrestricted database access. Attendance/live Student facts must come from deterministic tools.

## RAG boundary
Live Student facts use Student data tools. Policy/procedure/approved knowledge queries may use the RAG tools.

## Contract document
Create `docs/student/STUDENT_AI_TOOL_CONTRACT.md` containing exact endpoint, method, request/response schema, exact tool names, input/output schemas, executor/import paths, auth rules, RAG boundary, and errors.

## Handoff document
Create `docs/student/HANDOFF_01_TUSHAR_TO_ASHIK.md` containing:
- exact files changed;
- exact functions/types;
- exact endpoint;
- exact tools and schemas;
- exact Student service/repository mapping;
- auth behavior;
- errors;
- tests/build results;
- known limitations;
- exact next steps for Ashik;
- files Ashik must not modify.

Never write a vague handoff such as “use the existing service”. Name the exact file/function.

## Git
```bash
git fetch --all
git checkout feature/student-ai-orchestrator
git pull origin feature/student-ai-orchestrator
git status
```
Only push the feature branch. Never push `main`, `hod`, `faculty`, or `student`.

## Tests
Verify valid Student auth, invalid/expired token, non-STUDENT denial, invalid context denial, malformed request, unknown tool, malformed tool arguments, prompt-injection resistance, safe provider/tool errors, and existing Student regressions.

## Do not modify
Student RAG, Student UI, Faculty, HOD, Prisma schema, RLS, or unrelated DevOps.

## Completion gate
Stop only when the tool/API contract is frozen, tests pass, and the handoff exists.

## Instruction to next developer
Your handoff must state: “Read `STUDENT_AI_TOOL_CONTRACT.md` and `HANDOFF_01_TUSHAR_TO_ASHIK.md` first. Implement only the documented Student data tools. Reuse `studentContext`, `studentService`, and `studentRepository`; do not invent a second authorization or database interface.”
