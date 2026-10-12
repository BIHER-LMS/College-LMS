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

# 03 — Harini: HOD RAG + Knowledge Retrieval

## Role

Owner: Harini
Branch: `feature/hod-rag`

## Prerequisites

DO NOT START until Varun has completed:

```text
docs/hod/HANDOFF_02_VARUN_TO_HARINI.md
docs/hod/HOD_AI_TOOL_CONTRACT.md
docs/hod/HANDOFF_01_ABHINAV_TO_VARUN.md
```

Read all of them.

Inspect the actual implementation referenced by the handoffs.

## Objective

Implement HOD knowledge retrieval for approved institutional, academic, policy and procedural information.

RAG is NOT the source of truth for live transactional data.

## RAG vs Database Boundary

Use RAG for:
- policies
- academic regulations
- institutional procedures
- approved department documentation
- other authorized knowledge documents

Do NOT use RAG for:
- today's attendance
- live student attendance
- live class counts
- live timetable
- current transactional records

Those use the backend tools already implemented by Varun or other approved services.

## Existing Code to Inspect

Read:
- `docs/**`
- existing Obsidian/project documentation references
- existing vector/RAG/retrieval implementation
- existing HOD module
- existing tool registry
- existing tenant/context utilities

Search the entire repository before adding any retrieval helper.

## Canonical Tools

Implement exactly the RAG contract:

```text
hod.searchKnowledge
hod.getKnowledgeContext
```

Use the exact input/output schemas from Abhinav's canonical contract.

Do NOT create:
- `getDb()`
- `getDatabase()`
- `getDatabaseConnection()`
- generic SQL tools

If document metadata must come from PostgreSQL, use an explicitly documented existing service/repository or coordinate a contract change. Do not silently invent one.

## RAG Flow

```text
HOD question
 -> orchestrator
 -> hod.searchKnowledge
 -> trusted tenant/department filtering
 -> retrieval
 -> structured chunks
 -> hod.getKnowledgeContext
 -> orchestrator
 -> grounded answer
```

## Tenant Isolation

Use trusted backend HOD context.

Never trust client-provided:
- college ID
- department ID
- role
- user ID

A document from another college must not be retrievable.

Department-restricted documents must respect the HOD's department scope.

## Sources

Return structured source metadata where supported:
- document ID
- title
- source
- chunk ID
- score
- scope metadata

Do not expose storage credentials or internal secrets.

## No-Result Behavior

If no relevant source exists:
- return a structured no-result response;
- do not fabricate policy;
- allow the orchestrator to provide the user-facing answer.

## Handoff Document

After implementation create:

```text
docs/hod/HANDOFF_03_HARINI_TO_FAISAL.md
```

This document is specifically for Faisal.

It must contain:
- exact RAG tool names
- exact endpoint/tool integration point
- exact input schema
- exact output schema
- exact response/source shape
- exact import paths
- files changed
- UI fields Faisal must render
- authentication expectations
- error states
- no-result states
- sample successful result
- sample no-result result
- known limitations
- files Faisal must not modify

## Important Handoff Instruction

Tell Faisal exactly:

```text
The UI must consume the documented response contract.
The UI must not query the vector store.
The UI must not query Supabase.
The UI must not calculate attendance.
The UI must not implement authorization.
```

## Testing

Test:
- correct HOD knowledge retrieval
- college isolation
- department isolation
- no-result query
- retrieval failure
- malformed input
- prompt injection
- source metadata
- existing backend regression tests

## Completion Gate

You are complete only when:
- RAG tools match the canonical contract;
- tenant/department filtering works;
- source metadata is structured;
- live database facts remain outside RAG;
- tests pass;
- handoff documentation is complete.

Then stop.

## Next Developer Instruction

Your final handoff must explicitly tell Faisal:

> Read `HANDOFF_03_HARINI_TO_FAISAL.md`, `HOD_AI_TOOL_CONTRACT.md`, and the previous handoffs before implementing the HOD chatbot UI. Consume the exact backend response contract; do not invent another API.
