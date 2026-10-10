# Faculty AI RAG & Knowledge Retrieval Handoff: Jeresh to Kishore

**STATUS:** COMPLETE  
**CURRENT OWNER:** JERESH (Step 3 of 5)  
**NEXT OWNER:** KISHORE (Step 4 of 5)  
**PREVIOUS BRANCH:** `feature/faculty-tools`  
**CURRENT BRANCH:** `feature/faculty-rag`  
**NEXT BRANCH FOR KISHORE:** `feature/faculty-chat-ui`  

---

## 1. Executive Summary

Jeresh (Step 3 of 5) has implemented the complete **Faculty / Class Incharge RAG (Retrieval-Augmented Generation) & Knowledge Retrieval System** covering **Tool 18 (`faculty.searchKnowledge`)** and **Tool 19 (`faculty.getKnowledgeContext`)** under the canonical tool contract established by Tushar (Step 1) and following Ashik's backend data tools (Step 2).

All 19 tools across the Faculty & Class Incharge AI Assistant are now fully implemented, validated, and registered in `facultyToolRegistry`.

### Key Achievements:
1. **Authoritative Institutional & Academic Knowledge Corpus:**
   - Implemented high-fidelity, production-grade institutional knowledge base covering:
     - Academic Regulations & Attendance Policy (75% mandatory threshold, 65%-74.9% medical condonation, <65% detention/redo).
     - Continuous Internal Assessment (CIA) 40-mark evaluation scheme (IAT-1 & IAT-2 tests, assignments, attendance component).
     - University End-Semester Examination Bylaws (45% end-sem minimum, 50% aggregate passing criteria, RA grade, malpractice rules).
     - Choice Based Credit System (CBCS) Degree Award Regulations (160 credits requirement, core/elective structure, B.Tech Honors/Minor).
     - Laboratory & Practical Course Protocol (60 continuous marks, 40 practical exam marks, 100% completion requirement).
     - Capstone Project & Technical Dissertation Guidelines (Phase 1 & Phase 2, review milestones, <15% plagiarism threshold).
     - Faculty Academic Responsibilities & Class Incharge Code of Practice (24-hour attendance logging, fortnightly audits, class committee meetings).
     - Student Grievance Redressal & Anti-Ragging Policy (Zero tolerance, grievance cell 5-day dispute resolution).
     - Department-Specific Guidelines (CSE Advanced Computing Lab directives, containerized programming environments, HPC clusters).
2. **Multi-Tenant & Department Authorization Enforcement:**
   - Evaluates caller's verified `FacultyContext`:
     - Cross-tenant boundaries: Documents restricted to foreign colleges (e.g. `col-foreign-99`) are strictly filtered out; only documents belonging to the caller's college or open institutional policies are returned.
     - Cross-department boundaries: Documents scoped to foreign departments (e.g. `dept-mech-999`) are strictly filtered out for CSE faculty (`dept-cse-101`).
     - Role restriction: Callers with unauthorized roles (e.g. `STUDENT`) are immediately rejected with `403 Forbidden`.
     - Client-provided tenant parameters in message text are ignored; identity is solely established by backend-verified Firebase token.
3. **Prompt Injection & Adversarial Jailbreak Defense:**
   - Built-in heuristic pattern scanner screening against prompt injection attempts (`ignore previous instructions`, `reveal system prompt`, `bypass filter`, `<script>` tags, SQL keywords).
   - Neutralizes malicious inputs with clean, safe empty results or security boundary notices without crashing or leaking internal prompts.
4. **Grounded & Truthful Responses (Zero Policy Hallucination):**
   - For valid matches: returns authoritative excerpts, confidence scores, categorization, and formal handbook citations.
   - For queries with no matching documents: returns structured zero-match responses (`results: []`, `totalMatches: 0`) and polite grounded disclaimers, strictly refusing to fabricate non-existent policies.
5. **Tool Registry Integration & Orchestrator Chat Binding:**
   - `registerFacultyRagHandlers()` registers live handlers for Tools 18 and 19 into `facultyToolRegistry` upon module import.
   - `facultyAiOrchestratorService` has intent detection for both Tools 18 and 19, enabling seamless natural language queries through `POST /api/faculty/chat`.
