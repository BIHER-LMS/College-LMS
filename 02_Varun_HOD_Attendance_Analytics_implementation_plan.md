# College LMS — HOD Sequential AI Implementation Workflow

## Source of Truth

Repository: `BIHER-LMS/College-LMS`

Before implementation, read the complete:
- `MASTER_DOCUMENTATION.md`
- 'docs/hod/HANDOFF_01_ABHINAV_TO_VARUN.md'
- 'docs/hod/HOD_AI_TOOL_CONTRACT.md'
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

# 02 — Varun: HOD Attendance + Analytics

## Role

Owner: Varun
Branch: `feature/hod-analytics-tools`

## Prerequisite

DO NOT START until Abhinav has completed:

```text
docs/hod/HOD_AI_TOOL_CONTRACT.md
docs/hod/HANDOFF_01_ABHINAV_TO_VARUN.md
```

Read both files completely.

Then inspect the actual code referenced by those documents.

If the handoff contradicts the repository:
1. do not guess;
2. inspect the current implementation;
3. report the mismatch;
4. coordinate with Abhinav;
5. update the contract before implementation if necessary.

## Objective

Implement deterministic attendance and analytics backend tools that exactly match Abhinav's canonical contract.

You own data/business logic, not LLM orchestration.

## Existing Data to Inspect

The Master Documentation identifies:
- `attendance_sessions`
- `attendance_records`
- `class_timetables`
- `faculty_timetables`
- `faculty_reminders`

The documented `attendance_records` foreign key is:

```text
attendance_session_id
```

Never assume `session_id`.

Inspect the current schema before writing queries.

## Existing Code to Reuse

Inspect:
- existing Student attendance service/repository
- existing Faculty attendance service/repository
- class/batch/program/department/subject repositories
- existing SQL helpers
- existing authorization/context functions
- existing validation utilities

Reuse existing implementations where they already solve the problem.

Do not create another generic DB helper.

## Implement Exactly These Contract Tools

Use the exact names from Abhinav's handoff:

```text
hod.getAttendanceSummary
hod.getStudentAttendance
hod.getClassAttendance
hod.getDepartmentAttendance
hod.getAttendanceAnalytics
```

If Abhinav's handoff uses an existing equivalent name, use that exact documented name instead.

## Implementation Pattern

```text
trusted HOD context
 -> validate non-security input
 -> resolve academic entity
 -> enforce HOD college/department scope
 -> existing repository/service
 -> deterministic calculation
 -> structured output
```

Never trust:
- request body role
- request body HOD UID
- request body college ID as authorization
- request body department ID as authorization

## Structured Output

Return exact DTOs from Abhinav's contract.

Do not return an LLM-generated paragraph.

Do not allow the LLM to calculate authoritative attendance percentages.

## SQL

Use existing parameterized SQL/repository patterns.

Verify every column against the current schema.

The previously documented bug was an incorrect `ar.session_id` reference; the actual attendance record column is `attendance_session_id`. Preserve the fixed schema.

## Authorization

A HOD can only receive information permitted by the trusted HOD context.

Test:
- own department
- another department denied
- own college
- another college denied
- unauthorized role denied

## Handoff Document

After implementation create:

```text
docs/hod/HANDOFF_02_VARUN_TO_HARINI.md
```

This handoff is written specifically for Harini, but must also preserve the contract information needed by later developers.

Include:
- exact files changed
- exact attendance functions
- exact tool executors
- exact imports
- exact input/output types
- tables and columns used
- authorization checks
- errors
- tests
- examples
- known limitations
- files Harini must not modify
- confirmation that canonical tool names were not changed

## Required Handoff Section

Explicitly state:

```text
RAG MUST NOT replace these attendance tools for live database facts.

Use the attendance tools for:
- live attendance
- student attendance
- class attendance
- department attendance
- analytics
```

## Testing

Run:
- unit tests for calculations
- authorization tests
- tenant isolation tests
- malformed input tests
- no-data tests
- schema/SQL tests
- existing backend regression tests

## Completion Gate

You are complete only when:
- all contracted attendance tools work;
- tests pass;
- no unauthorized access exists;
- no duplicate DB abstraction exists;
- handoff documentation is complete.

Then stop.

## Next Developer Instruction

Your final handoff must explicitly tell Harini:

> Read `HANDOFF_02_VARUN_TO_HARINI.md` and the canonical HOD tool contract before implementing RAG. Do not use RAG for live attendance data and do not create a new database helper.
