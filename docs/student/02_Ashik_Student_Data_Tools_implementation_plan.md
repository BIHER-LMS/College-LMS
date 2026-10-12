# 02 — Ashik: Student Data Tools

## Branch
`feature/student-tools`

## Prerequisite
Do not start until these exist and are read:
- `docs/student/STUDENT_AI_TOOL_CONTRACT.md`
- `docs/student/HANDOFF_01_TUSHAR_TO_ASHIK.md`

Verify the handoff against the actual repository before coding.

## Source architecture to reuse
The documented Student backend is:
`routes -> controller -> service -> repository -> PostgreSQL`.
Singletons include `studentService = new StudentService(new StudentRepository())` and `studentRepository`.

Documented service methods include:
- `getDashboard(studentContext)`
- `getProfile(studentContext)`
- `updateProfile(studentContext, validated)`
- `getClass(studentContext)`
- `getBatch(studentContext)`
- `getProgram(studentContext)`
- `getDepartment(studentContext)`
- `getSubjects(studentContext, semesterNumber?)`
- `getClassIncharge(studentContext)`
- `getAcademicYears(studentContext)`
- `getSemesters(studentContext)`
- `getClassTimetable(studentContext)`
- `getAttendance(studentContext, date?)`

Verify current source names before using them.

## Objective
Implement the deterministic backend executors for the exact Student tools frozen by Tushar. Do not rebuild the Student business layer.

## Critical authorization rule
Every tool consumes trusted `studentContext`. Never use client-supplied UID/class/department/college/register number to grant access. The Student module explicitly documents no IDOR: resource IDs come from token-derived context.

## Attendance
Reuse the existing `getAttendance` flow. Preserve:
- overall summary;
- today counts;
- percentage;
- 75% eligibility;
- safeMargin;
- subject breakdown;
- Monday-Friday schedule.

Preserve statuses:
- `SAFE` >= 75%
- `CRITICAL` < 75%
- `NO_DATA` when held = 0

The documented attendance FK is `attendance_session_id`. Never reintroduce `session_id`. Raw SQL must remain parameterized with explicit casts.

## Profile write boundary
The documented strict `updateProfileSchema` allows only:
`phone`, `address`, `city`, `state`, `profilePhotoUrl`, `bio`.
Never expose an AI tool that edits role, department, class, batch, program, college, or register number.

## No generic database tool
Do not create `getDb()`, `getDatabase()`, `queryDatabase()`, or arbitrary SQL tools. The LLM must call specific business tools only.

## Structured outputs
Return the exact DTO/tool output contract. Do not return LLM-generated paragraphs from the repository/service.

## Handoff
Create `docs/student/HANDOFF_02_ASHIK_TO_JERESH.md` with:
- exact tools/executors;
- exact files/functions/imports;
- services/repositories reused;
- tables/columns used;
- StudentContext scope;
- attendance rules;
- profile write restrictions;
- input/output schemas;
- errors;
- tests/build results;
- known limitations;
- exact instructions for Jeresh;
- files Jeresh must not modify.

Explicitly tell Jeresh: “RAG is not the source of truth for live Student attendance, timetable, profile, class, subjects, or other current records. Do not create a database helper for RAG.”

## Git
```bash
git fetch --all
git checkout feature/student-tools
git pull origin feature/student-tools
git status
```
Push only this branch.

## Tests
Test cross-student/class/department/college denial, unauthorized role, strict profile schema, attendance calculations/no-data, timetable, malformed input, SQL parameterization, `attendance_session_id`, and existing Student regressions.

## Completion gate
Stop when the contracted tools work, tests pass, and the handoff exists.