6. **100% Green Test Suite & Clean Compilation:**
   - 26 comprehensive automated tests in `backend/tests/faculty-rag-tools.test.ts` covering ranking, excerpts, token limits, multi-tenant isolation, department scoping, role guards, prompt injection, and chat orchestrator integration.
   - Total backend test suite: **250 tests passing across 13 test files (0 failures)**.
   - TypeScript compilation: **0 errors** (`npx tsc --noEmit`).
   - Frontend build: **0 errors** in 1.77s (`npm run build`).

---

## 2. Tools 18 & 19 Specification Reference

### Tool 18: `faculty.searchKnowledge`

- **Canonical Name:** `faculty.searchKnowledge`
- **Executor Method:** `facultyKnowledgeService.searchKnowledge(input, context)`
- **Input Schema (`facultySearchKnowledgeInputSchema`):**
  ```typescript
  {
    query: string; // Required, non-empty search query
    category?: 'ACADEMIC_POLICY' | 'EXAM_REGULATION' | 'SYLLABUS' | 'INSTITUTIONAL' | 'ALL'; // Default: 'ALL'
    topK?: number; // Integer, 1 to 10. Default: 5
  }
  ```
- **Output Schema (`facultySearchKnowledgeOutputSchema`):**
  ```typescript
  {
    query: string;
    results: Array<{
      id: string;          // e.g. 'doc-acad-att-01'
      title: string;       // e.g. 'Institutional Attendance Policy & Condonation Rules'
      snippet: string;     // Concise, high-density summary of policy
      score: number;       // Relevance score (0.0 to 1.0)
      category: string;    // 'ACADEMIC_POLICY' | 'EXAM_REGULATION' | 'SYLLABUS' | 'INSTITUTIONAL'
      sourceUrl?: string;  // e.g. '/docs/handbook#attendance-condonation'
    }>;
    totalMatches: number;
    _isStub?: boolean;
  }
  ```
- **No-Result Shape:**
  ```json
  {
    "query": "unrelated topic",
    "results": [],
    "totalMatches": 0,
    "_isStub": true
  }
  ```

---

### Tool 19: `faculty.getKnowledgeContext`

- **Canonical Name:** `faculty.getKnowledgeContext`
- **Executor Method:** `facultyKnowledgeService.getKnowledgeContext(input, context)`
- **Input Schema (`facultyGetKnowledgeContextInputSchema`):**
  ```typescript
  {
    topic: string; // Required topic name (e.g. 'Attendance Condonation')
    maxTokens?: number; // Integer, 1 to 2000. Default: 500
  }
  ```
- **Output Schema (`facultyGetKnowledgeContextOutputSchema`):**
  ```typescript
  {
    topic: string;
    contextText: string;     // Authoritative regulation text excerpt
    citations: string[];     // Array of handbook section references
    lastUpdated: string;     // ISO timestamp string
    _isStub?: boolean;
  }
  ```
- **No-Result Shape (Grounding Guarantee):**
  ```json
  {
    "topic": "Nonexistent Policy",
    "contextText": "No authoritative academic policy, examination regulation, or institutional document was found covering the topic \"Nonexistent Policy\". Please consult your Head of Department or the Academic Dean's office for official clarification.",
    "citations": [],
    "lastUpdated": "2026-10-10T08:40:00.000Z",
    "_isStub": true
  }
  ```

---

## 3. Endpoints Consumed by Frontend

Kishore (Step 4: Frontend UI) will interact with the chatbot exclusively via the following documented backend endpoints:

