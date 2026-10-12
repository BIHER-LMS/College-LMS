# HANDOFF 02: ASHIK (Student Data Tools) TO JERESH (Student RAG)

**Author:** 02 — Ashik (Student Data Tools)  
**Recipient:** 03 — Jeresh (Student RAG + Knowledge Retrieval)  
**Date:** 2026-10-11  
**Status:** COMPLETE & FROZEN  

---

## 1. Executive Summary

Ashik has implemented and registered the **12 Deterministic Student Data Tools** in `studentToolRegistry`. All 12 tools wrap the existing `studentService` singleton and methods, operating with zero IDOR under strict `studentContext` scoping.

Jeresh, your role is to implement the **2 Student RAG Knowledge Tools** (`student.searchKnowledge` and `student.getKnowledgeContext`) connecting Qdrant vector database and Groq AI completions.

> **MANDATORY INSTRUCTION TO JERESH:**  
> RAG is not the source of truth for live Student attendance, timetable, profile, class, subjects, or other current records. Do not create a database helper for RAG. Live factual student data MUST only come from the 12 deterministic data tools.

---

## 2. Exact Files Changed & Created

### Created:
1. `backend/src/modules/student/services/studentDataToolService.ts`:
   - Contains `StudentDataToolService` and exports singleton `studentDataToolService`.
   - Automatically registers the 12 tools into `studentToolRegistry`:
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

### Modified:
1. `backend/src/modules/student/ai/index.ts`:
   - Imported `studentDataToolService` to guarantee immediate startup registration.

---

## 3. Services, Repositories, & Database Tables Reused

All 12 data tools delegate to:
- Service: `studentService` in `backend/src/modules/student/student.service.ts`
- Repository: `StudentRepository` in `backend/src/modules/student/student.repository.ts`

### Database Tables & Scopes:
- `authed_users`: `uid`, `email`, `display_name`, `photo_url`, `role`, `approval_status`, `college_id`, `department_id`, `class_id`, `register_number`
- `classes`: `id`, `name`, `batch_id`, `current_semester`, `faculty_uid`
- `batches`: `id`, `name`, `start_year`, `end_year`, `program_id`
- `programs`: `id`, `name`, `type`, `duration_years`, `department_id`
- `departments`: `id`, `name`, `code`, `college_id`, `hod_uid`
- `subjects`: `id`, `name`, `code`, `credits`, `semester_number`, `department_id`
- `class_timetables`: `id`, `class_id`, `day_of_week`, `period`, `start_time`, `end_time`, `room`
- `attendance_sessions`: `id`, `date`, `period`, `subject_id`, `faculty_uid`
- `attendance_records`: `id`, `attendance_session_id`, `student_uid`, `status`, `marked_at`

---

## 4. Attendance & Authorization Guardrails

1. **Foreign Key Integrity:**
   - The verified foreign key linking `attendance_records` to `attendance_sessions` is `ar.attendance_session_id = s.id`.
   - Never use or reintroduce `session_id`.
2. **Attendance Calculation Rules:**
   - Attendance percentage: `(attendedSessions / totalSessions) * 100`
   - Attended includes: `PRESENT`, `LATE`, `EXCUSED`
   - Threshold: `75.0%` for exam eligibility
   - Statuses:
     - `SAFE`: `>= 75.0%`
     - `CRITICAL`: `< 75.0%`
     - `NO_DATA`: `held === 0`
   - `safeMargin`:
     - Positive when >= 75%: `Math.floor((attended - 0.75 * total) / 0.75)` (how many can be skipped safely)
     - Negative when < 75%: `-Math.ceil((0.75 * total - attended) / 0.25)` (how many consecutive sessions needed to recover)
3. **Profile Write Restrictions:**
   - Permitted update fields: `phone`, `address`, `city`, `state`, `profilePhotoUrl`, `bio`
   - Strict rejection on: `role`, `collegeId`, `departmentId`, `classId`, `registerNumber`, `email`
4. **Zero IDOR:**
   - No tool allows client parameters to specify target student `uid`, `classId`, or `collegeId`. All queries are restricted to `studentContext`.

---

## 5. Instructions for Jeresh (Tools 13 & 14)

1. Implement `backend/src/modules/student/services/studentRagToolService.ts`.
2. Connect to Qdrant cloud using provided credentials:
   - Endpoint: `https://6d6bd7d5-d85a-4287-ad3d-8b767cb2776c.us-east-1-1.aws.cloud.qdrant.io`
   - Collection: `student_knowledge_base` (with fallback to `hod_knowledge_base`)
   - API Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Connect to Groq AI:
   - API Key: `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`
   - Model: `openai/gpt-oss-120b` (or `llama-3.3-70b-versatile` fallback)
4. Enforce tenant isolation on Qdrant payloads:
   - Must filter: `{ college_id: context.collegeId }` or null (institutional general knowledge)
   - Must NOT return HOD-only or faculty-confidential knowledge to students.
5. Provide a rich offline/local student policy corpus fallback (attendance condonation, examination rules, grading criteria, student grievances, code of conduct) in case of network interruption.
6. Register Tools 13 & 14 in `studentToolRegistry.registerTool(...)`.

---

## 6. Files Jeresh Must NOT Modify

- `backend/src/modules/student/services/studentDataToolService.ts`
- `backend/src/modules/student/ai/studentAi.types.ts`
- `backend/src/modules/student/ai/studentAi.validation.ts`
- `backend/src/modules/student/ai/studentAi.service.ts`
- `backend/src/modules/student/student.repository.ts`
- `backend/src/modules/student/student.service.ts`
- Database schema / Prisma migrations.
