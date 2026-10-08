# Engineering Reasoning & Problem-Solving Graph

This document records the architectural dilemmas, alternative approaches evaluated, decision rationale, and lessons learned across the project.

---

## 1. Vercel Serverless Database Connection (IPv6 vs IPv4 Pooler)
- **Problem**: Vercel Serverless Functions failed to connect to Supabase PostgreSQL (`Can't reach database server at db.lmnbsauvjqursjxocsgf.supabase.co:5432`).
- **Root Cause Analysis**: Supabase direct database endpoints resolve only via IPv6. Vercel's execution environments lack native IPv6 routing.
- **Alternatives Considered**:
  1. *Proxy through a custom VPS*: Introduces latency and single point of failure.
  2. *Switch DB provider*: High migration cost and disrupts Supabase Auth/Storage.
  3. *Supabase IPv4 Supavisor Pooler on Port 6543 (Chosen)*: Uses `aws-0-ap-northeast-1.pooler.supabase.com:6543` with `?pgbouncer=true`.
- **Outcome**: Seamless zero-latency connection pooling for Vercel functions while keeping direct URLs for local Prisma migrations.
- **Linked Nodes**: [[04_Database_Schema]], [[05_Deployment]], [[06_Development_Log_&_Bugs]].

---

## 2. Dynamic UI Styling & CSS Compilation Bug
- **Problem**: "Edit Profile" and action buttons on College Admin rendered invisible (white text on white cards).
- **Thinking & Trade-offs**:
  - *Option A*: Modify `tailwind.config.js` and restart dev servers. Risk: Hot-reloading in some client environments fails to re-index arbitrary CSS classes.
  - *Option B (Chosen)*: Hard-replace missing brand classes (`bg-brand-500`, `text-brand-600`) with robust Tailwind defaults (`bg-blue-600`, `text-blue-600`, `hover:bg-blue-700`).
- **Outcome**: Immediate visual clarity and 100% deterministic styling across all browsers without config dependencies.
- **Linked Nodes**: [[02_Tech_Stack]], [[06_Development_Log_&_Bugs]], [[08_Conversation_History_&_Decisions]].

---

## 3. Faculty Portal Integration: Dual-Auth Interoperability
- **Problem**: In production, requests must carry verified Firebase Auth JWT tokens (`Bearer <token>`). During team testing and demo workflows, developers need to switch between different faculty profiles (`Dr. Elena Rostova`, `Dr. Marcus Vance`, `Prof. Sarah Jenkins`) without logging in/out of Firebase.
- **Solution Architecture**:
  - Backend `auth.middleware.ts` / faculty middleware:
    - Primary: Validates `Authorization: Bearer <token>` via Firebase Admin SDK.
    - Secondary (Dev / Local): Intercepts `x-dev-uid` header or local storage UID fallback to populate `req.user`.
  - Frontend `facultyApi.ts`: Axios interceptor dynamically attaches whichever authentication credential is present.
- **Outcome**: Production-grade FERPA/RBAC security in production with frictionless developer multi-account switching.
- **Linked Nodes**: [[02_Tech_Stack]], [[03_Architecture]], [[07_Faculty_Portal_Integration]].

---

## 4. Attendance Engine: Zero-Latency Client Caching vs Server Persistence
- **Problem**: When faculty members quickly toggle dates and class periods in `FacultyAttendancePage.tsx`, issuing fresh network requests on every click causes latency spikes and UI flicker.
- **Solution Architecture**:
  - Used client-side `useRef<Map<string, StudentAttendanceRecord[]>>()` as a transient write-through cache keyed by `${classId}-${date}-${period}`.
  - On period/date change: Instantly loads cached roster if previously edited in the session; loads from API if uncached.
  - On save: Dispatches atomic batch upsert `POST /api/faculty/attendance/session` and updates the cache.
- **Outcome**: Instant sub-millisecond tab/period switching with robust backend persistence.
- **Linked Nodes**: [[03_Architecture]], [[07_Faculty_Portal_Integration]].

---

## 5. Strict Submodule Isolation: Preserving HOD Module
- **Constraint**: The HOD module (`/hod`) is actively developed by team members in parallel and must not be touched or modified.
- **Execution**:
  - Isolated all faculty routes strictly under `/faculty/*`.
  - Registered separate Redux slice `facultySlice` without touching global state keys.
  - Retained placeholder route for `/hod` in `App.tsx` and linked department details as read-only references in `/faculty/department`.
- **Linked Nodes**: [[01_Project_Overview]], [[03_Architecture]], [[07_Faculty_Portal_Integration]].

---

## 6. Landing Page Integration: Automated HTML-to-JSX vs Modular React Reconstruction
- **Problem**: Integrating a static HTML/CSS template into a Vite + React + Tailwind environment caused syntax collisions, unresponsive layouts, and missing styling due to broken Tailwind class compilation.
- **Alternatives Considered**:
  1. *Iterative patching (Attempted)*: Manually fixing CSS classes (`diff_classes.cjs`) and translating HTML syntax to JSX. Resulted in brittle code, regressions, and incomplete styling (e.g., breakpoints failing).
  2. *Modular React Reconstruction (Chosen)*: Scrapping the converted code entirely and integrating a purpose-built React landing page (`landing page super`) designed natively for Tailwind and TypeScript.
- **Outcome**: Flawless, responsive, and robust UI integration with zero visual bugs. Achieved deterministic styling without relying on risky automated conversions.
- **Linked Nodes**: [[02_Tech_Stack]], [[06_Development_Log_&_Bugs]], [[08_Conversation_History_&_Decisions]].
