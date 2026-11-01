# Aura Academia — Application Workflow & System Architecture

**Project:** College Multi-Tenant Learning Management System (Aura Academia)  
**Date:** October 2026  
**Status:** Canonical Architecture & Operational Specification Document  
**Repository:** `College-LMS` (BIHER-LMS/College-LMS)  
**Live Production URL:** `https://college-lms-2026-ten.vercel.app`  

---

## 1. Executive System Overview & Tenancy Model

The **College Multi-Tenant Learning Management System (Aura Academia)** is an enterprise academic administration and digital learning operating system. Engineered for multi-institutional scalability, it hosts multiple colleges, universities, and polytechnic campuses under a unified, sovereign codebase while enforcing strict cryptographic and database-level data isolation.

### 1.1 Five-Tier Organizational Hierarchy
The platform segregates governance, operational management, instructional pedagogy, and student learning into five clear administrative tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TIER 1: SUPER_ADMIN                             │
│       System-Wide Governance • College Provisioning • Global Audits     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       TIER 2: COLLEGE_ADMIN                            │
│  Single Institution Tenant Boundary • Departments • Academic Structure  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           TIER 3: HOD                                  │
│   Single Department Scope • Faculty Load • Curriculum • Surveillance   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
┌───────────────────────────────────┐   ┌────────────────────────────────┐
│         TIER 4: FACULTY           │   │         TIER 5: STUDENT        │
│  Assigned Classes & Subjects      │   │  Enrolled Class & Subjects     │
│  1-Tap Attendance & Grading       │   │  Ledger, Schedule & AI Terminal│
└───────────────────────────────────┘   └────────────────────────────────┘
```

| Tier | Role | Scope Boundary | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Tier 1** | `SUPER_ADMIN` | Global (All Institutions) | Provisions college tenants, assigns initial College Admins, monitors global security and audit streams. |
| **Tier 2** | `COLLEGE_ADMIN` | Single College Tenant | Edits college profile, manages departments, defines academic structure (programs, batches, classes, subjects), manages users. |
| **Tier 3** | `HOD` | Single Department | Balances faculty workload, approves curriculum proposals, oversees departmental attendance surveillance. |
| **Tier 4** | `FACULTY` | Assigned Classes / Subjects | Marks 1-tap period attendance, reviews student leaves, records marks with rubrics, publishes assignments. |
| **Tier 5** | `STUDENT` | Own Class / Enrollment | Views real-time attendance ledger & safe margin, tracks timetable, applies for leaves, turns in assignments with SHA-256 receipts. |

---

## 2. End-to-End Authentication, Identity Binding & Session Lifecycle

Aura Academia implements an authoritative, zero-trust identity architecture pairing **Firebase Authentication** (client-side identity provider) with **Supabase PostgreSQL** (relational RBAC and profile store).

```
Browser Client (Firebase Web SDK v10)
  │
  ├─► 1. Google OAuth Single Sign-On (Firebase Auth)
  │        Returns Firebase ID Token (Signed JWT)
  │
  ├─► 2. Sync Request: POST /api/auth/sync (Authorization: Bearer <ID_TOKEN>)
  │        Vercel Serverless Function (Express 4 + Node 24)
  │        └── authenticateFirebaseUser Middleware
  │              ├── Verifies signature, expiry & project ID with Firebase Admin SDK
  │              ├── Extracts verified email: req.verifiedEmail (Source of Truth)
  │              └── Queries authed_users + users + user_roles in PostgreSQL
  │
  ├─► 3. Fail-Closed Tenant & Role Resolution
  │        ├── If account is NEW/UNAPPROVED ──► Redirects to /waiting-approval
  │        ├── If account has APPROVED role ──► Issues trusted role & tenant context
  │        └── Rejects token UID remapping or email mismatch
  │
  └─► 4. Client SPA Dynamic Redirection
           SUPER_ADMIN   ──► /super-admin
           COLLEGE_ADMIN ──► /college-admin
           HOD           ──► /hod
           FACULTY       ──► /faculty
           STUDENT       ──► /student
