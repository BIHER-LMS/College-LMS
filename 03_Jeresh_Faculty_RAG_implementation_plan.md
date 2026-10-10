# College LMS — Faculty / Class Incharge Sequential AI Implementation Workflow

## Source of Truth

Repository: `BIHER-LMS/College-LMS`

Primary project reference:
- `MASTER_DOCUMENTATION.md`

Read the complete `MASTER_DOCUMENTATION.md` before touching code.

The documented Faculty module is:

```text
backend/src/modules/faculty/
├── faculty.routes.ts
├── faculty.controller.ts
├── faculty.service.ts
├── faculty.repository.ts
├── faculty.types.ts
├── faculty.validation.ts
└── faculty.middleware.ts
```

Frontend Faculty module:

```text
frontend/src/modules/faculty/
├── api/facultyApi.ts
├── slices/facultySlice.ts
├── pages/**
└── related components/types
```

The current Faculty module is already hardened. The documented guarantees that MUST remain intact are:
- Firebase token verification
- `facultyAuthMiddleware`
- `requireFaculty`
- `verifiedFacultyUid(req)`
- `verifiedFacultyActor(req)`
- `facultyAccessSql`
- `facultyClassAccessSql`
- server-side authorization
- tenant isolation
- direct frontend Supabase access remaining zero
- existing attendance column fix using `attendance_session_id`
- no process-local fallback persistence
- no hardcoded fallback UID/college/department identity

## Mandatory Sequential Order

Faculty/Class Incharge development is strictly sequential:

```text
1. Tushar
   Faculty AI Orchestrator + Chat API + Tool Contract
        ↓
2. Ashik
   Faculty/Class Incharge Backend Tools
        ↓
3. Jeresh
   Faculty RAG + Knowledge Retrieval
        ↓
4. Kishore
   Faculty/Class Incharge Chatbot UI
        ↓
5. Aravind
   Final Integration + Testing
```

A person MUST NOT start before the previous person has:
1. completed implementation;
2. run tests/builds;
3. pushed their feature branch;
4. created the required handoff documentation;
5. explicitly documented exact files/functions/types/routes/tool contracts;
6. left the code in a consumable state.

The next AI agent MUST read the previous handoff document first and then verify it against the actual repository code.

## Critical Interface Rule

The handoff document is a machine-readable implementation contract.

Never solve a mismatch by silently inventing:
- another API endpoint;
- another tool name;
- another database helper;
- another auth helper;
- another DTO;
- another cache interface.

Search the repository first.

If an interface does not exist, the current owner may create it only when the current plan says it is their responsibility.

Once a canonical contract is documented, later developers MUST consume that exact contract.

## Security Rules

Never:
- trust `role`, `uid`, `college_id`, `department_id`, `class_id` or other authorization values from the browser as proof of access;
- bypass `facultyAuthMiddleware` / `requireFaculty`;
- bypass `verifiedFacultyUid(req)` or `verifiedFacultyActor(req)` when the existing Faculty code requires them;
- expose PostgreSQL/Supabase credentials to the LLM;
- give the LLM arbitrary SQL/Prisma/database access;
- add direct frontend `supabase.from()` or `supabase.rpc()` calls;
- weaken RLS or backend authorization;
- reintroduce process-local fallback persistence;
- reintroduce hardcoded UID/college/department fallbacks;
- modify Faculty authorization helpers just to make an AI tool work.

The backend connects as PostgreSQL owner and therefore bypasses RLS. Server-side authorization remains mandatory.

## Existing Faculty Authorization Contract

The Master Documentation defines:

### `facultyAuthMiddleware`
Verifies the Bearer Firebase ID token, resolves `authed_users`, and attaches `req.facultyUser`.

### `requireFaculty`
Enforces the Faculty/authorized academic-staff role.

### `verifiedFacultyUid(req)`
Independently verifies the Firebase token and returns the verified Firebase UID. This is used by all Faculty endpoints.

### `verifiedFacultyActor(req)`
Loads trusted `college_id` / `department_id` from `authed_users` and enforces Faculty role + approved status for department/college-scoped operations.

### `facultyAccessSql`
Scopes the Faculty identity to an active Faculty user in the correct tenant.

### `facultyClassAccessSql`
Scopes a class to the Faculty through:

```text
classes
 -> batches
 -> programs
 -> departments
```

with matching college + department and active Faculty identity.

All class, student and attendance chatbot tools MUST reuse these protections instead of creating a new authorization implementation.

## Documented Existing Faculty API Contract

Existing backend endpoints documented in `MASTER_DOCUMENTATION.md` include:

