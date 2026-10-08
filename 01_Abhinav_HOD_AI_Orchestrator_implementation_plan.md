# College LMS — HOD Sequential AI Implementation Workflow

## Source of Truth

Repository: `BIHER-LMS/College-LMS`

Before implementation, read the complete:
- `MASTER_DOCUMENTATION.md`
- existing HOD module code
- existing authentication/authorization middleware
- existing service/repository patterns
- existing tests

The Master Documentation is authoritative for the current project architecture. Do not replace its terminology or architecture with a newly invented architecture.

## Mandatory Sequential Rule

HOD development is strictly sequential:

```text
1. Abhinav
      ↓
2. Varun
      ↓
3. Harini
      ↓
4. Faisal
      ↓
5. Adhithi
```

A developer MUST NOT begin their implementation until:
1. the previous developer has completed their task;
2. the previous developer's PR/changes are available on the HOD development branch or otherwise explicitly handed off;
3. the previous developer has created the required HOD handoff documentation;
4. the current developer has read that handoff documentation;
5. the current developer has verified the actual code/interfaces in the repository.

Do not rely only on verbal explanations.

## Handoff Principle

Every completed developer must leave behind a machine-readable handoff document for the next developer.

The handoff must contain:

- What was implemented
- Exact files changed
- Exact functions/classes/types created or changed
- Exact API endpoints
- Exact tool names
- Exact input schemas
- Exact output schemas
- Exact import paths
- Existing functions/services/repositories reused
- Environment variables added, if any
- Dependencies added, if any
- Database tables/columns used
- Authorization assumptions
- Error codes/behaviors
- Tests added/run
- Known limitations
- Known bugs
- Integration instructions
- Files the next developer must NOT modify
- Example requests/responses where relevant

If an item does not apply, write `NONE`. Never leave the next developer guessing.

## No Interface Drift

Once an interface is handed off, the next developer must consume the exact interface.

Do NOT create variants such as:

```text
getDb()
getDatabase()
getDatabaseConnection()
queryDatabase()
```

when a previous developer already documented a canonical interface.

Search the repository before creating any function, type, route or tool.

## Security Rules

Never:
- trust role/UID/college/department authorization values from the client;
- expose database credentials to the LLM;
- give the LLM arbitrary SQL access;
- add direct frontend `supabase.from()` or `supabase.rpc()` access;
- bypass Firebase authentication;
- bypass backend RBAC/tenant isolation;
- weaken RLS;
- modify another module unnecessarily.

The backend is the authorization enforcement point because the documented PostgreSQL owner connection bypasses RLS.

## Git Rules

Work only on the assigned feature branch.

Never push directly to:
- `main`
- `hod`
- `faculty`
- `student`

Use:

```bash
git fetch --all
git status
git checkout <ASSIGNED_BRANCH>
git pull origin <ASSIGNED_BRANCH>
```

Before handoff:

```bash
git status
git diff
# run relevant tests/build
git add <relevant files>
git commit -m "<type>(hod): <description>"
git push origin <ASSIGNED_BRANCH>
```

Create/update the appropriate PR according to the team's branch policy.

## Handoff File Naming

Store the handoff document inside the HOD implementation/documentation area, using the exact name specified in each person's plan.

Do not overwrite another developer's handoff.

The handoff document is part of the implementation deliverable, not optional documentation.

# 01 — Abhinav: HOD AI Orchestrator + Canonical Contract

## Role

Owner: Abhinav
Branch: `feature/hod-ai-orchestrator`

## Your Position in the Chain

You are FIRST.

Nobody implements HOD chatbot integrations before your shared contract is finalized.

Your job is NOT to finish every chatbot feature. Your first responsibility is to establish the stable interfaces that the next developers must follow.

## Primary Deliverables

Implement/define:

