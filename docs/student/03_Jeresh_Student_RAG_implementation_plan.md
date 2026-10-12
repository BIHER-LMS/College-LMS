# 03 — Jeresh: Student RAG + Knowledge Retrieval

## Branch
`feature/student-rag`

## Prerequisite
Do not start until these are complete and read:
- `docs/student/HANDOFF_02_ASHIK_TO_JERESH.md`
- `docs/student/STUDENT_AI_TOOL_CONTRACT.md`
- `docs/student/HANDOFF_01_TUSHAR_TO_ASHIK.md`

Verify every referenced symbol in the repository.

## Objective
Implement Student RAG for approved academic/institutional knowledge.

## RAG boundary
Use RAG for:
- student policies;
- academic regulations;
- examination procedures;
- approved attendance-policy explanations;
- approved institutional/student guides.

Do NOT use RAG for:
- current attendance;
- current timetable;
- current subjects;
- current class/program/department;
- Student profile/current records.

Those use deterministic Student tools.

## Existing infrastructure first
Search the entire repository for existing RAG, embeddings, vector, retrieval, chunking, citations, and document-loader infrastructure. Reuse compatible code. Do not create a second RAG subsystem unless explicitly required.

## Canonical tools
Use the exact names frozen by Tushar, expected to be:
- `student.searchKnowledge`
- `student.getKnowledgeContext`

Do not rename them and do not create generic DB helpers such as `getDb()` or `getDatabase()`.

## Security
Use trusted backend Student context for tenant/role/department filtering where required. Never trust client-provided tenant identifiers. A Student must never retrieve another student's private data, another college's private knowledge, HOD-only material, or Faculty-private material.

## Grounding
Return structured chunks/context and source metadata where supported. If there is no relevant source, return a structured no-result state; never fabricate policy.

## Handoff
Create `docs/student/HANDOFF_03_JERESH_TO_ARAVIND.md` with:
- exact RAG tools;
- exact input/output schemas;
- exact response/source shape;
- exact import paths;
- tenant/role filtering;
- no-result/error behavior;
- files changed;
- tests/build results;
- known limitations;
- exact UI fields Aravind must render;
- files Aravind must not modify.

Explicitly instruct Aravind that the Student UI must not query Supabase/vector storage directly, perform authorization, calculate attendance, or fabricate citations.

## Git
```bash
git fetch --all
git checkout feature/student-rag
git pull origin feature/student-rag
git status
```
Push only this branch.

## Tests
Test authorized knowledge retrieval, tenant/role filtering, blocked private material, no-result behavior, retrieval failure, malformed query, prompt injection, and source metadata.

## Completion gate
Stop when RAG matches the frozen contract, security tests pass, and the handoff exists.
