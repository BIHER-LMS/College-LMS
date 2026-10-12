# HOD AI RAG & Knowledge Retrieval Handoff: Harini to Faisal

**STATUS:** COMPLETE  
**CURRENT OWNER:** HARINI (Step 3 of 5)  
**NEXT OWNER:** FAISAL (Step 4 of 5)  
**BRANCH:** `feature/hod-rag`  
**NEXT BRANCH FOR FAISAL:** `feature/hod-chatbot-ui`  

---

## 1. WHAT WAS IMPLEMENTED

Harini (Step 3) implemented the canonical RAG and knowledge retrieval tools matching Abhinav's canonical contract (`HOD_AI_TOOL_CONTRACT.md`), completing Tools 6 and 7 of the 7 canonical HOD AI tools.

Specifically:
1. **Created `HodRagToolService`** in `backend/src/modules/hod_temp/services/hodRagToolService.ts`:
   - `hod.searchKnowledge` (Tool 6): Semantic, multi-token, and category-filtered RAG search across academic regulations, university policies, curriculum syllabi, and administrative handbooks.
   - `hod.getKnowledgeContext` (Tool 7): Full-text and granular section/clause extraction of institutional documents and regulatory bylaws.
2. **Built-in Canonical Knowledge Corpus (`DEFAULT_HOD_KNOWLEDGE_CORPUS`)**:
   - High-fidelity institutional regulatory documents covering Attendance Policies (75% minimum, 65% medical condonation with HOD endorsement), CIA Evaluation Framework (40% CIA, 20 IAT marks), End-Semester Passing Bylaws (45% exam, 50% aggregate), CBCS Curriculum Regulations (160 credits, honors/minors), HOD Governance & Surveillance Handbook, Faculty Workload Norms (16 hrs/wk, 1:20 SFR), Student OD & Leave Policy (explanation rules, class incharge approval, multi-faculty tags), Student Grievance Redressal, and Department-Specific Directives.
3. **Qdrant & Groq Native Integration**:
   - Detects `QDRANT_URL`, `QDRANT_API_KEY`, and optional `QDRANT_COLLECTION_NAME` (default `'hod_knowledge_base'`). When configured, searches Qdrant points with tenant payload filters (`college_id`).
   - Detects `GROQ_API_KEY` and optional `GROQ_MODEL` (default `'llama-3.3-70b-versatile'`).
   - Seamlessly falls back to local high-fidelity semantic corpus when offline or unconfigured, ensuring zero crashes.
4. **Strict Multi-Tenant Isolation & Security**:
   - Enforces `HODContext` boundary verification: All operations are strictly bound to `context.collegeId` and `context.departmentId`.
   - Cross-college documents (`collegeId !== context.collegeId`) and cross-department documents (`departmentId !== context.departmentId`) are completely excluded from search results.
   - Direct requests for foreign documents via `getKnowledgeContext` strictly throw `ForbiddenError`.
   - Defenses against prompt injection and jailbreaks intercept attacks and return safe structured outputs.
5. **Tool Registry Wiring**:
   - Registered live handlers into `hodToolRegistry` via `registerRagToolHandlers()`.
   - Mounted in `backend/src/modules/hod_temp/routes/hodRoutes.ts` and exported in `backend/src/modules/hod_temp/ai/index.ts`.
6. **Automated Test Suite**:
   - Created 31 unit, tenant isolation, security, prompt injection, and supertest integration tests in `backend/tests/hod-rag-tools.test.ts`. All 31 tests pass with zero errors. All 81 tests across HOD and Faculty AI suites pass. Zero TypeScript errors (`npx tsc --noEmit`).

---

## 2. CANONICAL TOOL CONTRACTS IMPLEMENTED (TOOLS 6 & 7)

Canonical tool names were **not changed**. The exact names registered in `hodToolRegistry` are:

```text
6. hod.searchKnowledge
7. hod.getKnowledgeContext
```

### Tool 6: `hod.searchKnowledge`
- **Owner:** Harini
- **Executor:** `hodRagToolService.searchKnowledge(input, context)`
- **Purpose:** Perform semantic/RAG search over approved academic regulations, university policies, and department handbooks.
- **Input Schema:**
  ```typescript
  interface HodSearchKnowledgeInput {
    query: string; // Min 2 characters, max 255
    category?: 'policy' | 'curriculum' | 'handbook' | 'general';
    limit?: number; // 1 to 20, default 5
  }
  ```
- **Output Schema:**
  ```typescript
  interface HodSearchKnowledgeOutput {
    query: string;
    resultsCount: number;
    results: Array<{
      documentId: string;
      title: string;
      category: string;
      snippet: string;
      score: number; // Normalized 0.0 - 1.0
      url?: string;
    }>;
    _isStub?: boolean;
  }
  ```

