# College LMS (Aura Academia) — Master Documentation

**Generated:** 2026-10-07
**Repository:** `College-LMS` (BIHER-LMS/College-LMS)
**Supabase Project Ref:** `lmnbsauvjqursjxocsgf`
**Firebase Project:** `lms-college-5975a`
**Production URL:** https://college-lms-2026-ten.vercel.app
**Status:** Multi-tenant security hardening (RLS Phases 1 & 2) applied live; all 24 public tables locked down; faculty + student portals fully integrated.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Technology Stack](#3-technology-stack)
4. [Architecture](#4-architecture)
5. [Database Schema](#5-database-schema)
6. [Backend Modules & API Catalog](#6-backend-modules--api-catalog)
7. [Student Module — Deep Dive](#7-student-module--deep-dive)
8. [Faculty Module — Deep Dive](#8-faculty-module--deep-dive)
9. [Middleware & Security Layer](#9-middleware--security-layer)
10. [Frontend Modules & State Management](#10-frontend-modules--state-management)
11. [RLS / Authorization Design & Implementation Status](#11-rls--authorization-design--implementation-status)
12. [Deployment Configuration](#12-deployment-configuration)
13. [Development Log & Bug Registry](#13-development-log--bug-registry)
14. [Current Project Status & Verification](#14-current-project-status--verification)
15. [Open Items & Blockers](#15-open-items--blockers)

---

## 1. Project Overview

The **College Multi-Tenant Learning Management System (LMS)** — branded **Aura Academia** — is an enterprise academic administration and learning platform designed for multiple higher education institutions under a unified architecture.

### Organizational Hierarchy

| Tier | Role | Scope |
|:---|:---|:---|
| System-wide governance | `SUPER_ADMIN` | Global access across all colleges |
| Institutional governance | `COLLEGE_ADMIN` | Single college (tenant boundary) |
| Departmental management | `HOD` | Single department (under active development by other team members — **do not modify**) |
| Teaching workflows | `FACULTY` / `TRAINER` | Assigned classes & subjects |
| Learning environment | `STUDENT` | Own enrollment, classes, attendance |

### Key Design Principles

- **Multi-tenant architecture** with strict data isolation per college.
- **Firebase Auth** for identity (ID tokens verified server-side with Firebase Admin SDK).
- **Supabase (PostgreSQL)** for persistence; Prisma ORM for typed access.
- **RBAC** with granular permissions; roles never accepted from request bodies.
- **Vercel** multi-service deployment: `/api/*` → backend, `/*` → frontend SPA.

---

## 2. Repository Structure

```
College-LMS/
├── backend/                      # Express + TypeScript API (Node 24)
│   ├── prisma/schema.prisma      # Prisma models (16 models) for identity & academic entities
│   ├── src/
│   │   ├── app.ts                # Express app: middleware, route mounting, error handlers
│   │   ├── server.ts             # Vercel serverless entry (root vercel.json routes /api/* here)
│   │   ├── config/               # env.ts, database.ts (Prisma), firebase.ts (Admin SDK)
│   │   ├── middleware/           # auth, rbac, validation, error
│   │   ├── modules/              # Domain modules (see §6)
│   │   │   ├── auth/  approvals/  audit/  college-admin/  colleges/
│   │   │   ├── faculty/  hod_temp/  profiles/  roles/
│   │   │   ├── secure-data/  student/  users/
│   │   ├── schemas/              # Zod shared schemas (collegeAdmin.schema.ts)
│   │   └── utils/                # errors, response, logger, cache
│   └── tests/                    # Vitest suites (108 tests green)
├── frontend/                     # React 19 + Vite 8 + TypeScript SPA
│   └── src/
│       ├── App.tsx               # Router (Home, Login, WaitingApproval, CollegeAdmin, SuperAdmin, /faculty/*)
│       ├── config/               # firebase.ts, supabase.ts (publishable key; grants revoked)
│       ├── store/                # Redux Toolkit root store
│       ├── services/             # collegeService.ts, api/secureDataApi.ts, api/collegeProfile.ts
│       ├── components/CollegeAdmin/  # ManageHods etc. (no direct Supabase)
│       ├── modules/
│       │   ├── faculty/          # pages, components, api/facultyApi.ts, slices/facultySlice.ts, types
│       │   ├── hod/              # api/hodApi.ts, types (HOD module — under active development)
│       │   └── student/          # api/studentApi.ts, slices/studentSlice.ts, types/student.types.ts
│       └── landing/              # Purpose-built landing page (React + Tailwind)
├── docs/
│   ├── PERFORMANCE_AUDIT.md      # Live architecture/security/performance audit (sections A–U)
│   ├── RLS_AUTHORIZATION_DESIGN.md  # Policy model, rollout plan, verification record
│   └── Obsidian-Vault/           # 00_Main … 10_Comprehensive_Project_Report
├── vercel.json                   # Multi-service routing config
└── MASTER_DOCUMENTATION.md       # This file
```

---

## 3. Technology Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| Frontend SPA | React 19, Vite 8, TypeScript 7 | Type-safe reactive client UI |
| Styling & UI | Tailwind CSS 4, Google Material Symbols | Modern design system |
| Client Auth | Firebase Web SDK (v10) | Google OAuth & session management |
| Client DB | `@supabase/supabase-js` | Client config retained; **all table grants revoked** (no direct queries) |
| State | Redux Toolkit | facultySlice, studentSlice, college/admin slices |
| Backend API | Node.js 24, Express 4, TypeScript 5 | Business logic & secure endpoints |
| Server Auth | Firebase Admin SDK | ID token verification & claims |
| ORM & DB | Prisma ORM 5.22, PostgreSQL (Supabase) | Type-safe access & relational storage |
| Validation | Zod | Runtime payload validation |
| Security | helmet, cors, express-rate-limit | Hardening middleware |
| Deployment | Vercel (Multi-Services) | Edge routing to Backend and Frontend |

---

## 4. Architecture

### Backend (`backend/src/`)

- **Express 4** server; `app.ts` composes security middleware and mounts all routers; `server.ts` is the Vercel serverless entry.
- **`modules/`** organizes domain boundaries, each typically following **Controller → Service → Repository** (faculty, student) or Controller+Service (college-admin) patterns.
- **`middleware/`** holds cross-cutting Firebase auth (`authenticateFirebaseUser`), RBAC (`requireRole`), Zod validation, and centralized error handling.
- **`secure-data/`** is the new BFF (backend-for-frontend) that replaced all direct browser→Supabase PostgREST calls after RLS Phase 2.

### Request lifecycle

```
Browser (axios/fetch + fresh Firebase ID token)
   │  Authorization: Bearer <firebase-id-token>
   ▼
Vercel  ── /api/* ──▶  backend/src/server.ts → app.ts
   │  helmet / cors / rate-limit / json parsing
   ▼
authenticateFirebaseUser  (firebaseAuth.verifyIdToken → req.firebaseUid + req.verifiedEmail)
   ▼
Module-specific context builder (e.g. buildStudentContext, verifiedFacultyUid,
secureData actor resolution) — derives tenant/role from DB (authed_users + users + user_roles)
   ▼
Controller → Service → Repository (Prisma / parameterized raw SQL)
   ▼
PostgreSQL via IPv4 pooler (pgbouncer, port 6543) — connected role: postgres (owner)
```

> **Critical:** the backend connects as the **postgres owner**, which **bypasses RLS**. Server-side authorization checks in each service/controller are therefore *mandatory* — RLS deny policies protect against direct browser PostgREST access only.

### Frontend (`frontend/src/`)

- React Router v7 SPA with nested layouts (`FacultyLayout`, `HodLayout`, College Admin, Super Admin).
- Faculty module (`modules/faculty/`): pages + Redux Toolkit slice + axios API client with a request interceptor that **only accepts fresh Firebase tokens** (`auth.currentUser.getIdToken()`), never localStorage.
- Student module (`modules/student/`): same pattern (`studentApi.ts`, `studentSlice.ts`).
- `services/collegeService.ts` and `services/api/secureDataApi.ts` call backend BFF endpoints — **zero direct `supabase.from()`/`supabase.rpc()` calls remain in the frontend**.

---

## 5. Database Schema

**Live DB:** 24 public tables, 248 columns, 51 indexes (as of 2026-10-07 audit). All 24 tables now have **RLS enabled** with **no permissive policies** for `anon`/`authenticated`/`PUBLIC` (deny-only policies on the 9 browser-facing tables; grants revoked everywhere).

### 5.1 Prisma-managed models (16) — `backend/prisma/schema.prisma`

**Tenancy**
- `College` — `id`, `name`, `code`, `address`, `city`, `state`, `country`, `phone`, `email`, `website`, `logo_url`, `is_active`, `created_at`, `updated_at`

**Identity & RBAC**
- `Role` (`id`, `name` RoleName, `description`, `is_active`)
- `Permission` (`id`, `name`, `description`, `resource`, `action`)
- `RolePermission` (`roleId`, `permissionId`)
- `User` (`id`, `firebaseUid` unique, `email`, `phone`, `collegeId`, `status` AccountStatus)
- `UserRole` (`userId`, `roleId`)
- `Profile` (`userId` unique, `firstName`, `lastName`, `displayName`, `studentId`, `phone`, `address`, `city`, `state`, `dateOfBirth`, `gender`, `profilePhotoUrl`, `enrollmentYear`, `profileCompletionPercentage`, `bio`, `designation`, `department`)
- `AuthedUser` — `uid` (PK, Firebase UID), `email`, `display_name`, `photo_url`, `role` (text), `college_id` (uuid), `department_id` (uuid), `class_id` (uuid), `register_number`, `approval_status` (text)
- `AccountApproval` (`id`, `userId`, `requestedRole`, `requestedCollegeId`, `status` ApprovalStatus, `requestedBy`, `approvedBy`, timestamps)
- `Session` (`id`, `userId`, `tokenHash`, `expiresAt`, `revokedAt`)
- `AuditLog` (`id`, `actorId`, `action` AuditAction, `entityType`, `entityId`, `metadata` Json, `createdAt`)

**Academic entities**
- `Department` (`id`, `college_id`, `name`, `code`, `hod_uid`, `is_active`)
- `AcademicYear` (`id`, `college_id`, `name`, `start_date`, `end_date`, `is_current`)
- `Program` (`id`, `department_id`, `name`, `type`, `duration_years`, `is_active`)
- `Batch` (`id`, `program_id`, `start_year`, `end_year`, `is_active`)
- `Class` (`id`, `batch_id`, `name`, `current_semester`, `faculty_uid` (class incharge), `is_active`)
- `Semester` (`id`, `academic_year_id`, `term_number`, `start_date`, `end_date`)
- `Subject` (`id`, `department_id`, `name`, `code`, `credits`, `semester_number`, `is_active`)

**Enums:** `AccountStatus` (PENDING/ACTIVE/REJECTED/SUSPENDED/DISABLED), `ApprovalStatus` (PENDING/APPROVED/REJECTED), `RoleName` (STUDENT/FACULTY/TRAINER/HOD/TPO/COLLEGE_ADMIN/SUPERINTENDENT/SUPER_ADMIN), `AuditAction` (ACCOUNT_CREATED, LOGIN, LOGOUT, ACCOUNT_APPROVED, ACCOUNT_REJECTED, ROLE_CHANGED, ROLE_ASSIGNED, ROLE_REMOVED, COLLEGE_CHANGED, PROFILE_UPDATED, PASSWORD_CHANGED, SESSION_REVOKED, AUTHORIZATION_FAILURE, …)

### 5.2 Supabase-managed tables (outside Prisma; accessed via parameterized raw SQL)

| Table | Key columns | Notes |
|:---|:---|:---|
| `attendance_sessions` | `id` uuid, `class_id` uuid, `faculty_uid` text, `subject_id` uuid, `date` date, `period` text, `remarks` text, `created_at`, `updated_at` | One session per class+date+period |
| `attendance_records` | `id` uuid, **`attendance_session_id` uuid** (FK→sessions), `student_uid` text, `status` enum(PRESENT/ABSENT/LATE/EXCUSED), `remarks` text, `created_at` | Unique on `(attendance_session_id, student_uid)` |
| `class_timetables` | `id`, `class_id`, `day_of_week`, `period`, `start_time`, `end_time`, `subject_name`, `subject_code`, `faculty_name`, `room` | Class master schedule (CR-created) |
| `faculty_timetables` | `id`, `faculty_uid`, `day_of_week`, `period`, `start_time`, `end_time`, `class_id`, `class_name`, `subject_id`, `subject_name`, `room`, timestamps | Per-faculty schedule |
| `faculty_reminders` | `id`, `faculty_uid`, `title`, `type`, `status`, `due_date`, … | Faculty reminders |

> **Fixed bug:** two repository queries previously joined `attendance_records ar ON ar.session_id = s.id` — the real column is `attendance_session_id`. Corrected 2026-10-07 (faculty.repository.ts).

---

## 6. Backend Modules & API Catalog

Route mounting (`app.ts`):

```
app.use('/api/auth',         authRoutes)
app.use('/api/profiles',     profileRoutes)
app.use('/api/approvals',    approvalRoutes)
app.use('/api/users',        userRoutes)
app.use('/api/colleges',     collegeRoutes)
app.use('/api/college-admin',collegeAdminRoutes)   // requireRole('COLLEGE_ADMIN')
app.use('/api/faculty',      facultyRoutes)        // facultyAuthMiddleware + requireFaculty
app.use('/api/roles',        roleRoutes)
app.use('/api/audit',        auditRoutes)
app.use('/api/student',      studentRoutes)        // authenticateFirebaseUser + buildStudentContext
app.use('/api',              hodRoutes)            // /api/hod/*, /api/departments, /api/faculty(alias), /api/classes, /api/programs, /api/batches, /api/students, /api/subjects, /api/academic-years, /api/semesters
app.use('/api',              secureDataRoutes)     // /api/secure-data/*  + /api/public/*
```

Security middleware stack: `helmet()` → `cors(origin=FRONTEND_URL, credentials)` → `rateLimit` (disabled in dev; health check excluded) → `express.json({limit:'1mb'})`.

### 6.1 `modules/auth` — `/api/auth/*`

- `POST /api/auth/sync` — binds Firebase UID ↔ LMS account. **Hardened:** email must come from the *verified token* (`verifiedEmail`), UID remapping and email mismatch rejected; production rejects `dev-user-` prefixed tokens, unsigned JWTs, and localStorage tokens; fails closed.
- Login/logout/session flows with audit logging (`AuditLog`).

### 6.2 `modules/college-admin` — `/api/college-admin/*`

All routes: `authenticateFirebaseUser → requireUser → requireRole('COLLEGE_ADMIN')`.

- `GET  /api/college-admin/college/profile` — own college profile
- `PATCH /api/college-admin/college/profile` — update college profile (Zod `updateCollegeProfileSchema`)
- `POST /api/college-admin/departments` — create department (`createDepartmentSchema`)
- Additional CRUD handled via `collegeAdmin.service.ts` (tenant-scoped to the admin's `college_id`).

### 6.3 `modules/faculty` — `/api/faculty/*` (deep dive in §8)

### 6.4 `modules/student` — `/api/student/*` (deep dive in §7)

### 6.5 `modules/hod_temp` — HOD department-scoped endpoints

All sub-routers gated by `requireHODOrAdmin`:

- `/api/hod/*` — primary HOD namespace (`hodRoutes`)
- `/api/departments` — `GET /`, `GET /:id` → `hodController.getDepartment`
- `/api/faculty` — `GET /`, `GET /:facultyUid`
- `/api/classes` — `GET /`, `PATCH /:classId`, `PATCH|POST /:classId/faculty|/incharge` (assign class incharge)
- `/api/programs` — `GET /`, `POST /`, `PATCH /:programId`
- `/api/batches` — `GET /`, `POST /`, `PATCH /:batchId`
- `/api/students` — `GET /`, `GET /:studentId`
- `/api/subjects` — `GET /`, `POST /`, `PATCH /:subjectId`
- `/api/academic-years` — `GET /`
- `/api/semesters` — `GET /`

> Constraint from project history: **HOD module is under active development by other team members — do not modify.**

### 6.6 `modules/secure-data` — BFF replacing direct PostgREST (new, security-critical)

**Identity:** verifies Firebase ID token, resolves actor from `authed_users` (+`users`/`user_roles` reconciliation); role + tenant **derived from DB, never from request**.

**Endpoints (`secureData.routes.ts`, mounted at `/api`):**

- `/api/secure-data/colleges` — list colleges for actor's role/tenant
- `/api/secure-data/colleges/:collegeId/...` — college-scoped resources (admins, departments, programs, batches, classes, subjects, academic years, semesters, stats)
- `/api/secure-data/admins`, `/api/secure-data/users` — user management with role checks
- `/api/secure-data/approvals` — approval workflows
- `/api/secure-data/structure`, `/api/secure-data/stats` — tenant structure & statistics
- `/api/public/colleges` and `/api/public/colleges/:collegeId/departments` — **public discovery** using service role (no anon SELECT grants on the tables themselves)

**Authorization rules (`secureData.service.ts`):**
- `SUPER_ADMIN` → global access
- `COLLEGE_ADMIN` → own college only
- `HOD` → own department
- `FACULTY` → assigned class
- `STUDENT` → own enrollment
- Mutations run in **serializable transactions**; unknown roles fail closed.

### 6.7 Other modules

- `modules/approvals` — `/api/approvals/*` account-approval workflows (Super Admin / College Admin approve/reject `AccountApproval` records).
- `modules/users` — `/api/users/*` user directory & role assignment (RBAC-guarded).
- `modules/colleges` — `/api/colleges/*` college CRUD.
- `modules/profiles` — `/api/profiles/*` profile management.
- `modules/roles` — `/api/roles/*` role & permission CRUD.
- `modules/audit` — `/api/audit/*` audit-log read endpoints.

### 6.8 Shared utilities

- `utils/errors.ts` — `AppError(status, code, message)` for typed failures.
- `utils/response.ts` — `sendSuccess(res, data, status)` standard envelope `{ success, data }`.
- `utils/logger.ts` — structured logging.
- `lib/cache.ts` — `memoryCache` (get/set/del) used for dashboard/attendance caching in faculty module.

---

## 7. Student Module — Deep Dive

**File inventory (`backend/src/modules/student/` — 6 files, all analyzed):**

| File | Lines | Responsibility |
|:---|:---|:---|
| `student.routes.ts` | 93 | Route registration + `buildStudentContext` authorization gate |
| `student.controller.ts` | 133 | 12 thin handlers; Zod parse; `sendSuccess` envelope; errors → `next(error)` |
| `student.service.ts` | 421 | Business logic, hierarchy hydration, attendance computation |
| `student.repository.ts` | 577 | Prisma typed queries + parameterized raw SQL |
| `student.types.ts` | 216 | `StudentContext`, DTOs, response interfaces |
| `student.validation.ts` | 12 | Zod `updateProfileSchema` (`.strict()`) |

Singleton exports: `studentController` (controller), `studentService = new StudentService(new StudentRepository())`, `studentRepository`.

### 7.1 Architecture & request lifecycle

```
GET/PATCH /api/student/*   (Authorization: Bearer <firebase-id-token>)
  │
  ├─ authenticateFirebaseUser        (middleware/auth.middleware.ts)
  │    firebaseAuth.verifyIdToken(token)
  │    → req.firebaseUid, req.verifiedEmail, req.user{id, firebaseUid, email,
  │       collegeId, status, roles[]}     (from users + user_roles)
  │
  ├─ buildStudentContext             (student.routes.ts:10-49)
  │    prisma.authedUser.findUnique({ uid, include: [
  │       department → college_id,
  │       class → batch → program → department → college_id ] })
  │    → req.studentContext: StudentContext
  │
  └─ studentController.method(req) → studentService.method(studentContext) → studentRepository
       → Prisma / $queryRawUnsafe (parameterized, $1::uuid / $1::date casts)
```

### 7.2 `buildStudentContext` — authorization gate (fail-closed)

Throws `AppError(401/403)` unless **ALL** of the following hold (`student.routes.ts:23-31`):

1. `dbUser.role === 'STUDENT'`
2. `approval_status ∈ {'APPROVED','ACTIVE'}`
3. `dbUser.college_id` present
4. `req.verifiedEmail === dbUser.email` (case-insensitive, when verifiedEmail present) — token email is the identity source
5. `req.user.collegeId === dbUser.college_id` **AND** `req.user.roles` contains `STUDENT` (Firebase identity ↔ RBAC role reconciliation)
6. `dbUser.department.college_id === dbUser.college_id` (when a department is assigned)
7. `dbUser.class.batch.program.department.college_id === dbUser.college_id` (when a class is assigned)
8. `dbUser.class.batch.program.department_id === dbUser.department_id` (when both assigned) — class and department must agree

**Result:** `req.studentContext = { uid, email, displayName, photoURL, role, collegeId, departmentId, classId, registerNumber }`. Every downstream function receives only this context — **no student-supplied IDs are ever trusted**; all reads are scoped to the context fields.

### 7.3 Controller — 12 handlers (`student.controller.ts`)

All handlers follow the same pattern: `try { service(studentContext) → successResponse(res, data, 200, msg) } catch (error) { next(error) }`.

| Handler (line) | Reads | Service call | Response message |
|:---|:---|:---|:---|
| `getDashboard` (:11) | — | `getDashboard(studentContext)` | 'Student dashboard loaded successfully' |
| `getProfile` (:20) | — | `getProfile(studentContext)` | 'Student profile retrieved' |
| `updateProfile` (:29) | `req.body` → `updateProfileSchema.parse` | `updateProfile(studentContext, validated)` | 'Profile updated successfully' |
| `getClass` (:39) | — | `getClass(studentContext)` | 'Class information retrieved' |
| `getBatch` (:48) | — | `getBatch(studentContext)` | 'Batch information retrieved' |
| `getProgram` (:57) | — | `getProgram(studentContext)` | 'Program information retrieved' |
| `getDepartment` (:66) | — | `getDepartment(studentContext)` | 'Department information retrieved' |
| `getSubjects` (:75) | `req.query.semester` → `parseInt` | `getSubjects(studentContext, semesterNumber?)` | 'Department subjects retrieved' |
| `getClassIncharge` (:86) | — | `getClassIncharge(studentContext)` | 'Class Incharge faculty details retrieved' |
| `getAcademicYears` (:95) | — | `getAcademicYears(studentContext)` | 'Academic years retrieved' |
| `getSemesters` (:104) | — | `getSemesters(studentContext)` | 'Semesters retrieved' |
| `getTimetable` (:113) | — | `getClassTimetable(studentContext)` | 'Class master timetable retrieved' |
| `getAttendance` (:122) | `req.query.date` | `getAttendance(studentContext, date?)` | 'Student attendance and period logs retrieved' |

`successResponse` wraps `sendSuccess(res, data, status)` from `utils/response.ts` → standard `{ success, data }` envelope.

### 7.4 Service — 12 methods (`student.service.ts`)

| Method (line) | Logic | Errors |
|:---|:---|:---|
| `getDashboard` (:28) | Loads profile; if `classId`: class → batch → program chain, class-incharge faculty; resolves department from `program.departmentId \|\| studentContext.departmentId`; subjects filtered by **resolved dept + class currentSemester** (falls back to all department subjects if none for the semester); academic year = `isCurrent` \|\| first for college; semester = matching `classData.currentSemester` \|\| first. Returns full `StudentDashboardResponse` (:82-92). | — |
| `getProfile` (:98) | `repo.getStudentProfile(uid)` | 404 'Student profile record not found' |
| `updateProfile` (:109) | Delegates to `repo.updateStudentProfile(uid, updates)` | 404 'Student profile could not be updated' |
| `getClass` (:120) | Requires `classId`; loads class; hydrates `batch → program → department` and `classIncharge` onto the `ClassInfo` DTO | 404 'No class assigned…' / 'Assigned class not found in system' |
| `getBatch` (:151) | Resolves batch via `class.batchId`; hydrates `batch.program` | 404 'No class assigned, cannot resolve batch' / 'No batch associated…' / 'Batch record not found' |
| `getProgram` (:176) | Resolves program via `class → batch → programId`; hydrates `program.department` | 404 'No academic program associated…' / 'Program record not found' |
| `getDepartment` (:206) | Direct lookup by `studentContext.departmentId` | 404 'No department assigned…' / 'Department record not found' |
| `getClassIncharge` (:235) | Loads class, requires `classData.facultyUid`, then loads the incharge faculty record | 404 'No Class Incharge assigned to your class' / '…details could not be found' |
| `getAcademicYears` (:256) | Lists academic years for `studentContext.collegeId` | 404 'No college affiliated…' |
| `getSemesters` (:267) | Determines current academic year (`isCurrent` \|\| first), then lists its semesters; returns `[]` if none | 404 'No college affiliated…' |
| `getClassTimetable` (:285) | Returns `[]` when no `classId`; otherwise raw-SQL class timetable (has `[DEBUG-TIMETABLE]` console logs — cosmetic, safe to strip) | — |
| `getAttendance` (:301) | See §7.6 — the most complex method in the module | — |

### 7.5 Repository — 16 methods (`student.repository.ts`)

| Method (line) | Query / source | Notes |
|:---|:---|:---|
| `findAuthedUser` (:23) | `prisma.authedUser.findUnique({ where: { uid } })` | Maps snake_case → `StudentContext` |
| `getStudentProfile` (:48) | `authed_users` + `users` (by `firebaseUid`) + `profiles` (include) | Joins three identity stores; `dateOfBirth` ISO-serialized; `profileCompletionPercentage` defaults 85 |
| `updateStudentProfile` (:85) | `prisma.profile.upsert` (by `userId`) + `prisma.authedUser.update` (photo_url sync) | Only the 6 editable fields are written |
| `getClassById` (:127) | `prisma.class.findUnique` | `current_semester` defaults 1 |
| `getBatchById` (:147) | `prisma.batch.findUnique` | name = `"{start_year} - {end_year}"` |
| `getProgramById` (:167) | `prisma.program.findUnique` | — |
| `getDepartmentById` (:187) | `prisma.department.findUnique` include `college`; HOD lookup via `authedUser.findUnique({where:{uid:hod_uid}})` | Returns `collegeName` + nested `hod` object |
| `getSubjectsByDepartment` (:225) | `prisma.subject.findMany` where `department_id` (+ optional `semester_number`), ordered `semester_number asc, code asc` | `credits` defaults 3 |
| `getClassIncharge` (:251) | `authed_users` + `users`/`profiles` join | designation default 'Class Incharge / Assistant Professor' |
| `getAcademicYears` (:280) | `prisma.academicYear.findMany` where `college_id`, ordered `is_current desc, start_date desc` | — |
| `getSemesters` (:302) | `prisma.semester.findMany` (+ optional `academic_year_id`) include `academicYear`, ordered `term_number asc` | — |
| `getClassTimetable` (:328) | **Raw SQL** `SELECT … FROM class_timetables WHERE class_id = $1::uuid ORDER BY CASE LOWER(TRIM(day_of_week)) WHEN 'monday' THEN 1 … ELSE 8 END, period ASC, start_time ASC` | Catches errors → `[]` |
| `getStudentAttendanceSummary` (:369) | **Two raw SQL** aggregates on `attendance_records` (overall) and joined `attendance_sessions` (today, `s.date = CURRENT_DATE`) | Computes `percentage`, `isEligible = percentage >= 75`, `safeMargin` (int: spare attends above threshold, or negative misses below); zero-division safe; error → all-zero summary |
| `getSubjectAttendance` (:469) | **Raw SQL** (two variants — with optional `semester_number` filter, fallback without) joining `subjects LEFT JOIN attendance_sessions ON s.subject_id = sub.id LEFT JOIN attendance_records ar ON ar.attendance_session_id = s.id AND ar.student_uid = $1` where `sub.department_id = $2::uuid` | Per-subject `held/attended/excused/absent`, `percentage`, `status` = SAFE (≥75%) / CRITICAL (<75%) / NO_DATA (held=0) |
| `getAttendanceRecordsForDate` (:545) | **Raw SQL** join `attendance_records ar → attendance_sessions s (ar.attendance_session_id = s.id) → subjects sub → authed_users f (s.faculty_uid = f.uid)` where `ar.student_uid = $1 AND s.date = $2::date` | Returns session period/remarks, subject code/name, faculty display name, student status/remarks, `marked_at` |

> All raw SQL uses `prisma.$queryRawUnsafe` with **positional parameters** (`$1`, `$2::uuid`, `$2::date`) — values are never string-interpolated except the validated integer `semesterNumber`.

### 7.6 `getAttendance` — the composite attendance endpoint

`student.service.ts:301-417` builds `StudentAttendanceResponse { summary, subjectBreakdown, dailySchedule }`:

1. **summary** — `getStudentAttendanceSummary(uid)` (overall + today counts, percentage, 75% eligibility, safeMargin).
2. **subjectBreakdown** — `getSubjectAttendance(uid, departmentId, classData.currentSemester || 1)`.
3. **dailySchedule** — computes the current week's **Monday** from `selectedDateStr` (or today), then iterates Monday–Friday:
   - Filters `class_timetables` slots where `slot.day_of_week` matches the day (case-insensitive).
   - Fetches real records via `getAttendanceRecordsForDate(uid, dateStr)`.
   - Matches each slot's period to a record by `rec.period === slot.period || rec.period === 'Period N' || rec.period === 'N'` (tolerant of format drift).
   - Per-period output: `status` = record status, with **EXCUSED remapped to `ON_DUTY`**; unmatched slots = `SCHEDULED`; `markedAt` (HH:MM locale time), `verificationMethod` = 'Biometric Log' when a record exists else 'Scheduled', `topic` = session remarks → student remarks → 'Attendance Recorded' / 'Curriculum Session'.
   - `timeSlot` = `"start_time - end_time"` (or single/`Period N` fallback); `courseCode`/`courseName`/`facultyName`/`venue` from the timetable slot with sensible defaults.

### 7.7 Types & DTOs (`student.types.ts`)

- `StudentContext` (:1) — `{ uid, email, displayName, photoURL, role, collegeId, departmentId, classId, registerNumber }`
- `StudentProfile` (:13) — 20 fields incl. `studentId`, `profileCompletionPercentage`, `accountStatus`
- `StudentUpdateProfileDTO` (:34) — only `phone, address, city, state, profilePhotoUrl, bio` (all nullable/optional)
- `ClassInfo` (:43), `BatchInfo` (:56), `ProgramInfo` (:66), `DepartmentInfo` (:76, incl. nested `hod`), `SubjectInfo` (:92), `ClassInchargeInfo` (:102), `AcademicYearInfo` (:112), `SemesterInfo` (:121)
- `StudentDashboardResponse` (:134) — the 11-field aggregate
- `ClassTimetableSlot` (:146) — snake_case fields mirroring the `class_timetables` table
- `StudentAttendanceSummary` (:159) — 16 fields incl. `isEligible`, `safeMargin`, today-* counters
- `StudentSubjectAttendance` (:178) — with `status: 'SAFE' | 'CRITICAL' | 'NO_DATA'`
- `StudentPeriodAttendanceRecord` (:190) — `status: 'PRESENT' | 'LATE' | 'ABSENT' | 'ON_DUTY' | 'SCHEDULED' | 'NO_SESSION'`
- `StudentDayAttendance` (:204), `StudentAttendanceResponse` (:211)

### 7.8 Validation (`student.validation.ts`)

```ts
updateProfileSchema = z.object({
  phone: z.string().max(20).nullable().optional(),
  address: z.string().max(255).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  state: z.string().max(100).nullable().optional(),
  profilePhotoUrl: z.string().url().nullable().optional().or(z.literal('')),
  bio: z.string().max(500).nullable().optional(),
}).strict({ message: 'Modifying academic hierarchy, role, department, class,
                      batch, or register number is strictly forbidden' });
```

`.strict()` rejects **any** extra key — role, class, department, register number, etc. cannot be changed through this endpoint.

### 7.9 Route table (`student.routes.ts:55-90`)

All 12 routes sit behind `router.use(authenticateFirebaseUser)` + `router.use(buildStudentContext)`:

`GET /dashboard` · `GET /profile` · `PATCH /profile` · `GET /class` · `GET /batch` · `GET /program` · `GET /department` · `GET /subjects` · `GET /class-incharge` · `GET /academic-years` · `GET /semesters` · `GET /timetable` · `GET /attendance` (13 paths counting PATCH).

### 7.10 Frontend counterpart

- `frontend/src/modules/student/api/studentApi.ts` — `getAuthToken()` awaits `auth.authStateReady()` and requires `auth.currentUser` (fresh `getIdToken()`, never localStorage); generic `request<T>()` wrapper with Authorization header and error extraction.
- `frontend/src/modules/student/slices/studentSlice.ts` — Redux Toolkit slice with async thunks for all 12 resources; typed `StudentState` with per-slice `loading` flags and error slots.
- `frontend/src/modules/student/types/student.types.ts` — mirrors the backend DTOs 1:1 (`StudentProfile`, `ClassInfo`, `BatchInfo`, `ProgramInfo`, `DepartmentInfo`, `SubjectInfo`, `ClassInchargeInfo`, `AcademicYearInfo`, `SemesterInfo`, `ClassTimetableSlot`, `StudentAttendanceResponse`, …).

### 7.11 Security properties (verified)

- **No IDOR surface:** no endpoint accepts a student/class/department id from the client; all IDs come from the token-derived `studentContext`.
- **Tenant consistency enforced at the gate:** class → batch → program → department → college chain must equal the student's `college_id`, and department assignment must agree with the class's program department (conditions 6–8 in §7.2).
- **Identity binding:** token email must equal `authed_users.email`; RBAC `STUDENT` role must be present in `user_roles`.
- **Write surface minimal:** only 6 profile fields updatable; schema is strict.
- **SQL injection safe:** all raw SQL uses positional parameters with explicit casts.

---

## 8. Faculty Module — Deep Dive

**Files:** `backend/src/modules/faculty/` — `faculty.routes.ts`, `faculty.controller.ts`, `faculty.service.ts`, `faculty.repository.ts`, `faculty.types.ts`, `faculty.validation.ts`, `faculty.middleware.ts`.

### 8.1 Architecture

- `facultyAuthMiddleware` — verifies Bearer Firebase ID token via `firebaseAuth.verifyIdToken`, loads `authed_users`, attaches `req.facultyUser` (`AuthenticatedUserContext`).
- `requireFaculty` — enforces `role = 'FACULTY'` (or authorized academic staff).
- **`verifiedFacultyUid(req)`** (controller) — independently re-verifies the Firebase token and returns the UID. Used by **every** faculty endpoint (2026-10-07 hardening: all 20 hardcoded fallback UIDs `lZNUh1S3JMf9Lwcm1rptUaYyoS72` removed).
- **`verifiedFacultyActor(req)`** — additionally loads `college_id` / `department_id` from `authed_users` for department/college-scoped endpoints (`getDepartment`, `getSubjects`, `getAcademicYears`, `getSemesters`), failing with 403 unless role is FACULTY and approval is APPROVED.
- `FacultyRepository` enforces data access via two SQL guards:
  - `facultyAccessSql` — faculty row for `$2` with `role='FACULTY'`, `approval_status IN ('ACTIVE','APPROVED')`, active `users` record (status ACTIVE, matching college, active FACULTY role in `user_roles`).
  - `facultyClassAccessSql` — class `$1` reachable by faculty `$2`: `classes → batches → programs → departments` where `f.college_id = d.college_id AND f.department_id = d.id`, plus the same active-user checks. Used with `EXISTS (SELECT 1 FROM (${facultyClassAccessSql}) access)` to scope every class/attendance/student query, and `FOR SHARE OF c, f` row locks during attendance saves.

### 8.2 API Endpoints (`/api/faculty/*`)

| Endpoint | Handler | Authorization |
|:---|:---|:---|
| `GET /dashboard` | `getDashboard` | verifiedFacultyUid + repo scoping |
| `GET /today-reminders`, `GET /reminders/today` | `getTodayReminders` | verifiedFacultyUid |
| `GET /search?q=` | `search` | verifiedFacultyUid |
| `GET /profile` | `getProfile` | verifiedFacultyUid |
| `PATCH /profile` | `updateProfile` (Zod `updateProfileSchema`) | verifiedFacultyUid |
| `GET /departments` | `getDepartment` | verifiedFacultyActor → own department_id |
| `GET /subjects?semester=` | `getSubjects` | verifiedFacultyActor → own department_id |
| `GET /academic-years` | `getAcademicYears` | verifiedFacultyActor → own college_id |
| `GET /semesters` | `getSemesters` | verifiedFacultyActor → own college_id |
| `GET /classes`, `GET /classes/:classId`, `GET /classes/:classId/students` | `getAssignedClasses`, `getClassDetails`, `getClassStudents` | `assertFacultyClassAccess` |
| `GET /students/:studentId` | `getStudentDetails` | faculty class membership |
| `GET /attendance/session?classId&date&period` | `getAttendanceSession` | `assertFacultyClassAccess` |
| `POST /attendance/session` | `saveAttendanceSession` (Zod `markAttendanceSchema`) | `assertFacultyClassAccess` + `FOR SHARE` lock + upsert on `(attendance_session_id, student_uid)` |
| `GET /attendance/stats/:classId` | `getClassAttendanceStats` | `assertFacultyClassAccess` |
| `GET /attendance/history/:classId` | `getClassAttendanceHistory` | `assertFacultyClassAccess` |
| `GET /timetable` | `getTimetable` | `faculty_uid = verified uid` |
| `POST /timetable`, `POST /timetable/bulk` | `saveTimetableSlot`, `bulkSaveTimetable` | `faculty_uid` enforced |
| `DELETE /timetable/:id` | `deleteTimetableSlot` | `DELETE ... WHERE id=$1 AND faculty_uid=$2 RETURNING id` |
| `GET /reminders`, `POST /reminders`, `PATCH /reminders/:id`, `POST /reminders/:id/toggle`, `DELETE /reminders/:id` | reminder CRUD | all scoped `WHERE faculty_uid=$2` |
| `POST /classes/:classId/students/upload` | `bulkUploadStudents` | verifiedFacultyUid + class access |
| `POST /classes/:classId/students` | `addStudent` | verifiedFacultyUid + class access |
| `DELETE /classes/:classId/students/:studentUid` | `deleteStudent` | verifiedFacultyUid + class access |
| `POST /classes/:classId/representative` | `assignClassRepresentative` | verifiedFacultyUid + class access |
| `GET /classes/:classId/timetable` | `getClassTimetable` | verifiedFacultyUid + class access |
| `GET /performance/subjects/:subjectId` | subject-class performance | class access |

### 8.3 2026-10-07 hardening (completed)

1. **Column fix:** `ar.session_id` → `ar.attendance_session_id` in 2 repository queries (class overall attendance, per-student attendance map).
2. **Process-local fallbacks removed:** `getFacultyUserProfile` no longer mutates an in-memory profile on DB failure (now throws); `getTimetable` no longer retries with a different UID in non-production.
3. **All 20 endpoints** now derive identity from `verifiedFacultyUid()`/`verifiedFacultyActor()` — no `req.user?.uid || ... || '<hardcoded-uid>'` chains remain.

---

## 9. Middleware & Security Layer

| Middleware | File | Function |
|:---|:---|:---|
| `authenticateFirebaseUser` | `middleware/auth.middleware.ts` | Reads `Authorization: Bearer`, `firebaseAuth.verifyIdToken`, maps UID→`authed_users`+`users`+`user_roles`, attaches `req.firebaseUid`, `req.verifiedEmail`, `req.user {id, firebaseUid, email, collegeId, status, roles[]}`. Never trusts body-supplied ids. |
| `requireUser` | `middleware/auth.middleware.ts` | 401 if no resolved user |
| `requireRole('...')` | `middleware/rbac.middleware.ts` | RBAC gate (e.g. COLLEGE_ADMIN) |
| `validate(schema)` | `middleware/validation.middleware.ts` | Zod validation, 400 on failure |
| `facultyAuthMiddleware` / `requireFaculty` | `modules/faculty/faculty.middleware.ts` | Firebase verify + FACULTY role enforcement; attaches `req.facultyUser` |
| `requireHODOrAdmin` | `modules/hod_temp/middleware/authMiddleware.ts` | HOD/College-Admin gate for HOD namespace |
| `buildStudentContext` | `modules/student/student.routes.ts` | Student tenant/role consistency gate (§7.1) |
| `verifiedFacultyUid` / `verifiedFacultyActor` | `modules/faculty/faculty.controller.ts` | Independent token verification per sensitive request |
| `errorHandler` / `notFoundHandler` | `middleware/error.middleware.ts` | Centralized error envelope |
| helmet / cors / rateLimit | `app.ts` | Headers, origin allow-list (`FRONTEND_URL`), throttling (prod only) |

**Identity model:** Firebase token email is the identity source. `/api/auth/sync` binds it to `authed_users.email` — UID remapping and email mismatch are rejected. Production rejects `dev-user-` tokens, unsigned JWTs, and localStorage tokens; all flows **fail closed**.

---

## 10. Frontend Modules & State Management

| Path | Purpose |
|:---|:---|
| `App.tsx` | Root router: Home, Login, WaitingApproval, CollegeAdmin, SuperAdmin, `/faculty/*`; HOD dept lookup via secure API (no Supabase import) |
| `config/firebase.ts` | Firebase app + auth init (project `lms-college-5975a`) |
| `config/supabase.ts` | Supabase client with publishable key — **retained for compat; all table grants revoked so it cannot read data** |
| `store/index.ts` | Redux root store registering faculty/student/admin slices |
| `services/collegeService.ts` | College admin operations — fully rewritten to call `secureDataApi`; exports `mapToAuthedUserRecord` for user-list mapping |
| `services/api/secureDataApi.ts` | Axios client for `/api/secure-data/*` and `/api/public/*` (fixed doubled `/api` prefix) |
| `services/api/collegeProfile.ts` | College profile fetch with `auth.authStateReady()` guard |
| `components/CollegeAdmin/ManageHods.tsx` | HOD management UI — secure API only |
| `modules/faculty/api/facultyApi.ts` | Axios client; request interceptor demands a **fresh** Firebase token (`auth.currentUser.getIdToken()`) |
| `modules/faculty/slices/facultySlice.ts` | Redux Toolkit: dashboard, profile, classes, students, attendance, timetable, reminders, performance |
| `modules/faculty/pages/*` | 12 pages: Dashboard, Attendance (incl. `FacultyAttendancePage`), Classes & Students, Timetable, Reminders, Search, Performance, etc. |
| `modules/student/api/studentApi.ts`, `slices/studentSlice.ts`, `types/student.types.ts` | Student portal client, state, DTOs (§7.4) |
| `modules/hod/api/hodApi.ts`, `types/hod.types.ts` | HOD module client (under active development by others — do not modify) |
| `landing/` | Purpose-built landing page with dynamic previews and links to live portals |
| `pages/Login.tsx` | Firebase Google OAuth; **hardcoded superadmin credentials removed** |
| `layouts/*` | Sign out Firebase and clear token stores on logout |

---

## 11. RLS / Authorization Design & Implementation Status

Full design: `docs/RLS_AUTHORIZATION_DESIGN.md`. Audit evidence: `docs/PERFORMANCE_AUDIT.md`.

### Enforcement model

1. Firebase Admin verifies ID token (signature, project, expiry, UID). Email from the **verified token** only.
2. UID looked up in `authed_users`, reconciled with `users`/`user_roles` while both systems exist.
3. Access requires a trusted **active/approved** account with **consistent** tenant/role assignment; ambiguity or suspension **fails closed**.
4. Pre-provisioned students awaiting first login use a separate verified-email binding — **no arbitrary UID remap**.
5. No role/college/department/user id from a request body, URL, localStorage, or editable Firebase metadata may grant permissions.

### Rollout (applied live 2026-10-07)

- **Phase 1 (15 policy-less tables, no browser callers):** RLS enabled; `anon`/`authenticated` grants revoked. Migration: `backend/sql/rls_phase1_private_tables.sql`. Anon PostgREST now returns 401/42501 on these tables.
- **Phase 2 (9 browser-dependent tables: `colleges`, `authed_users`, `departments`, `programs`, `batches`, `classes`, `subjects`, `academic_years`, `semesters`):**
  - All direct PostgREST callers replaced by `/api/secure-data/*` and `/api/public/*` backend endpoints first.
  - **39 permissive policies dropped**; RLS enabled; `anon`/`authenticated`/`PUBLIC` grants revoked.
  - **18 explicit deny policies** created (9 anon + 9 authenticated) — migrations `backend/sql/rls_phase2_browser_tables.sql` + `apply_phase2.mjs` + `apply_deny_policies.mjs` (one-off scripts, removed after verification).
- **Result:** zero permissive client policies on all 24 public tables; frontend has zero `supabase.from(`/`supabase.rpc(` calls.
- **Backend connects as postgres owner (bypasses RLS)** — server-side authorization in `secureData.service.ts` / module services is the enforcement point.

### Verified behaviors

- anon denied on all 24 tables (401/42501 via PostgREST).
- Cross-student, cross-college, cross-department, cross-college-admin access denied via server checks.
- SUPER_ADMIN retains global access; COLLEGE_ADMIN own college; HOD own department; FACULTY assigned class; STUDENT own enrollment.
- Backend suite: **108 tests pass** (`portal-auth` 31, `auth-sync` 21, `hod-service-security` 12, `secure-data` 12, `schemas` 15, `rbac`, `auth`, `onboarding`, …). Frontend `tsc -b && vite build` succeeds.

---

## 12. Deployment Configuration

**Vercel multi-service routing (`vercel.json`):**

| Route | Target |
|:---|:---|
| `/api/(.*)` | `backend/src/server.ts` |
| `/(.*)` | `frontend/index.html` (React SPA) |

**Required Vercel environment variables:**

| Variable | Value |
|:---|:---|
| `DATABASE_URL` | `postgresql://…@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` (**IPv4 pooler — mandatory**; Vercel has no IPv6 route to the direct endpoint) |
| `DIRECT_URL` | `postgresql://…@db.lmnbsauvjqursjxocsgf.supabase.co:5432/postgres` (direct, for local Prisma migrations on IPv6-capable machines) |
| `FIREBASE_PROJECT_ID` | `lms-college-5975a` |
| `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | Firebase Admin service account (stored as secrets; **never commit**) |
| `FRONTEND_URL` | Hosted frontend domain (CORS allow-list) |

> **Connection note:** connected DB role is `postgres` (owner) — bypasses RLS, so server-side authorization is mandatory (see §11).

---

## 13. Development Log & Bug Registry

From `docs/Obsidian-Vault/06_Development_Log_&_Bugs.md` and the audit:

1. **Department deletion (FK error 23503):** manual cascading deletion in `collegeService.ts` clears related `authed_users`, `subjects`, `programs`, `batches`, `classes` before department removal.
2. **Super Admin assignment UI:** assigned `COLLEGE_ADMIN` users kept showing "Assign to College"; now shows green "Assigned to [College]" badge with "Unassign"; React state updated synchronously (no refresh).
3. **Landing page:** automated HTML→React conversion was buggy (overlap/colors/typography); replaced with purpose-built React + Tailwind (`landing/`).
4. **Vercel DB reachability:** Supabase direct endpoint is IPv6-only; Vercel lacks IPv6 → switched to IPv4 pooler `aws-0-ap-northeast-1.pooler.supabase.com:6543?pgbouncer=true`.
5. **Doubled `/api` prefix** in `secureDataApi.ts` base URL — fixed.
6. **`session_id` vs `attendance_session_id`** mismatch in faculty repository aggregates — fixed 2026-10-07.
7. **Process-local persistence** (in-memory profile/timetable fallback on DB failure) — removed 2026-10-07; failures now propagate.
8. **Hardcoded fallback UIDs** (`lZNUh1S3JMf9Lwcm1rptUaYyoS72`, department `1aa45ae9-e872-4931-8e67-22f5119ce498`, college `col-1790654578727-zhdd`) in faculty controller — all replaced with verified-token identity 2026-10-07.
9. **Login.tsx** hardcoded superadmin credentials — removed.
10. **Plaintext DB credentials** in `PROJECT_REPORT.md` and `docs/Obsidian-Vault/10_Comprehensive_Project_Report.md` — redacted with `[REDACTED_ROTATE_CREDENTIAL]` (rotation + git-history cleanup require the credential owner).

### Session history (Obsidian Vault `08_Conversation_History_&_Decisions.md`)

- Session 1: project ingestion, Claude persistent memory setup, Obsidian Vault + graph view.
- Faculty Portal (Kishore & team) integration across backend API, Redux store, routing.
- Multi-tenant security audit → RLS design → Phase 1 + Phase 2 live cutover (this project state).

---

## 14. Current Project Status & Verification

| Area | Status |
|:---|:---|
| RLS on all 24 public tables | ✅ Enabled, deny-only, grants revoked |
| Direct browser→Supabase access | ✅ Eliminated (BFF only) |
| Firebase token verification | ✅ All sensitive endpoints verify tokens; no UID/email trust from bodies |
| Faculty module hardening | ✅ Completed 2026-10-07 (identity, column fix, fallbacks removed) |
| Student module | ✅ Complete: 12 endpoints, strict context gate, fail-closed consistency checks |
| Backend tests | ✅ 108/108 pass (Vitest) |
| Frontend build | ✅ `tsc -b && vite build` succeeds |
| Live anon PostgREST probe | ✅ 401/42501 on all probed tables |

**Test suites:** `tests/portal-auth.test.ts` (31), `tests/auth-sync.test.ts` (21), `tests/hod-service-security.test.ts` (12), `tests/secure-data.test.ts` (12), `tests/schemas.test.ts` (15), plus `rbac`, `auth`, `onboarding`.

---

## 15. Open Items & Blockers

| Item | Owner needed |
|:---|:---|
| Supabase Advisor run (no MCP/dashboard credentials in workspace) | Supabase project owner |
| Vercel deployed-function verification (live `/api/*` smoke test) | Vercel/deployment owner |
| Supabase DB credential rotation + git-history remediation (credentials were committed in `PROJECT_REPORT.md` / Obsidian report; now redacted) | Credential owner |
| HOD module features (module owned by other team members — do not modify) | HOD module owners |

---

*Documentation sources: `docs/PERFORMANCE_AUDIT.md`, `docs/RLS_AUTHORIZATION_DESIGN.md`, `docs/Obsidian-Vault/00–10`, `backend/prisma/schema.prisma`, live Supabase `pg_catalog`/`information_schema`/`pg_policies` inspection, and direct source review of all backend modules and frontend services.*