```text
GET    /api/faculty/dashboard
GET    /api/faculty/today-reminders
GET    /api/faculty/reminders/today
GET    /api/faculty/search?q=
GET    /api/faculty/profile
PATCH  /api/faculty/profile
GET    /api/faculty/departments
GET    /api/faculty/subjects?semester=
GET    /api/faculty/academic-years
GET    /api/faculty/semesters

GET    /api/faculty/classes
GET    /api/faculty/classes/:classId
GET    /api/faculty/classes/:classId/students
GET    /api/faculty/students/:studentId

GET    /api/faculty/attendance/session?classId&date&period
POST   /api/faculty/attendance/session
GET    /api/faculty/attendance/stats/:classId
GET    /api/faculty/attendance/history/:classId

GET    /api/faculty/timetable
POST   /api/faculty/timetable
POST   /api/faculty/timetable/bulk
DELETE /api/faculty/timetable/:id

GET    /api/faculty/reminders
POST   /api/faculty/reminders
PATCH  /api/faculty/reminders/:id
POST   /api/faculty/reminders/:id/toggle
DELETE /api/faculty/reminders/:id

POST   /api/faculty/classes/:classId/students/upload
POST   /api/faculty/classes/:classId/students
DELETE /api/faculty/classes/:classId/students/:studentUid
POST   /api/faculty/classes/:classId/representative
GET    /api/faculty/classes/:classId/timetable

GET    /api/faculty/performance/subjects/:subjectId
```

These existing HTTP endpoints are NOT permission to duplicate their logic inside the chatbot. The chatbot should reuse the underlying Faculty service/repository layer where possible.

## Existing Faculty Hardening That Must Not Regress

The documentation records these completed fixes:
- `ar.session_id` was corrected to `ar.attendance_session_id`;
- in-memory profile fallback was removed;
- timetable fallback UID behavior was removed;
- all Faculty endpoint identity resolution was changed to verified token identity;
- hardcoded fallback UID/department/college values were removed.

Any PR that reintroduces these problems is invalid.

## Frontend Authentication Rule

`frontend/src/modules/faculty/api/facultyApi.ts` already uses a request interceptor requiring a fresh Firebase token from:

```text
auth.currentUser.getIdToken()
```

Never replace this with localStorage token authentication.

## Git Workflow

Every developer must:

```bash
git clone <REPOSITORY_URL>
cd College-LMS
git fetch --all
git status
git branch -a
git checkout <ASSIGNED_BRANCH>
git pull origin <ASSIGNED_BRANCH>
```

Never push directly to:
- `main`
- `hod`
- `faculty`
- `student`

Only push the assigned feature branch.

Before the handoff:

```bash
git status
git diff
# run relevant tests/build
git add <only-relevant-files>
git commit -m "<type>(faculty): <description>"
git push origin <ASSIGNED_BRANCH>
```

## Required Handoff Documentation

Every developer must create a dedicated handoff file for the NEXT developer.

The handoff must contain:
- completion status
- previous branch
- next branch
- exact files changed
- exact functions/classes/types created or changed
- exact API endpoint(s)
- exact tool names
- exact input schema
- exact output schema
- exact import paths
- exact existing functions/services/repositories reused
- authorization rules
- tenant/class access rules
- database tables/columns used
- error behavior
- tests executed
- build command/result
- environment variables added, if any
- packages added, if any
- known limitations
- known issues
- integration instructions
- explicit list of files the next developer must not modify

If a field does not apply, write `NONE`.

## No Guessing Rule

If the previous handoff says:

```text
faculty.getClassAttendanceStats
```

do not change it to:

```text
getAttendanceStats
faculty.fetchClassAttendanceStats
getClassStats
```

Use the exact canonical name.

If the previous developer says:

```text
import X from path Y
```

verify it in the repository and reuse it.

## Shared Faculty Chatbot Tool Contract

The FIRST developer, Tushar, is responsible for finalizing the chatbot tool contract.

The following are the proposed capabilities to be confirmed against the repository and then frozen as the shared contract:

```text
faculty.getDashboard
faculty.getAssignedClasses
faculty.getClassDetails
faculty.getClassStudents
faculty.getStudentDetails
faculty.getStudentAttendance
faculty.getClassAttendanceStats
faculty.getClassAttendanceHistory
faculty.getClassTimetable
faculty.getTimetable
faculty.getReminders
faculty.search
faculty.getDepartment
faculty.getSubjects
faculty.getAcademicYears
faculty.getSemesters
faculty.getPerformance
faculty.searchKnowledge
faculty.getKnowledgeContext
```

