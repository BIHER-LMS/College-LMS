# Aura Academia (College LMS) — Complete Feature Catalog & Deep Analysis

**Project:** College Multi-Tenant Learning Management System (Aura Academia)  
**Date:** November 2026  
**Document Status:** Canonical Feature Specification & Functional Audit  
**Repository:** `College-LMS` (BIHER-LMS/College-LMS)  
**Live Production URL:** `https://college-lms-2026-ten.vercel.app`  

---

## Table of Contents

1. [Executive Summary & Architectural Scope](#1-executive-summary--architectural-scope)
2. [Public Landing Page, Interactive Showcase & Workspaces](#2-public-landing-page-interactive-showcase--workspaces)
3. [Authentication, Identity Binding & Security Infrastructure](#3-authentication-identity-binding--security-infrastructure)
4. [Super Admin Governance Portal (`/super-admin`)](#4-super-admin-governance-portal-super-admin)
5. [College Admin Portal (`/college-admin`)](#5-college-admin-portal-college-admin)
6. [HOD Departmental Governance Portal (`/hod/*`)](#6-hod-departmental-governance-portal-hod)
7. [Faculty Instructional Portal (`/faculty/*`)](#7-faculty-instructional-portal-faculty)
8. [Student Learning Hub & Terminal (`/student/*`)](#8-student-learning-hub--terminal-student)
9. [Attendance Engine & Mathematical Surveillance](#9-attendance-engine--mathematical-surveillance)
10. [Student Leave Management & Review Lifecycle](#10-student-leave-management--review-lifecycle)
11. [Master Timetable & Academic Calendar](#11-master-timetable--academic-calendar)
12. [Digital Courseware, Content & Assignment Receipts](#12-digital-courseware-content--assignment-receipts)
13. [Deterministic 5-Stage AI Framework & 40 Canonical Tools](#13-deterministic-5-stage-ai-framework--40-canonical-tools)
14. [Institutional Announcements & Communication Hub](#14-institutional-announcements--communication-hub)
15. [Audit Logging, Tenancy Boundaries & Zero-Trust RLS](#15-audit-logging-tenancy-boundaries--zero-trust-rls)
16. [Cloud Integrations & Auxiliary Storage Services](#16-cloud-integrations--auxiliary-storage-services)
17. [Code-Generated Motion Graphics & Procedural Audio Engine](#17-code-generated-motion-graphics--procedural-audio-engine)
18. [Exhaustive Backend API Route Catalog](#18-exhaustive-backend-api-route-catalog)

---

## 1. Executive Summary & Architectural Scope

Aura Academia is an enterprise-grade academic operating system built to unify academic governance, departmental administration, faculty classroom instruction, and student learning. The platform operates on a **strict multi-tenant architecture** capable of isolating distinct higher-education institutions while sharing a single performant codebase.

### 1.1 Five-Tier Governance Architecture
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

---

## 2. Public Landing Page, Interactive Showcase & Workspaces

The public-facing surface (`/` and `frontend/src/landing/`) functions as both an institutional showcase and an interactive simulator.

### 2.1 Universal Fixed Navigation Header (`Header.tsx`)
* **Frosted Glass Header:** Height 80px, sticky backdrop blur (`backdrop-blur-md bg-white/90 border-b border-[#c3c6d7]/30`).
* **Institutional Brand Mark:** Hexagonal blue gradient vector badge with authoritative logotype **Aura Academia** and `[ACADEMIC LMS]` badge in `JetBrains Mono`.
* **Universal Anchors:** In-page smooth-scroll navigation to `Overview`, `Modules`, `Ecosystem`, `Capabilities`, `Architecture`, `Technology`.
* **Live Role Segmented Switcher:** 1-click tab toggle between `HOD Workspace`, `Faculty Workspace`, and `Student Workspace` when entering simulated operating modes.
* **Direct Access CTAs:** Neutral `Sign In` modal trigger and solid electric blue `Explore LMS →` trigger.

### 2.2 3D Interactive Hero Experience (`HeroSection.tsx`)
* **Atmospheric Canvas Glows:** Ambient radial gradients (`#004ac6/5` and `#7bd0ff/15` at 120px blur).
* **Live Status Badge:** `CONNECTED ACADEMIC PLATFORM • ENTERPRISE READY` with a pulsing electric blue heartbeat dot.
* **3D Perspective Mouse-Tracking Tilt:** CSS 3D matrix (`perspective(1000px) rotateX(...) rotateY(...)`) holding **3 stacked structural glass cards**:
  1. *Layer 01 (HOD Governance):* Live metrics: Curriculum Flow (98% Synced), Faculty Allocation (24 Members - Optimal), Accreditation Audits (Immutable Hash `0x8f...2b9`).
  2. *Inter-Layer Laser SVG:* Pulsing SVG connector paths with animating energy packets (`<circle>` looping along SVG curves).
  3. *Layer 02 (Faculty Instruction):* 4 metric cards: Syllabus Delivery (75%), Submission Stream (42/48 Labs Submitted), Evaluation Rubric (Deterministic), Office Hours (3 Slots Booked).
  4. *Layer 03 (Student Terminal):* Real-time course cards: CS-301 Distributed Systems (94.2% A), CS-204 Data Structures II (91.0% A-), AI-101 Machine Intelligence (95.5% A).

### 2.3 Simulated Operating Workspaces
* **HOD Governance Console (`HodWorkspace.tsx`):**
  * Live curriculum review workflow with 1-click `Approve Proposal` and `Request Revision` actions that simulate universal state broadcasts.
  * Faculty headcount cards (24 active, 96% optimal load balance).
  * 1-tap `Rebalance Load` trigger that dynamically recalibrates faculty workload.
* **Faculty Instructional Workspace (`FacultyWorkspace.tsx`):**
  * Interactive 3-part evaluation rubric (Code Correctness, Architecture & Style, Test Coverage) computing dynamic letter grades (`A`, `A-`, `B+`, `B`).
  * Course syllabus distribution tracker.
  * Office hours scheduler (3 slots booked).
* **Student Learning Hub (`StudentWorkspace.tsx`):**
  * Interactive enrolled course grid with real-time grade calculations and lecture venue badges.
  * Assignment submission simulator generating instant cryptographic receipts with SHA-256 hashes (e.g. `sha256:0x7a3f8b...`).
  * Digital course materials repository.

### 2.4 The Connected Ecosystem Event Bus (`ConnectedEcosystemSection.tsx`)
* Central core router node (`#2563EB`) connected to 3 role satellite nodes (HOD, Faculty, Student) via bidirectional dashed SVG curves.
* Real-time event bus simulation: clicking `Simulate State Change` triggers an animated state pulse traversing all 3 nodes with live sub-millisecond latency telemetry (0.4ms).

### 2.5 11-Capability Exhaustive Matrix (`CapabilitiesSection.tsx` & `CapabilityModal.tsx`)
* Real-time search filter and category selector: `All (11)`, `Governance`, `Instruction`, `Security`, `AI Intelligence`, `Infrastructure`.
* 11 In-depth capability cards with interactive `View Architecture Spec →` modal triggers detailing technical schemas, endpoints, and security constraints.

---

## 3. Authentication, Identity Binding & Security Infrastructure

### 3.1 Authentication Architecture
* **Dual Auth Pairing:** Firebase Authentication Web SDK (Google OAuth SSO and email/password) on the client, verified server-side via Firebase Admin SDK.
* **Token Email as Ground Truth:** All server-side authorization derives the actor's verified email from `decodedToken.email` (`req.verifiedEmail`). Request-body emails are strictly ignored to prevent account impersonation.
* **Zero IDOR Surface:** Users cannot manipulate `uid`, `collegeId`, `departmentId`, or `role` via request bodies or URL parameters; all identities are resolved from token-derived context.

### 3.2 Dynamic Role Gatekeeper & Redirection (`App.tsx` & `Login.tsx`)
* Automatically syncs Firebase users into PostgreSQL via `/api/auth/sync`.
* Dynamic routing based on verified database role:
  * `SUPER_ADMIN` $\longrightarrow$ `/super-admin`
  * `COLLEGE_ADMIN` $\longrightarrow$ `/college-admin`
  * `HOD` $\longrightarrow$ `/hod`
  * `FACULTY` $\longrightarrow$ `/faculty`
  * `STUDENT` $\longrightarrow$ `/student`
  * Unapproved / New Account $\longrightarrow$ `/waiting-approval`

### 3.3 Account Onboarding & Self-Service Approval Polling (`/waiting-approval`)
* Awaiting-approval screen with real-time polling button (*"Check Approval Status"*).
* Allows newly approved users to enter their portal immediately without requiring a full browser refresh.
* Clean sign-out teardown clearing Firebase session and local storage tokens.

### 3.4 Transient Database Auto-Retry Engine
* Built-in connection pooler retry wrapper (`executeWithDbRetry`) in `auth.middleware.ts` and `recordAuthedUser` in `collegeService.ts`.
* Automatically tolerates and retries transient Supabase pooler sleep/cold starts (handling `ENOTFOUND` / `tenant/user not found` gracefully).

---

## 4. Super Admin Governance Portal (`/super-admin`)

The Super Admin portal is the global administrative command center for the entire platform.

### 4.1 Features & Capabilities
* **System-Wide Metric Bar:** Total colleges provisioned, global user headcount, active sessions, and database pool health.
* **Multi-Tenant Institution Creator:**
  * Modal form with real-time validation: College Name, Unique Code (e.g., `BIHER`, `IITM`), Allowed Email Domain (e.g., `@bharathuniv.ac.in`).
  * Physical Location: Address, City, State, Country.
  * Digital Branding: Official website URL and institutional logo URL with real-time image preview.
  * Initial Administrator Assignment: Binds designated College Admin by email and Firebase UID.
* **Institution Management Registry:**
  * Search, filter, edit, activate/deactivate colleges.
  * Reassign College Admins with automatic RBAC updates.
* **Institutional Audit Dossier (`CollegeLogsModal.tsx`):**
  * Terminal-style modal streaming live institutional event logs with actor UIDs, IP addresses, and timestamps.
* **Super Admin User Directory:**
  * View all authenticated users across all colleges with role and approval status management.

---

## 5. College Admin Portal (`/college-admin`)

The College Admin portal governs a single college tenant boundary with 15 granular administrative modules.

### 5.1 Features & Modules
* **College Profile Management (`CollegeProfile.tsx`):**
  * Live institutional profile editor with zero-mock policy (Address, Contact Phone, Official Email, Website, Logo URL with live preview).
* **Department Management (`CollegeDepartments.tsx`):**
  * Create, edit, and toggle academic departments (e.g., *Computer Science & Engineering*, *Mechanical Engineering*).
  * Assign and unassign Department Heads (HODs).
* **Academic Hierarchy Management:**
  * **Programs (`CollegePrograms.tsx`):** Define degree types (B.Tech, M.Tech, Ph.D.), duration in years, and department affiliation.
  * **Batches (`CollegeBatches.tsx`):** Group students by start and graduation years (e.g., *2023 - 2027*).
  * **Classes / Sections (`CollegeClasses.tsx`):** Create classroom sections (e.g., *CSE-A, Semester 5*) and assign the **Class Incharge** faculty member.
  * **Subjects Catalog (`CollegeSubjects.tsx`):** Create department subjects with course codes, credit allocations, and semester numbers.
* **User Management Directories:**
  * **HOD Management (`ManageHods.tsx`):** Assign, review, and manage Department Heads.
  * **Faculty Management (`ManageFaculty.tsx`):** Directory of department faculty with portal preview capability.
  * **Student Management (`ManageStudents.tsx`):** Enrolled student roster with approval, assignment, and registration number controls.
* **Administrative RAG Vault (`CollegeAdminRagVault.tsx`):**
  * Institutional document ingestion hub where official handbooks, examination codes, and academic regulations are uploaded, chunked, and embedded into Qdrant for RAG-powered AI tool queries.
* **Institutional Announcements (`CollegeAdminAnnouncements.tsx`):**
  * Broadcast college-wide notices with priority levels (`LOW`, `NORMAL`, `URGENT`), expiry dates, and department targeting.

---

## 6. HOD Departmental Governance Portal (`/hod/*`)

Designed exclusively for Department Heads to supervise academics, faculty allocation, and attendance.

### 6.1 Features & 14 Dedicated Routes
* **Dashboard Overview (`/hod`):** Key departmental metrics, active faculty strength, student enrollment, and daily attendance averages.
* **AI Executive Assistant (`/hod/chat`):** Grounded assistant backed by 7 canonical departmental tools (attendance aggregation, faculty load checks, regulatory bylaws).
* **Department Overview (`/hod/department`):** Vision, mission, department leadership, and affiliated academic structures.
* **Faculty Management (`/hod/faculty`):**
  * Faculty roster with workload indicators.
  * Automated load balancer highlighting overloaded or underutilized faculty.
* **Academic Programs & Batches (`/hod/programs`, `/hod/batches`):** Department-specific degree programs and graduating batches.
* **Classes & Class Incharge Management (`/hod/classes`):**
  * Assign and reassign Class Incharges to specific sections.
* **Students Directory (`/hod/students`):** Department-wide student directory with search, filter, and individual student dossiers.
* **Subjects & Syllabi (`/hod/subjects`):** Course curricula, credit allocations, and syllabus version tracking.
* **Attendance Surveillance (`/hod/attendance`):**
  * Departmental attendance heatmaps identifying classes or sections with abnormal absentee spikes.
* **Performance & Analytics (`/hod/analytics`):** Continuous Internal Assessment (CIA) performance trends and grade distributions.
* **Academic Calendar (`/hod/calendar`):** Departmental exam schedules, working days, and semester milestones.
* **Reports & Governance (`/hod/reports`):** Generate institutional compliance reports for accreditation bodies (NAAC/NBA).
* **Audit Dossiers (`/hod/audit`):** Cryptographically verifiable audit trail of all departmental approvals and grade submissions.

---

## 7. Faculty Instructional Portal (`/faculty/*`)

Engineered for classroom teachers and designated Class Incharges.

### 7.1 Features & Daily Workflows
* **Faculty Dashboard (`/faculty`):**
  * Daily class schedule with period indicators.
  * Pending attendance sessions alert.
  * Class Incharge status card.
* **Daily Reminders (`/faculty/reminders`):**
  * Interactive checklist of daily teaching commitments and pending grading tasks with 1-click completion.
* **The 4-Tab Attendance Engine (`/faculty/attendance`):**
  * *Tab 1 (Mark Attendance):* 1-tap period marking with `P` (Present), `A` (Absent), `L` (Late), `OD` (On Duty) toggles and "Mark All Present" button.
  * *Tab 2 (Shortage & Analytics):* Real-time calculation identifying students below $75\%$ attendance with class deficit counts.
  * *Tab 3 (Session History):* Searchable archive of all historical attendance sessions with faculty timestamps.
  * *Tab 4 (Student Leaves):* Review queue for student medical and academic leave applications with 1-click Approve/Reject.
* **Assigned Classes & Students (`/faculty/classes`):**
  * Roster of students in assigned classes.
  * Bulk student CSV upload capability.
  * Class Representative (CR) appointment tool.
  * Detailed student profile viewer (`FacultyStudentDetailsPage.tsx`).
* **My Subjects (`/faculty/subjects`):** Prescribed course syllabus, unit modules, and reference textbooks.
* **Learning Content Repository (`/faculty/content`):**
  * Upload lecture notes, slides, lab manuals, and PDFs via Cloudinary cloud storage.
* **Learning Analytics (`/faculty/analytics`):** Student performance tracking and assessment analytics.
* **Assignments Hub (`/faculty/assignments`):** Create, publish, and evaluate student coursework with rubrics.
* **Master Timetable (`/faculty/timetable`):** Weekly teaching schedule with room assignments.
* **Faculty AI Assistant (`/faculty/chat`):** Powered by **19 canonical tools** for timetable queries, class rosters, attendance shortage reports, and institutional policies.
* **Omnibar Global Search (`FacultySearchBar.tsx`):** Cmd+K modal for rapid navigation across students, subjects, classes, and settings.

---

## 8. Student Learning Hub & Terminal (`/student/*`)

A student-centric terminal providing authoritative academic tracking, attendance surveillance, and digital course access.

### 8.1 Features & 13 Dedicated Pages
* **Student Dashboard (`/student`):**
  * Personal profile card with official Register Number and Class Incharge details.
  * Real-time attendance percentage circular ring.
  * Today's class schedule showing current and upcoming periods with room numbers.
  * Enrolled subjects grid with credit counts.
* **Live Attendance Surveillance (`/student/attendance`):**
  * Overall percentage calculation with `ELIGIBLE` ($\ge 75\%$) or `SHORTAGE ALERT` ($< 75\%$) status.
  * **Safe Margin Indicator:** Exact number of classes the student can safely miss, or deficit classes required to regain eligibility.
  * Subject-by-subject attendance breakdown.
  * Weekly period-by-period attendance log (Monday–Friday) matching timetable slots.
  * **Leave Application Modal:** Submit medical or on-duty leave with category, dates, and documentation.
  * 1-Click verified attendance transcript download.
* **Weekly Class Timetable (`/student/timetable`):** Period-by-period class schedule with faculty names and classroom venues.
* **Enrolled Subjects (`/student/subjects`):** Complete course catalog for the active semester with syllabus breakdowns.
* **Digital Courseware (`/student/content`):** Access lecture notes, presentations, and supplementary reading uploaded by faculty.
* **Assignments & Submissions (`/student/assignments`):**
  * View pending assignments with due dates and rubrics.
  * Drag-and-drop file upload for submission.
  * **Cryptographic Submission Receipt:** Generates an immutable SHA-256 hash receipt verifying the exact timestamp of submission.
* **Academic Hierarchy Dossiers:**
  * `My Class` (`/student/class`), `My Batch` (`/student/batch`), `My Program` (`/student/program`), `My Department` (`/student/department`).
* **Class Incharge Contact Hub (`/student/class-incharge`):** Assigned faculty mentor's email, office hours, and consultation schedule.
* **Academic Calendar & Terms (`/student/academic-calendar`, `/student/semesters`):** Term dates, holidays, and exam schedules.
* **Student AI Academic Assistant (`/student/chat`):** Grounded assistant backed by **12 deterministic data tools** and **2 RAG tools**.

---

## 9. Attendance Engine & Mathematical Surveillance

### 9.1 Regulatory Attendance Threshold ($75\%$)
Under statutory accreditation standards, students must maintain $\ge 75\%$ overall attendance to be certified for end-semester examinations.

### 9.2 Safe Margin & Deficit Mathematical Formulation

Let:
* $H = \text{Total class periods held to date}$
* $A = \text{Total class periods attended (including approved On-Duty and Medical credits)}$
* $P = \frac{A}{H} \times 100 = \text{Current attendance percentage}$

#### Case 1: Safe Zone ($P \ge 75\%$)
The Safe Margin ($M$) represents the maximum consecutive future periods the student can safely miss while keeping attendance $\ge 75\%$:
$$\frac{A}{H + M} \ge 0.75 \implies M = \left\lfloor \frac{4A - 3H}{3} \right\rfloor$$

#### Case 2: Shortage Zone ($P < 75\%$)
The Recovery Deficit ($D$) represents the minimum consecutive future classes the student must attend without missing a single period to reach $75\%$:
$$\frac{A + D}{H + D} \ge 0.75 \implies D = \lceil 3H - 4A \rceil$$

### 9.3 Atomic Concurrency & Locking Physics
* When a faculty member marks attendance, the backend acquires PostgreSQL row-level locks on the class and faculty record: `FOR SHARE OF c, f`.
* Unique constraint on `(class_id, date, period)` in `attendance_sessions` strictly prevents duplicate or conflicting records.
* All student entries are committed inside an atomic serializable transaction.

---

## 10. Student Leave Management & Review Lifecycle

Integrated end-to-end between students, faculty mentors, and HODs (`backend/src/modules/leaves/`).

### 10.1 Leave Workflow
1. **Student Submission (`POST /api/leaves/apply`):**
   * Categories: `HEALTH` (Medical), `ACADEMIC_EVENT` (Symposium/Conference), `PERSONAL`, `OTHER`.
   * Date range (from date, to date) and detailed explanation.
2. **Faculty / Class Incharge Review Queue (`GET /api/leaves/class/:classId`):**
   * Filter by status: `ALL`, `PENDING`, `APPROVED`, `REJECTED`.
3. **Decision Sign-off (`PATCH /api/leaves/:id/review`):**
   * Faculty approves or rejects with optional remarks.
4. **Attendance Auto-Credit:**
   * Upon approval, periods falling within the approved leave date range are automatically recognized as `ON_DUTY` or `EXCUSED`, updating the student's attendance percentage and safe margin.

---

## 11. Master Timetable & Academic Calendar

### 11.1 Features
* **Master Class Timetables (`class_timetables`):**
  * Managed by Class Incharges and College Admins.
  * Day of week (`Monday` to `Friday`), Period (`Period 1` to `Period 8`), start time, end time, subject code, subject name, faculty name, and room venue.
* **Faculty Timetables (`faculty_timetables`):**
  * Auto-synchronized schedule mapping faculty members to assigned classes and periods.
* **Live Class Period Matching:**
  * Matches live clock time against scheduled timetable slots to display the "Currently Active" and "Next Up" classroom sessions.
* **Academic Terms & Semesters:**
  * Academic years with start and end dates (`academic_years`).
  * Semester definitions with term numbers and active term indicators (`semesters`).

---

## 12. Digital Courseware, Content & Assignment Receipts

### 12.1 Content Management System
* **Cloud File Ingestion (`POST /api/upload`):** Powered by Cloudinary cloud storage with automated MIME-type validation and size restrictions.
* **Digital Repository:** Faculty categorize materials by Subject, Module number, and Content Type (Lecture Slides, Notes, Lab Manuals, Syllabus Copies).
* **Multi-Format Markdown & Code Viewer:** Built-in viewer supporting GitHub Flavored Markdown, code syntax highlighting, KaTeX math rendering, and file downloads.

### 12.2 Assignment Submission & Cryptographic Proof
* Students submit lab reports and homework assignments via direct file upload.
* **SHA-256 Receipt Stamp:** Generates a cryptographic SHA-256 hash receipt (e.g. `sha256:0x8f3c9e...`) stored on the submission record. Guarantees immutable proof of timely turn-in.

---

## 13. Deterministic 5-Stage AI Framework & 40 Canonical Tools

Aura Academia implements an enterprise AI pipeline that strictly separates **deterministic database operations** from **vector-based policy RAG**, guaranteeing **zero hallucination**.

### 13.1 The 5-Stage Orchestration Pipeline
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

### 13.2 Complete 40 Canonical Tools Registry

#### A. Faculty AI Assistant (19 Canonical Tools)
1. `get_faculty_profile` — Loads verified faculty profile, designation, and department.
2. `get_assigned_classes` — Lists all classes assigned to the faculty member.
3. `get_class_details` — Retrieves class metadata, batch, program, and student strength.
4. `get_class_students` — Fetches enrolled student roster with register numbers and emails.
5. `get_student_details` — Looks up individual student profile, parent info, and contacts.
6. `get_attendance_session` — Retrieves marked attendance status for a specific class, date, and period.
7. `get_class_attendance_stats` — Computes overall class attendance average and shortage lists.
8. `get_class_attendance_history` — Lists historical attendance sessions for a class.
9. `get_today_reminders` — Fetches today's class schedule and pending attendance check-offs.
10. `get_reminders` — Retrieves all faculty reminders and scheduled tasks.
11. `create_reminder` — Schedules a new faculty reminder or grading deadline.
12. `get_faculty_timetable` — Fetches the faculty member's weekly teaching schedule.
13. `get_class_timetable` — Retrieves the master timetable for an assigned class.
14. `get_department_details` — Loads department overview, HOD info, and affiliated programs.
15. `get_department_subjects` — Lists all curriculum subjects prescribed for the department.
16. `get_academic_calendar` — Fetches academic years, terms, and working day schedules.
17. `get_semester_list` — Lists semesters and active term numbers for the college.
18. `search_academic_records` — Global search across students, subjects, classes, and rooms.
19. `search_regulations_rag` — Grounded RAG search across institutional handbooks and policies.

#### B. HOD AI Assistant (7 Canonical Tools)
20. `get_department_overview` — Loads department statistics, faculty count, and student totals.
21. `get_faculty_workload_distribution` — Computes teaching load across all department faculty.
22. `get_department_attendance_summary` — Aggregates departmental attendance across all sections.
23. `get_curriculum_proposals` — Fetches pending and approved syllabus revision proposals.
24. `get_class_incharges_overview` — Lists assigned Class Incharges across all department sections.
25. `get_course_prerequisites` — Inspects course prerequisite chains and credit norms.
26. `search_institutional_policies_rag` — Grounded RAG search for governance regulations and NAAC/NBA norms.

#### C. Student AI Assistant (14 Canonical Tools)
27. `get_student_profile` — Fetches verified student enrollment and register number.
28. `get_student_dashboard` — Aggregates academic dashboard summary and today's schedule.
29. `get_student_attendance` — Computes overall attendance percentage, eligibility status, and safe margin.
30. `get_subject_attendance` — Retrieves per-subject attendance breakdown (held, attended, percentage).
31. `get_daily_attendance_schedule` — Matches weekly timetable slots to real biometric/period logs.
32. `get_class_timetable` — Retrieves class master timetable and period timings.
33. `get_enrolled_subjects` — Lists all subjects and credit allocations for current semester.
34. `get_assigned_class` — Retrieves class section, batch, program, and department info.
35. `get_assigned_batch` — Fetches batch graduation window (e.g. 2023–2027).
36. `get_assigned_program` — Retrieves degree program information and duration.
37. `get_assigned_department` — Loads department leadership and HOD contact details.
38. `get_class_incharge` — Retrieves assigned faculty mentor's contact info and office hours.
39. `get_academic_calendar` — Fetches college academic terms, holidays, and exam dates.
40. `search_regulations_rag` — Grounded RAG search for attendance condonation (75% rule), CIA 40-mark evaluation distribution, end-sem exam passing criteria, and CBCS credit norms.

---

## 14. Institutional Announcements & Communication Hub

### 14.1 Features (`backend/src/modules/announcements/`)
* **Role-Targeted Announcements:** Publish notices scoped to `ALL`, `STUDENT`, `FACULTY`, `HOD`, or `COLLEGE_ADMIN`.
* **Priority Classification:** `LOW`, `NORMAL`, `URGENT` (triggers high-visibility banners in dashboards).
* **Automated Expiration:** Announcements automatically archive after their `expires_at` date.
* **Pinned Priority:** Critical administrative circulars can be pinned to the top of user feeds.

---

## 15. Audit Logging, Tenancy Boundaries & Zero-Trust RLS

### 15.1 Audit Trail Engine (`AuditLog`)
* Every administrative mutation, role elevation, login/logout, attendance commit, and account approval is recorded in `audit_logs`:
  * `actorId`, `action` (`ACCOUNT_CREATED`, `LOGIN`, `LOGOUT`, `ROLE_CHANGED`, `PROFILE_UPDATED`, etc.), `entityType`, `entityId`, `metadata` (JSON payload), `createdAt`, and `ipAddress`.

### 15.2 Row Level Security (RLS) Lockdown (Phases 1 & 2)
* **24 Public Tables:** All 24 PostgreSQL tables have **RLS enabled** with zero permissive client policies.
* **18 Explicit DENY Policies:** Deny all direct client-side PostgREST queries from browser keys.
* **Backend-for-Frontend (BFF) Pattern:** All frontend data fetching is mediated through backend endpoints (`/api/secure-data/*` and `/api/public/*`), enforcing tenant boundaries server-side.

---

## 16. Cloud Integrations & Auxiliary Storage Services

| Service | Provider | Purpose |
| :--- | :--- | :--- |
| **Authentication & IAM** | Firebase Auth & Admin SDK | Google OAuth, email/password sessions, JWT signing and verification. |
| **Relational Database** | Supabase PostgreSQL | Relational persistence, 24 tables, Prisma ORM, IPv4 pgbouncer pooler. |
| **Vector Database** | Qdrant Cloud | Vector embeddings for institutional handbooks, bylaws, and RAG search. |
| **LLM Inference** | Groq AI Cloud | Fast LLaMA 3.3 / GPT-OSS inference for AI orchestrator response synthesis. |
| **Media & File Storage** | Cloudinary Cloud | Secure upload and CDN delivery of lecture notes, PDFs, avatars, and assignment files. |
| **Edge Hosting** | Vercel Multi-Services | Edge reverse-proxy routing `/api/*` to Node.js backend and `/*` to React SPA. |

---

## 17. Code-Generated Motion Graphics & Procedural Audio Engine

The repository includes a standalone motion graphics video generation studio (`motion-graphics/`):

### 17.1 Visual Renderer (`scene.html`)
* **100% Code-Drawn Animation:** Pure HTML5 Canvas, SVG, and CSS drawing every frame at 1080p Full HD @ 60 FPS.
* **Deterministic Virtual Clock:** Implements `window.renderAt(t)` where every visual element is a pure mathematical function of time.
* **Interactive Vector Cursor Engine:** Recreates realistic user interaction across a 7-shot storyboard with cubic-bezier cursor movements, button depressions, tab snaps, and live JSON inspector terminals.

### 17.2 Procedural Audio Synthesizer (`generate-audio.mjs`)
* Synthesizes a 45.0-second, 44.1kHz 16-bit stereo PCM WAV file (`aura_academia_audio.wav`) using pure Web Audio math:
  * Warm C-Major 9th corporate synth pads.
  * Crystalline glass chimes (1318.5 Hz, E6).
  * Tactile button clicks (1900 Hz $\to$ 95 Hz pitch drops).
  * Micro-data packet chatter ticks (2400 Hz $\to$ 3150 Hz).
  * Security affirmation chords (F#6 1480 Hz + C#7 2217 Hz).

### 17.3 Automated MP4 Video Exporter (`render-mp4.mjs`)
* Uses headless Playwright to step through time, captures 2,700 lossless frames, and pipes them directly into `ffmpeg` with CRF 17 high-profile H.264 encoding and stereo AAC audio multiplexing, producing [`aura_academia_master.mp4`](file:///c:/Users/natha.HP/OneDrive/Documents/GitHub/College-LMS/motion-graphics/aura_academia_master.mp4).

---

## 18. Exhaustive Backend API Route Catalog

### 18.1 Authentication & Onboarding (`/api/auth/*`)
* `POST /api/auth/register` — Creates a new account in Firebase and PostgreSQL.
* `POST /api/auth/sync` — Binds verified Firebase token to LMS user record.
* `POST /api/auth/onboarding` — Submits onboarding profile and requested role.
* `GET  /api/auth/me` — Fetches current user profile and active sessions.
* `POST /api/auth/logout` — Revokes session and records audit event.
* `POST /api/auth/sessions` — Creates session token record.
* `GET  /api/auth/sessions` — Lists active user sessions.
* `DELETE /api/auth/sessions/:id` — Revokes specific session.
* `POST /api/auth/password-change` — Records password change event.

### 18.2 Super Admin & College Provisioning (`/api/colleges/*`)
* `GET  /api/colleges` — Lists all colleges.
* `POST /api/colleges` — Provisions a new college institution.
* `GET  /api/colleges/:id` — Retrieves college details.
* `PUT  /api/colleges/:id` — Updates college details.
* `DELETE /api/colleges/:id` — Deactivates college tenant.
* `POST /api/colleges/:id/admin` — Assigns College Admin to institution.
* `DELETE /api/colleges/:id/admin` — Unassigns College Admin.

### 18.3 College Admin Operations (`/api/college-admin/*`)
* `GET  /api/college-admin/college/profile` — Retrieves own college profile.
* `PATCH /api/college-admin/college/profile` — Updates college profile.
* `POST /api/college-admin/departments` — Creates department in own college.

### 18.4 Faculty Endpoints (`/api/faculty/*`)
* `GET  /api/faculty/dashboard` — Summary metrics, incharge status, today's schedule.
* `GET  /api/faculty/today-reminders` — Today's teaching reminders and classes.
* `GET  /api/faculty/reminders` — Lists all reminders.
* `POST /api/faculty/reminders` — Creates a reminder.
* `PATCH /api/faculty/reminders/:id` — Updates reminder.
* `DELETE /api/faculty/reminders/:id` — Deletes reminder.
* `GET  /api/faculty/classes` — Lists assigned classes.
* `GET  /api/faculty/classes/:classId` — Class details and statistics.
* `GET  /api/faculty/classes/:classId/students` — Enrolled student roster.
* `GET  /api/faculty/students/:studentId` — Student profile and guardian info.
* `GET  /api/faculty/attendance/session` — Reads marked attendance session.
* `POST /api/faculty/attendance/session` — Marks/saves class period attendance.
* `GET  /api/faculty/attendance/stats/:classId` — Class attendance statistics and shortage list.
* `GET  /api/faculty/attendance/history/:classId` — Historical attendance sessions.
* `GET  /api/faculty/timetable` — Faculty member's weekly schedule.
* `POST /api/faculty/timetable` — Saves timetable slot.
* `GET  /api/faculty/department` — Department leadership and info.
* `GET  /api/faculty/subjects` — Prescribed semester subjects.
* `GET  /api/faculty/profile` — Faculty personal profile.
* `PATCH /api/faculty/profile` — Updates phone, address, bio.
* `POST /api/faculty/chat` — Faculty AI Assistant chat endpoint.
* `GET  /api/faculty/ai/tools` — Metadata for all 19 canonical faculty tools.

### 18.5 HOD Departmental Endpoints (`/api/hod/*` & `/api/*`)
* `GET  /api/departments` — Department details.
* `GET  /api/faculty` — Department faculty directory.
* `GET  /api/classes` — Department classes.
* `PATCH /api/classes/:classId/incharge` — Assigns Class Incharge.
* `GET  /api/programs` — Department degree programs.
* `GET  /api/batches` — Department academic batches.
* `GET  /api/students` — Department student directory.
* `GET  /api/subjects` — Department subjects catalog.
* `GET  /api/academic-years` — College academic years.
* `GET  /api/semesters` — College semesters.
* `POST /api/hod/ai/chat` — HOD AI Assistant chat endpoint.

### 18.6 Student Endpoints (`/api/student/*`)
* `GET  /api/student/dashboard` — Student dashboard aggregate.
* `GET  /api/student/profile` — Student profile record.
* `PATCH /api/student/profile` — Updates editable personal fields (strict schema).
* `GET  /api/student/class` — Assigned class info.
* `GET  /api/student/batch` — Assigned batch info.
* `GET  /api/student/program` — Enrolled academic program.
* `GET  /api/student/department` — Assigned department info.
* `GET  /api/student/subjects` — Enrolled semester subjects.
* `GET  /api/student/class-incharge` — Assigned faculty mentor details.
* `GET  /api/student/academic-years` — College academic years.
* `GET  /api/student/semesters` — College semesters.
* `GET  /api/student/timetable` — Class master timetable slots.
* `GET  /api/student/attendance` — Complete attendance summary, subject breakdown, and period logs.
* `POST /api/student/ai/chat` — Student AI Academic Assistant chat endpoint.

### 18.7 Leave Management Endpoints (`/api/leaves/*`)
* `POST  /api/leaves/apply` — Student submits leave request.
* `GET   /api/leaves/my-leaves` — Student views submitted leaves.
* `GET   /api/leaves/class/:classId` — Faculty reviews leaves for a class.
* `PATCH /api/leaves/:id/review` — Faculty approves/rejects a leave.

### 18.8 Announcements Endpoints (`/api/announcements/*`)
* `GET    /api/announcements` — Lists announcements filtered by role and department.
* `POST   /api/announcements` — Publishes a new announcement.
* `DELETE /api/announcements/:id` — Deletes/archives an announcement.

### 18.9 Secure Data & Public Discovery (`/api/secure-data/*` & `/api/public/*`)
* `GET /api/public/colleges` — Public active colleges list (for onboarding).
* `GET /api/public/colleges/:collegeId/departments` — Public departments list.
* `GET /api/secure-data/colleges` — Role-scoped colleges list.
* `GET /api/secure-data/admins` — Admin user management.
* `GET /api/secure-data/users` — User directory.
* `GET /api/secure-data/approvals` — Pending role approvals.
* `GET /api/secure-data/stats` — Real-time college statistics.

### 18.10 Upload Endpoints (`/api/upload/*`)
* `POST /api/upload` — Direct Cloudinary asset upload with MIME and size validation.

---
*End of Complete Feature Catalog & Deep Analysis Document.*