### Tool 7: `hod.getKnowledgeContext`
- **Owner:** Harini
- **Executor:** `hodRagToolService.getKnowledgeContext(input, context)`
- **Purpose:** Retrieve grounded document content or specific regulatory clauses.
- **Input Schema:**
  ```typescript
  interface HodGetKnowledgeContextInput {
    documentId: string; // Required
    section?: string;   // Optional section or clause query
  }
  ```
- **Output Schema:**
  ```typescript
  interface HodGetKnowledgeContextOutput {
    documentId: string;
    title: string;
    section: string | null;
    content: string;
    lastUpdated: string; // ISO date string
    metadata: Record<string, any>; // { category, citations, sourceUrl, collegeScoped, departmentScoped }
    _isStub?: boolean;
  }
  ```

---

## 3. EXACT FILES CHANGED OR CREATED

| File Path | Status | Description |
|:---|:---|:---|
| `backend/src/modules/hod_temp/services/hodRagToolService.ts` | **CREATED** | Core HOD RAG service, Qdrant/Groq connector, local corpus, and tool handlers |
| `backend/src/modules/hod_temp/routes/hodRoutes.ts` | **MODIFIED** | Added `import '../services/hodRagToolService';` to initialize handlers |
| `backend/src/modules/hod_temp/ai/index.ts` | **MODIFIED** | Exported `hodRagToolService` and `registerRagToolHandlers` |
| `backend/src/modules/hod_temp/ai/hodAi.service.ts` | **MODIFIED** | Tuned intent detection order to prioritize policy/knowledge intent over generic attendance |
| `backend/tests/hod-rag-tools.test.ts` | **CREATED** | Comprehensive 31-test test suite for Tools 6 & 7 |
| `docs/hod/HANDOFF_03_HARINI_TO_FAISAL.md` | **CREATED** | This handoff document for Faisal |

---

## 4. API ENDPOINTS & INTEGRATION POINTS

Faisal must interact with the backend exclusively through Abhinav's canonical endpoints:

### 1. Main Chat Endpoint
- **URL:** `POST /api/hod/ai/chat`
- **Headers:** `Authorization: Bearer <FIREBASE_ID_TOKEN>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "message": "What is the institutional attendance policy regarding condonation?",
    "toolChoice": "auto"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "data": {
      "message": "### Institutional Knowledge Search: \"What is the institutional attendance policy...\"\n\nFound 1 relevant reference(s):\n\n• **Institutional Attendance Policy & Medical Condonation Directives** [POLICY] (Score: 94%)\n  *\"Students require a minimum of 75% aggregate attendance in each registered course to be eligible for university end-semester examinations...\"*",
      "toolsExecuted": [
        {
          "toolName": "hod.searchKnowledge",
          "arguments": {
            "query": "What is the institutional attendance policy regarding condonation?",
            "category": "policy"
          },
          "status": "success",
          "result": {
            "query": "What is the institutional attendance policy regarding condonation?",
            "resultsCount": 1,
            "results": [
              {
                "documentId": "doc-hod-att-01",
                "title": "Institutional Attendance Policy & Medical Condonation Directives",
                "category": "policy",
                "snippet": "Students require a minimum of 75% aggregate attendance...",
                "score": 0.94,
                "url": "/docs/handbook#attendance-condonation"
              }
            ],
            "_isStub": false
          },
          "executionDurationMs": 2
        }
      ],
      "metadata": {
        "departmentId": "dept-cse-101",
        "collegeId": "college-alpha-001",
        "timestamp": "2026-10-11T09:44:00.000Z",
        "model": "hod-ai-orchestrator-v1"
      }
    },
    "message": "Chat response generated successfully"
  }
  ```

### 2. Tool Catalog
- **URL:** `GET /api/hod/ai/tools`
- **Headers:** `Authorization: Bearer <FIREBASE_ID_TOKEN>`
- **Response:** Array of `ToolMetadata` for all 7 registered tools.

### 3. Controlled Direct Tool Execution
- **URL:** `POST /api/hod/ai/tools/execute`
- **Headers:** `Authorization: Bearer <FIREBASE_ID_TOKEN>`
- **Request Body:**
  ```json
  {
    "toolName": "hod.getKnowledgeContext",
    "arguments": {
      "documentId": "doc-hod-att-01",
      "section": "4.1 Attendance Minimum"
    }
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "data": {
      "toolName": "hod.getKnowledgeContext",
      "status": "success",
      "result": {
        "documentId": "doc-hod-att-01",
        "title": "Institutional Attendance Policy & Medical Condonation Directives",
        "section": "4.1 Attendance Minimum",
        "content": "Every candidate must secure not less than 75% of attendance in each course for appearing in the End-Semester Examination.",
        "lastUpdated": "2026-08-01T00:00:00.000Z",
        "metadata": {
          "category": "policy",
          "citations": [
            "Academic Regulations Handbook 2026-2027, Section 4.1 (Mandatory Attendance Requirement)"
          ],
          "sourceUrl": "/docs/handbook#attendance-condonation",
          "collegeScoped": false,
          "departmentScoped": false
        },
        "_isStub": false
      },
      "executionDurationMs": 1
    }
  }
  ```