```

### 2.1 Critical Security Invariants in Auth
1. **Source of Truth Email:** The user's email is derived exclusively from the verified Firebase ID token (`req.verifiedEmail`). Request body emails are strictly discarded to eliminate identity impersonation.
2. **Zero IDOR Surface:** The client never passes user IDs, role names, or tenant IDs in request parameters. All backend controllers resolve the actor identity from the cryptographically verified token.
3. **Double Verification on Sensitive Endpoints:** Faculty and student controllers execute independent inline token verification (`verifiedFacultyUid(req)` and `buildStudentContext(req)`) on every sensitive read/write operation.
4. **Self-Service Status Polling:** Users on the `/waiting-approval` screen can poll the server with their active Firebase token; if a College Admin assigns a role, the client instantly transitions to their active portal without a hard browser reload.

---

## 3. Database Architecture & RLS Hardening (Phases 1 & 2)

The persistence layer is hosted on **Supabase PostgreSQL** and queried by the backend via **Prisma ORM 5.22** and parameterized raw SQL over an **IPv4 pgbouncer pooler** (port 6543).

### 3.1 Relational Data Models (24 Public Tables)
* **Tenancy & Branding:** `colleges` (institutional code, domain, contact info, logo URL, active status).
* **Identity & Granular RBAC:** `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `profiles`, `authed_users`, `account_approvals`, `sessions`, `audit_logs`.
* **Academic Structure:** `departments`, `programs`, `batches`, `classes`, `subjects`, `academic_years`, `semesters`.
* **Classroom Operations:** `attendance_sessions`, `attendance_records`, `class_timetables`, `faculty_timetables`, `faculty_reminders`, `student_leaves`.

### 3.2 Row Level Security (RLS) Lockdown
Prior to security hardening, client browsers connected via `@supabase/supabase-js` using publishable keys. In October 2026, the architecture underwent a comprehensive two-phase RLS lockdown:
* **Phase 1 (Private Tables):** 15 backend-only tables had RLS enabled, and all `anon` / `authenticated` privileges were revoked.
* **Phase 2 (Browser-Facing Tables):** 39 permissive client policies were dropped across the remaining 9 tables. 18 explicit `DENY` policies were instituted.
* **Backend-for-Frontend (BFF) Pattern:** All frontend data fetching was migrated to dedicated backend endpoints (`/api/secure-data/*` and `/api/public/*`). Direct client PostgREST calls were completely eliminated.
* **Server Owner Bypass:** The Express backend connects as the PostgreSQL owner (`postgres`), bypassing RLS. Server-side authorization checks in every service and controller are therefore mandatory and enforce strict tenant scoping.

---

## 4. Academic Entity Hierarchy & Lifecycle

Academic data conforms to a strict cascading relational hierarchy:

$$\text{College} \longrightarrow \text{Department} \longrightarrow \text{Program} \longrightarrow \text{Batch} \longrightarrow \text{Class} \longrightarrow \text{Student}$$

```
College (e.g. BIHER)
  └── Department (e.g. Computer Science & Engineering)
        ├── Program (e.g. B.Tech Computer Science - 4 Years)
        │     └── Batch (e.g. 2023 - 2027)
        │           └── Class / Section (e.g. CSE-A, Current Semester 5)
        │                 ├── Class Incharge (Assigned Faculty UID)
        │                 └── Enrolled Students (authed_users linked by class_id)
        └── Subjects Catalog (e.g. CS-301 Distributed Systems, Semester 5, 4 Credits)
```

### 4.1 Strict Hierarchy Gatekeeper (`buildStudentContext`)
Every student API request passes through a 7-point relational consistency validation in `student.routes.ts`:
1. `dbUser.role === 'STUDENT'`.
2. `approval_status IN ('APPROVED', 'ACTIVE')`.
3. `dbUser.college_id` must be present.
4. Token email must match `authed_users.email`.
5. `user_roles` must contain the `STUDENT` role.
6. The assigned department's `college_id` must match the student's `college_id`.
7. The assigned class's program department must match the student's assigned department.

If any link in this chain is broken or mismatched, the request **fails closed** with HTTP 403 Forbidden.

---

## 5. Core Operational Workflows

### 5.1 Real-Time Attendance Engine & Mathematical Formulation
Attendance in Aura Academia is legally binding, regulatory-compliant, and cryptographically tracked.

#### 1. The Regulatory Attendance Threshold ($75\%$)
Under university accreditation norms, a student must maintain a minimum of **$75\%$ overall attendance** across all subjects to qualify for end-semester examinations.

