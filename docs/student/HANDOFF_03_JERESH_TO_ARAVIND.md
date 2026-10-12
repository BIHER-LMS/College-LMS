# HANDOFF 03: JERESH (Student RAG) TO ARAVIND (Student Chat UI & Integration)

**Author:** 03 — Jeresh (Student RAG & Knowledge Retrieval)  
**Recipient:** 04 — Aravind (Student Chat UI + Final Integration & Testing)  
**Date:** 2026-10-11  
**Status:** COMPLETE & FROZEN  

---

## 1. Executive Summary

Jeresh has implemented and registered the **2 Student RAG Knowledge Tools** in `studentToolRegistry`. Live cloud Qdrant vector database (`student_knowledge_base`) and Groq AI LLM provider (`openai/gpt-oss-120b`) are operational, seeded, and grounded.

Aravind, your role is to deliver the **Student Chatbot UI** in the frontend, complete the end-to-end integration audit, run regression tests, and prepare the final integration reports.

> **MANDATORY INSTRUCTION TO ARAVIND:**  
> The Student UI must NOT query Supabase or Qdrant/vector storage directly, perform authorization, calculate authoritative attendance, or fabricate citations. All interaction flows strictly through `POST /api/student/ai/chat` (or `POST /api/student/chat`).

---

## 2. Exact Files Changed & Created

### Created:
1. `backend/src/modules/student/services/studentRagToolService.ts`:
   - Contains `StudentRagToolService` and singleton `studentRagToolService`.
   - Tool `student.searchKnowledge`:
     - Queries Qdrant Cloud collection `student_knowledge_base` with 128-dim Cosine similarity.
     - Enforces tenant isolation (`college_id`) and audience filters (excludes `HOD_ONLY` / `FACULTY_ONLY`).
     - Falls back to `DEFAULT_STUDENT_KNOWLEDGE_CORPUS` for offline resilience.
   - Tool `student.getKnowledgeContext`:
     - Retrieves full document text or clause section.
     - Returns structured no-result state if document is not found.
2. `backend/src/scripts/seedStudentQdrant.ts`:
   - Successfully created and seeded collection `student_knowledge_base` with student academic policies into Qdrant cloud (`https://6d6bd7d5-d85a-4287-ad3d-8b767cb2776c.us-east-1-1.aws.cloud.qdrant.io`).

### Modified:
1. `backend/src/modules/student/ai/index.ts`:
   - Imported `studentRagToolService` so RAG tools 13 and 14 register at server boot.
2. `backend/src/modules/student/ai/studentAi.service.ts`:
   - Configured Groq endpoint `https://api.groq.com/openai/v1/chat/completions` using `openai/gpt-oss-120b`.

---

## 3. Exact RAG Tool Contracts & Response Shapes

### Tool 13: `student.searchKnowledge`
- **Input:**
```json
{
  "query": "What are the rules for attendance condonation on medical grounds?",
  "category": "policy",
  "limit": 5
}
```
- **Output:**
```json
{
  "query": "What are the rules for attendance condonation on medical grounds?",
  "category": "policy",
  "results": [
    {
      "documentId": "doc-student-att-policy",
      "title": "Attendance Requirements & Condonation Guidelines (Clause 4.2)",
      "category": "policy",
      "snippet": "Students must maintain minimum 75% attendance in each semester course. Attendance between 65% and 74% may be condoned on genuine medical grounds...",
      "score": 0.94,
      "source": "Academic Regulations Bylaws Clause 4.2"
    }
  ],
  "totalMatches": 1,
  "retrievalSource": "qdrant"
}
```

### Tool 14: `student.getKnowledgeContext`
- **Input:**
```json
{
  "documentId": "doc-student-att-policy",
  "section": "Clause 4.2"
}
```
- **Output:**
```json
{
  "documentId": "doc-student-att-policy",
  "title": "Attendance Requirements & Condonation Guidelines (Clause 4.2)",
  "category": "policy",
  "content": "### Institutional Attendance & Condonation Regulations (Academic Regulations Clause 4.2)...",
  "section": "Clause 4.2",
  "retrievalSource": "qdrant"
}
```

---

## 4. UI Fields Aravind Must Render

When rendering AI Chat messages in `StudentChatPage`:
1. **Attendance Summaries (Data Tool):**
   - Percentage badge (green `SAFE` if >= 75%, amber/red `CRITICAL` if < 75%)
   - Exam eligibility text
   - Safe Margin indicator (safe classes left or classes needed)
   - Subject breakdown list
2. **Timetable Slots (Data Tool):**
   - Day of week groupings
   - Period / Time slot, Subject name, Room/Venue, Faculty
3. **Class / Academic Info (Data Tool):**
   - Class name, current semester, Class Incharge faculty name & email
4. **Knowledge Citations (RAG Tool):**
   - Markdown quote block with document title
   - Citation source tag (e.g. `*Source: Academic Regulations Bylaws Clause 4.2*`)
   - Category badge (`policy`, `exam`, `regulation`, `handbook`)

---

## 5. Files Aravind Must NOT Modify

- `backend/src/modules/student/services/studentRagToolService.ts`
- `backend/src/modules/student/services/studentDataToolService.ts`
- `backend/src/modules/student/ai/toolRegistry.ts`
- `backend/src/modules/student/ai/studentAi.types.ts`
- `backend/src/modules/student/ai/studentAi.validation.ts`
- `backend/src/modules/student/student.repository.ts`
- `backend/src/modules/student/student.service.ts`