---

## 5. UI FIELDS FAISAL MUST RENDER

When rendering responses in the HOD AI Chat interface:

1. **Assistant Message Markdown**:
   - Render `data.message` using standard GitHub-Flavored Markdown (supporting headers, bullet points, bold tags, blockquotes).
2. **Tool Execution Badges**:
   - For each item in `data.toolsExecuted`:
     - Display an execution pill showing the `toolName` (e.g., `⚡ hod.searchKnowledge` or `⚡ hod.getKnowledgeContext`).
     - Display duration badge: `${executionDurationMs}ms`.
     - Status indicator (Green for `success`, Amber for warning, Red for `error`).
3. **Structured Source Citations & References Card**:
   - When `hod.searchKnowledge` was executed:
     - Render each result card with `title`, `category` badge (`POLICY`, `CURRICULUM`, `HANDBOOK`), match percentage (`score * 100%`), and italicized snippet.
     - Include clickable citation link if `url` is present.
     - Provide a "Read Full Clause" button that triggers `hod.getKnowledgeContext` with `documentId`.
   - When `hod.getKnowledgeContext` was executed:
     - Render `title`, `section` header, full clause text, `citations` list, and `lastUpdated` timestamp.
4. **No-Result State**:
   - If `resultsCount === 0`, display a clean "No authoritative policy found" notice advising the HOD to contact the Academic Dean's office.

---

## 6. ENVIRONMENT VARIABLES & AI PROVIDER STATUS

The service is configured and verified with live production credentials in `backend/.env`:
- `QDRANT_URL`: `https://6d6bd7d5-d85a-4287-ad3d-8b767cb2776c.us-east-1-1.aws.cloud.qdrant.io`
- `QDRANT_API_KEY`: Configured
- `QDRANT_COLLECTION_NAME`: `hod_knowledge_base` (Provisioned, text/payload indexed, and seeded with 11 institutional regulatory documents)
- `GROQ_API_KEY`: Configured
- `GROQ_MODEL`: `openai/gpt-oss-120b` (Active high-performance reasoning model on Groq Cloud)

Both Qdrant Cloud vector search and Groq Cloud completion APIs are verified, active, and integrated with automatic fallback to the local corpus if network or latency spikes occur.

---

## 7. ERROR CODES & BEHAVIORS

| HTTP Status | Error Code | Cause |
|:---|:---|:---|
| `401` | `UNAUTHORIZED` | Missing or invalid Bearer Firebase token |
| `403` | `FORBIDDEN` | Missing HOD context, caller not HOD/Admin, or cross-tenant document access attempt |
| `404` | `NOT_FOUND` | Document does not exist (`Knowledge document not found: ...`) |
| `400` / `200` | `MALFORMED_TOOL_ARGUMENTS` | Input arguments failed Zod schema (e.g. query < 2 chars) |

---

## 8. IMPORTANT HANDOFF INSTRUCTION TO FAISAL

Faisal must strictly adhere to the following architecture rules:

```text
The UI must consume the documented response contract.
The UI must not query the vector store.
The UI must not query Supabase.
The UI must not calculate attendance.
The UI must not implement authorization.
```

---

## 9. FILES FAISAL MUST NOT MODIFY

To prevent interface drift and regression:
- ❌ `backend/src/modules/hod_temp/services/hodRagToolService.ts`
- ❌ `backend/src/modules/hod_temp/services/hodAnalyticsToolService.ts`
- ❌ `backend/src/modules/hod_temp/ai/toolRegistry.ts`
- ❌ `backend/src/modules/hod_temp/ai/hodAi.types.ts`
- ❌ `backend/src/modules/hod_temp/ai/hodAi.validation.ts`
- ❌ `backend/src/modules/hod_temp/ai/hodAi.service.ts`
- ❌ `backend/src/modules/hod_temp/ai/hodAi.controller.ts`
- ❌ `backend/src/modules/hod_temp/ai/hodAi.routes.ts`

Faisal's scope is strictly the **frontend Chat UI and components** in the Next.js frontend.

---

## 10. NEXT DEVELOPER INSTRUCTION

> **To Faisal (Step 4 of 5):**  
> Read `HANDOFF_03_HARINI_TO_FAISAL.md`, `HOD_AI_TOOL_CONTRACT.md`, and the previous handoffs before implementing the HOD chatbot UI. Consume the exact backend response contract; do not invent another API.