#### 2. Safe Margin Mathematical Formulation
The student dashboard and AI assistant continuously calculate the student's **Safe Margin** ($M$):

Let:
* $H = \text{Total class periods held to date}$
* $A = \text{Total class periods attended (including approved On-Duty / Medical leaves)}$
* $P = \frac{A}{H} \times 100 = \text{Current attendance percentage}$

**Case 1: Safe Zone ($P \ge 75\%$)**  
The safe margin $M$ represents the maximum number of future consecutive class periods the student can safely miss while keeping overall attendance at or above $75\%$:

$$\frac{A}{H + M} \ge 0.75 \implies A \ge 0.75(H + M) \implies 0.75 M \le A - 0.75 H$$

$$M = \left\lfloor \frac{A - 0.75 H}{0.75} \right\rfloor = \left\lfloor \frac{4A - 3H}{3} \right\rfloor$$

*Example:* If $H = 100$ and $A = 85$ ($85\%$):
$$M = \left\lfloor \frac{4(85) - 3(100)}{3} \right\rfloor = \left\lfloor \frac{340 - 300}{3} \right\rfloor = \left\lfloor 13.33 \right\rfloor = 13 \text{ classes safe to miss.}$$

**Case 2: Shortage Zone ($P < 75\%$)**  
The recovery deficit $D$ represents the minimum number of consecutive future classes the student must attend without missing a single period to restore attendance to $75\%$:

$$\frac{A + D}{H + D} \ge 0.75 \implies A + D \ge 0.75 H + 0.75 D \implies 0.25 D \ge 0.75 H - A$$

$$D = \left\lceil \frac{0.75 H - A}{0.25} \right\rceil = \lceil 3H - 4A \rceil$$

*Example:* If $H = 100$ and $A = 70$ ($70\%$):
$$D = \lceil 3(100) - 4(70) \rceil = \lceil 300 - 280 \rceil = 20 \text{ consecutive classes required.}$$

#### 3. Atomic Session Creation & Locking Physics
When a faculty member marks attendance via `POST /api/faculty/attendance/session`:
1. The backend acquires PostgreSQL row-level locks on the class and faculty record: `FOR SHARE OF c, f`.
2. The session record is created in `attendance_sessions` with unique constraint on `(class_id, date, period)`.
3. All student records are upserted into `attendance_records` inside a single serializable transaction.
4. Prevents race conditions and duplicate attendance submissions for the same period.

### 5.2 Student Medical & Academic Leave Lifecycle
1. **Application:** Student submits a leave application via `StudentAttendancePage.tsx` specifying category (`HEALTH`, `ACADEMIC_EVENT`, `PERSONAL`), dates, and explanation.
2. **Review Queue:** The assigned Class Incharge or Subject Faculty sees the pending application in the `Leaves` tab of `FacultyAttendancePage.tsx`.
3. **Approval & Status Propagation:** Once approved, the attendance engine automatically re-evaluates the student's period status to `ON_DUTY` or `EXCUSED`, updating the attendance percentage and safe margin.

### 5.3 Timetable & Period Scheduling
* **Class Master Timetable:** Created by the Class Incharge, mapping days of the week (`Monday` to `Friday`) and periods (`Period 1` to `Period 8`) to subjects, faculty, and room venues.
* **Faculty Schedule:** Synchronized view showing the faculty member's personal daily teaching commitments across different batches.
* **Student Daily View:** The student portal matches real-time period logs against scheduled timetable slots, presenting a clear indicator of completed, active, and upcoming classes.

### 5.4 Digital Content & Assignment Receipts
* Faculty members upload courseware, syllabus modules, and assignments.
* When students submit assignments, the system issues a verifiable receipt stamped with a cryptographic SHA-256 hash (e.g. `sha256:0x7a3f8b...`), establishing indisputable proof of submission time.

---

## 6. The 5-Stage Deterministic AI & Grounded RAG Architecture

Aura Academia incorporates an enterprise AI framework designed to eliminate hallucination in high-stakes academic administration.