These are NEW AI-tool interface names, not claims that the current repository already contains all of these functions.

Tushar must:
1. search the repository for existing equivalents;
2. map each chatbot tool to the existing service/repository function where available;
3. rename/reduce the list when an existing project convention requires it;
4. freeze the final exact contract in documentation before Ashik starts.

The LLM must never call the existing HTTP endpoints from inside the backend through HTTP. Prefer direct calls into the approved Faculty service/tool layer.

## Completion Chain

```text
Tushar
  -> canonical chatbot contract
  -> HANDOFF_01
       ↓
Ashik
  -> backend Faculty/Class Incharge tools
  -> HANDOFF_02
       ↓
Jeresh
  -> Faculty RAG
  -> HANDOFF_03
       ↓
Kishore
  -> Faculty/Class Incharge chatbot UI
  -> HANDOFF_04
       ↓
Aravind
  -> integration + regression + security
  -> FINAL HANDOFF
```

# 03 — Jeresh: Faculty / Class Incharge RAG + Knowledge Retrieval

## Owner

Jeresh

## Branch

```text
feature/faculty-rag
```

## Prerequisites

DO NOT START until Ashik has completed:

```text
docs/faculty/HANDOFF_02_ASHIK_TO_JERESH.md
docs/faculty/FACULTY_AI_TOOL_CONTRACT.md
docs/faculty/HANDOFF_01_TUSHAR_TO_ASHIK.md
```

Read them completely.

Verify all referenced code before implementation.

## Objective

Implement Faculty/Class Incharge RAG for authorized institutional and academic knowledge.

## RAG Is NOT Live Data

Use RAG for:
- college/department policies
- academic procedures
- approved Faculty/Class Incharge guides
- teaching/administrative documentation
- approved knowledge documents

Do NOT use RAG for:
- live student lists
- current attendance
- current class timetable
- reminders
- live performance numbers
- current Faculty profile
- current assigned classes

Those must use deterministic Faculty tools.

## Existing Code to Inspect

Search the repository for:
- RAG
- retrieval
- embeddings
- vector store
- document loaders
- knowledge
- citations
- chunking
- tenant filters

Also inspect:
- `docs/**`
- Obsidian/project documentation
- existing AI infrastructure
- existing secure data/context utilities

Reuse compatible existing implementations.

## Canonical RAG Contract

Implement the exact contract from Tushar's document:

```text
faculty.searchKnowledge
faculty.getKnowledgeContext
```

If the final Tushar contract uses a different canonical name, use it exactly.

Do not create:
- `getDb()`
- `getDatabase()`
- `queryDatabase()`
- generic SQL AI tools

## Authorization

RAG access must use trusted Faculty context.

Where knowledge is:
- college-wide -> filter by authenticated Faculty college;
- department-private -> filter by authenticated Faculty department;
- Faculty-role/private -> filter by role/tenant metadata.

Never trust client-provided tenant IDs as authorization.

## Grounding

If relevant documents exist:
- return structured chunks/context;
- retain source metadata;
- preserve document identity;
- do not fabricate policy.

If no relevant document exists:
- return a structured no-result response;
- do not invent an answer.

## Source Metadata

Where supported, return:

```text
documentId
title
source
chunkId
relevanceScore
scope metadata
```

Use the existing project's actual field names where already defined.

## Handoff to Kishore

Create:

```text
docs/faculty/HANDOFF_03_JERESH_TO_KISHORE.md
```

Include:
- exact RAG tool names
- exact input schema
- exact output schema
- source/citation schema
- exact import paths
- exact API/tool integration path
- no-result shape
- error shape
- tenant/department filtering
- files changed
- tests
- build result
- known limitations
- exact UI fields Kishore must render
- files Kishore must not modify

## UI Integration Instruction

Tell Kishore:

```text
The frontend consumes the backend's exact response contract.
The frontend does not perform vector search.
The frontend does not access Supabase.
The frontend does not calculate attendance.
The frontend does not implement authorization.
The frontend only renders authoritative backend results.
```

## Testing

Test:
- Faculty gets authorized knowledge
- another college's knowledge blocked
- unauthorized department content blocked
- no-result query
- retrieval failure
- malformed query
- prompt injection
- source metadata
- tenant filtering

## Completion Gate

Stop after:
- RAG tools match the shared contract;
- security tests pass;
- handoff exists.

## Next Developer Instruction

Your handoff must tell Kishore to read all previous handoffs and use the exact backend chatbot response contract rather than inventing a new API.