1. HOD chatbot backend entry point/API contract.
2. HOD AI orchestration architecture.
3. Canonical HOD tool registry contract.
4. Canonical request/response types.
5. HOD authentication/context integration using existing project mechanisms.
6. Tool validation conventions.
7. Safe error contract.
8. Integration instructions for Varun and the later developers.

## Existing Architecture to Reuse

Inspect and reuse the documented patterns in:
- `backend/src/app.ts`
- `backend/src/server.ts`
- existing route mounting
- `backend/src/middleware/**`
- existing Firebase authentication middleware
- existing role/context builders
- existing Zod validation
- existing centralized error handling
- existing rate limiting
- existing audit logging
- `backend/src/modules/hod_temp/**` if present

Do NOT create a second authentication or authorization framework.

## Canonical Tool Contract

Establish one stable HOD contract.

The planned public tool names are:

```text
hod.getAttendanceSummary
hod.getStudentAttendance
hod.getClassAttendance
hod.getDepartmentAttendance
hod.getAttendanceAnalytics
hod.searchKnowledge
hod.getKnowledgeContext
```

Before creating them, search the repository. If equivalent canonical names already exist, preserve the existing names and document them.

For every tool define:

```text
name
purpose
input schema
output schema
authorization requirement
executor/import path
error behavior
```

Do not expose Prisma, SQL, database credentials or generic database execution to the LLM.

## Critical Design

```text
HTTP request
 -> existing Firebase authentication
 -> trusted HOD context
 -> Zod request validation
 -> AI orchestrator
 -> canonical tool registry
 -> approved backend tool
 -> structured result
 -> LLM response formatting
 -> API response
```

The LLM may select approved tools but must never become the authorization layer.

## Required Shared Contract Document

Create:

```text
docs/hod/HOD_AI_TOOL_CONTRACT.md
```

If the repository has an existing documentation convention, use that convention but preserve this exact content.

The contract MUST include:
- exact endpoint
- exact HTTP method
- request schema
- response schema
- exact tool names
- tool input schemas
- tool output schemas
- exact import paths
- authorization context
- errors
- examples

This is the primary machine-readable handoff for Varun.

## Handoff Document

Create:

```text
docs/hod/HANDOFF_01_ABHINAV_TO_VARUN.md
```

Include:

```text
STATUS: COMPLETE
NEXT OWNER: VARUN
BRANCH: feature/hod-analytics-tools

IMPLEMENTED FILES:
...

EXACT FUNCTIONS:
...

EXACT TYPES:
...

EXACT TOOL CONTRACTS:
...

EXACT IMPORT PATHS:
...

API CONTRACT:
...

AUTHORIZATION:
...

DATABASE ACCESS EXPECTATION:
...

ERROR CONTRACT:
...

TESTS:
...

HOW VARUN MUST IMPLEMENT:
...

FILES VARUN MUST NOT MODIFY:
...

KNOWN LIMITATIONS:
...
```

Do not say "use the existing service" without naming the exact service/file/function when known.

## Do Not Implement

Do not implement Varun's attendance SQL/business logic.

Do not implement Harini's RAG.

Do not implement Faisal's frontend.

Do not implement Adhithi's integration suite.

## Testing

At minimum:
- authentication failure
- unauthorized role
- invalid request
- tool not found
- malformed tool arguments
- safe error handling
- prompt injection does not bypass authorization
- existing backend tests remain green

## Completion Gate

You are NOT finished when the code compiles alone.

You are finished only when:
- canonical contracts exist;
- contract documentation exists;
- tests pass;
- handoff document exists;
- exact files/functions/imports are documented;
- Varun can implement without guessing.

Then stop. Do not begin Varun's task.

## Next Developer Instruction

Your final handoff must explicitly tell Varun:

> Read `HOD_AI_TOOL_CONTRACT.md` and `HANDOFF_01_ABHINAV_TO_VARUN.md` first. Implement only the attendance/analytics tools specified there. Do not rename the tools or create a second database interface.