```
Incoming Request (User Prompt + Token)
  │
  ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 01: USER CONTEXT                                 │
│ Cryptographically verified UID, Role, College, Dept    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 02: LMS INTERFACE                                │
│ Input sanitization • Prompt injection screening        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 03: AI ORCHESTRATOR                              │
│ Intent resolution • Canonical tool dispatch            │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 04: RAG & TOOL CALLING                           │
│ Deterministic DB Tools  │  Qdrant Vector RAG (Handbooks│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 05: VERIFIED OUTPUT                              │
│ Zod schema validation • Document source citation hashes│
│ [✓ Zero-Hallucination Guardrail Passed]                │
└────────────────────────────────────────────────────────┘
```

### 6.1 Strict Architectural Boundary: Tools vs RAG
* **Deterministic Data Tools:** Live personal facts (attendance percentage, timetable periods, class incharge, enrolled subjects, academic calendar) **must only be retrieved via deterministic database tools**. The LLM is never permitted to guess or hallucinate these values.
* **Grounded RAG Knowledge Tools:** Institutional bylaws, examination passing criteria, attendance condonation policies (medical leave thresholds, 75% rule), and disciplinary codes are retrieved from vector embeddings of approved institutional handbooks.
* **No Direct DB Access:** The LLM has zero database credentials, no Prisma access, and cannot execute arbitrary SQL queries.

### 6.2 Canonical Tool Registries
1. **Faculty AI Assistant (19 Canonical Tools):**
   * Class rosters, student search, attendance statistics, shortage reports, timetable lookups, daily reminder creation, subject performance metrics, departmental syllabus queries.
2. **HOD AI Assistant (7 Canonical Tools):**
   * Departmental attendance aggregate, faculty workload distribution, curriculum proposal status, course prerequisites, institutional policy search.
3. **Student AI Assistant (14 Canonical Tools):**
   * 12 Deterministic Data Tools: `get_student_attendance`, `get_class_timetable`, `get_enrolled_subjects`, `get_class_incharge`, `get_academic_calendar`, etc.
   * 2 Grounded RAG Tools: `search_academic_regulations`, `search_attendance_policies`.

### 6.3 Stage 5: Zero-Hallucination Guardrail
Before any response is synthesized:
1. Tool outputs are validated against strict Zod schemas.
2. Citations are matched against known document source hashes.
3. If an intent cannot be resolved or if required tool parameters are missing, the assistant fails closed and requests clarification rather than generating synthetic answers.

---

## 7. Performance, Latency Optimization & Edge Deployment

Aura Academia's infrastructure is deployed on **Vercel Multi-Services**:
* Root `vercel.json` routes `/api/(.*)` to the Node.js 24 Express backend serverless function (`backend/src/server.ts`).
* All frontend routes `/(.*)` fall back to the React 19 + Vite 8 SPA.

### 7.1 Connection Pooling & Database Latency
* **IPv4 Pooler URL:** Configured with `pgbouncer=true` on port 6543 to support high-concurrency serverless function scaling without exhausting PostgreSQL connection limits.
* **In-Memory Caching:** High-frequency read endpoints (such as faculty reminders and academic terms) utilize a lightweight in-memory cache with TTL invalidation on mutation.

### 7.2 Monotonic Performance Baselines
Empirical benchmarking using Node.js monotonic `performance.now()` across 20 iterations:
* `GET /api/health`: p50 latency **1.70ms** (local), **303.9ms** (cross-continent edge to Tokyo DB).
* `GET /api/student/dashboard`: p50 latency **1,420ms** (cold start: 3,250ms; payload: ~42.5 KB).
* `GET /api/faculty/dashboard`: p50 latency **1,380ms** (cold start: 2,900ms; payload: ~28.4 KB).

---

## 8. Summary of Motion Graphics Demonstration

The accompanying motion graphics demonstration (`motion-graphics/scene.html`) provides a frame-by-frame, broadcast-grade visualization of these core operational workflows:
* **Visualizing the Connected Ecosystem:** Animates real-time bidirectional data flows connecting HOD, Faculty, and Student workspaces to the central core.
* **Simulating Interactive User Flows:** An animated vector cursor demonstrates navigating the platform, selecting roles, inspecting platform capabilities, triggering AI orchestrator JSON inspector terminals, and authenticating via the secure portal modal.
* **Audio-Visual Synchronization:** 45 seconds of procedural synthesis mirroring clicks, tab snaps, data packet chatter, and security affirmation chimes.

---
*End of Application Workflow & System Architecture Document.*