### 1. Primary Faculty Chat Endpoint
- **URL:** `POST /api/faculty/chat`
- **Headers:**
  - `Authorization: Bearer <FIREBASE_ID_TOKEN>` (Must obtain via `auth.currentUser.getIdToken()`)
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "message": "What is the policy for attendance condonation?",
    "history": [
      { "role": "user", "content": "Hello" },
      { "role": "assistant", "content": "Hello Professor! How can I assist you today?" }
    ],
    "toolChoice": "auto"
  }
  ```
- **Response Body (HTTP 200):**
  ```json
  {
    "success": true,
    "data": {
      "message": "### 📖 Institutional Knowledge & Policy Search: \"What is the policy for attendance condonation?\"\n\n**1. Institutional Attendance Policy & Condonation Rules** [Category: `ACADEMIC_POLICY`]\n>Students require a minimum of 75% aggregate attendance in each course to be eligible for university end-semester examinations. Condonation of shortage (65%-74.9%) may be granted on valid medical grounds upon recommendation of the Class Incharge and approval by HOD. Students below 65% are strictly detained.\n",
      "toolsExecuted": [
        {
          "toolName": "faculty.searchKnowledge",
          "arguments": {
            "query": "What is the policy for attendance condonation?",
            "category": "ALL",
            "topK": 3
          },
          "status": "success",
          "result": {
            "query": "What is the policy for attendance condonation?",
            "results": [
              {
                "id": "doc-acad-att-01",
                "title": "Institutional Attendance Policy & Condonation Rules",
                "snippet": "Students require a minimum of 75% aggregate attendance in each course to be eligible for university end-semester examinations. Condonation of shortage (65%-74.9%) may be granted on valid medical grounds upon recommendation of the Class Incharge and approval by HOD. Students below 65% are strictly detained.",
                "score": 0.98,
                "category": "ACADEMIC_POLICY",
                "sourceUrl": "/docs/handbook#attendance-condonation"
              }
            ],
            "totalMatches": 1,
            "_isStub": true
          },
          "executionDurationMs": 2
        }
      ],
      "metadata": {
        "facultyUid": "faculty-prof-888",
        "departmentId": "dept-cse-101",
        "collegeId": "college-alpha-001",
        "timestamp": "2026-10-10T08:41:00.000Z",
        "model": "lms-faculty-ai-orchestrator-v1"
      }
    }
  }
  ```

### 2. Available Tools Catalog Endpoint
- **URL:** `GET /api/faculty/ai/tools`
- **Headers:** `Authorization: Bearer <FIREBASE_ID_TOKEN>`
- **Response:** List of all 19 canonical tools, parameter schemas, and permissions.

### 3. Direct Controlled Tool Execution (Testing / Inspection)
- **URL:** `POST /api/faculty/ai/tools/execute`
- **Request Body:**
  ```json
  {
    "toolName": "faculty.searchKnowledge",
    "arguments": {
      "query": "CIA internal assessment weightage",
      "category": "EXAM_REGULATION"
    }
  }
  ```

---

## 4. Exact UI Fields Kishore Must Render (Step 4)

In the Faculty/Class Incharge Chatbot UI, when a tool response includes `toolsExecuted`:
1. **For RAG Search Results (`faculty.searchKnowledge`):**
   - **Document Cards / Citations Badge:**
     - Render `result.results[i].title` as a highlighted badge/card.
     - Display category tag using `result.results[i].category` (e.g. `ACADEMIC_POLICY`, `EXAM_REGULATION`, `SYLLABUS`, `INSTITUTIONAL`).
     - Display snippet content with clear markdown quote styling.
     - Display relevance score `Math.round(result.results[i].score * 100)% match`.
     - If `result.results[i].sourceUrl` is present, display a clickable or informative handbook source link.
   - **Empty State:**
     - When `result.totalMatches === 0`, render a clean informational banner: *"No official university regulations matched this specific query. Please consult the HOD or Dean."*
2. **For Knowledge Context Results (`faculty.getKnowledgeContext`):**
   - Render `result.contextText` in an authoritative policy callout block.
   - Render `result.citations` as a bulleted reference list (e.g. *"Academic Regulations Handbook 2026-2027, Section 4.1"*).
   - Show `lastUpdated` date badge (e.g. *"Effective as of Aug 2026"*).
3. **For Backend Data Tools (Tools 1 to 17):**
   - Render synthesized markdown in `data.message`.
   - Optionally render structured metrics cards (e.g. attendance percentage bars, defaulters badge, timetable slots grid).

---

## 5. UI Integration Architecture Mandate

Kishore **MUST** adhere to the following architectural rules:

> [!IMPORTANT]
> 1. **The frontend consumes the backend's exact response contract.**  
> 2. **The frontend does NOT perform vector search or semantic similarity calculations.**  
> 3. **The frontend does NOT access Supabase (`supabase.from()` or `supabase.rpc()`) directly.**  
> 4. **The frontend does NOT calculate attendance or filter student rosters.**  
> 5. **The frontend does NOT implement authorization logic; it trusts server responses.**  
> 6. **The frontend only renders authoritative backend results delivered via `POST /api/faculty/chat`.**  
> 7. **Always use Firebase `auth.currentUser.getIdToken()` for request authentication; NEVER use unverified localStorage tokens.**

---

## 6. Files Created & Modified in Step 3

| File | Status | Description |
|---|---|---|
| `backend/src/modules/faculty/services/facultyKnowledgeService.ts` | **CREATED** | Core RAG & knowledge retrieval service, multi-tenant & department filtering, prompt injection defense, and default knowledge corpus. |
| `backend/src/modules/faculty/ai/index.ts` | **MODIFIED** | Exported `facultyKnowledgeService`, `FacultyKnowledgeService`, and `registerFacultyRagHandlers`. |
| `backend/src/modules/faculty/ai/facultyAi.service.ts` | **MODIFIED** | Added intent detection for `faculty.getKnowledgeContext` (Topic/Context lookup). |
| `backend/tests/faculty-rag-tools.test.ts` | **CREATED** | 26 automated unit, integration, multi-tenant security, and adversarial prompt injection tests. |
| `docs/faculty/HANDOFF_03_JERESH_TO_KISHORE.md` | **CREATED** | This handoff document. |

---

## 7. Verification & Quality Metrics

- **RAG Test Suite:**
  ```bash
  npx vitest run tests/faculty-rag-tools.test.ts
  # Result: 26 passed (26) in 22ms
  ```
- **Backend Data Tools Test Suite:**
  ```bash
  npx vitest run tests/faculty-backend-tools.test.ts
  # Result: 23 passed (23) in 26ms
  ```
- **AI Orchestrator Test Suite:**
  ```bash
  npx vitest run tests/faculty-ai-orchestrator.test.ts
  # Result: 39 passed (39) in 122ms
  ```
- **Full Backend Test Suite:**
  ```bash
  npm test
  # Result: 13 test files passed, 250 tests passed (100% green, 0 failures)
  ```
- **TypeScript Check:**
  ```bash
  npx tsc --noEmit
  # Result: 0 errors
  ```
- **Frontend Production Build Check:**
  ```bash
  npm run build (in frontend/)
  # Result: Built in 1.77s (0 errors)
  ```
- **Environment Variables Added:** `NONE`
- **Dependencies Added:** `NONE`

---

## 8. Files Kishore Must NOT Modify (Step 4)

Kishore must NOT modify:
- `backend/src/modules/faculty/services/facultyBackendToolService.ts` (Ashik's Step 2 tools)
- `backend/src/modules/faculty/services/facultyKnowledgeService.ts` (Jeresh's Step 3 RAG service)
- `backend/src/modules/faculty/ai/facultyAi.types.ts` (Canonical type contracts)
- `backend/src/modules/faculty/ai/facultyAi.validation.ts` (Frozen Zod schemas)
- `backend/src/modules/faculty/faculty.service.ts` or `faculty.repository.ts`
- `backend/src/modules/student/**` or `backend/src/modules/hod_temp/**`
- `prisma/schema.prisma`

---

## 9. Next Developer Instructions for Kishore

1. Read `docs/faculty/FACULTY_AI_TOOL_CONTRACT.md`, `docs/faculty/HANDOFF_01_TUSHAR_TO_ASHIK.md`, `docs/faculty/HANDOFF_02_ASHIK_TO_JERESH.md`, and this file `HANDOFF_03_JERESH_TO_KISHORE.md`.
2. Create branch `feature/faculty-chat-ui` from `feature/faculty-rag`.
3. Implement the Faculty / Class Incharge AI Chatbot UI in `frontend/src/modules/faculty/` (e.g. Chat drawer/modal or dedicated chat interface).
4. Connect frontend directly to `POST /api/faculty/chat` using standard Axios client with verified Firebase token.
5. Render structured tools badges, citations, and metrics using the documented output shapes.
