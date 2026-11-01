# Aura Academia — UI/UX & Page Design Deep Research

**Project:** College Multi-Tenant Learning Management System (Aura Academia)  
**Date:** October 2026  
**Status:** Canonical Design Research & Visual Specification Document  
**Target Applications:** Production React SPA, Motion Graphics Demo Engine, Design System Documentation  

---

## 1. Executive Design Philosophy: "Academic Infrastructure"

Aura Academia's visual design rejects the generic, playful aesthetic of standard consumer edtech in favor of an **ultra-precise, sovereign academic workstation**. Influenced by the functional density and instrument-grade precision of Linear, Stripe, Apple, and Vercel, the platform treats academic management as critical national infrastructure.

### 1.1 Core Visual Axioms
* **Daylight High-Clarity Canvas:** High-contrast daylight surfaces engineered to eliminate eye fatigue across long administrative, grading, and study sessions.
* **Instrument-Grade Boundary Physics:** Elimination of heavy, decorative drop shadows. Spatial separation is achieved exclusively through **1px calibrated hairline strokes** (`#E2E8F0` / `#C3C6D7`) and micro-tinted canvas containers.
* **Typographic Authority:** Clear three-family typographic hierarchy:
  * **Headlines & Primary Metrics:** *Plus Jakarta Sans* (Weight 600, 700, 800) with tight negative tracking (`-0.025em` to `-0.03em`) for authoritative titles.
  * **Dense Transactional UI & Body:** *Inter* (Weight 400, 500, 600) with tabular figures (`tnum`) for rosters, gradebooks, attendance logs, and timestamps.
  * **System Identifiers, Hashes & Code:** *JetBrains Mono* (Weight 500, 600, 700) for course codes (e.g., `CS-301`), hashes (`sha256:0x8f...`), and JSON payloads.
* **Deterministic Color Accents:** Pure functional color application:
  * Primary Accent: **Electric Institutional Blue** (`#004AC6` / `#2563EB`) signifying active state and verified authority.
  * Telemetry & Compute: **Vivid Cyan** (`#00687A` / `#4CD7F6` / `#06B6D4`) denoting real-time event bus synchronization and active AI tool calls.
  * Sovereign Inks: Deep sovereign navy (`#0B1C30` / `#0F172A`) replacing pure harsh black for WCAG AAA legibility.
* **Restrained Corner Radii:** Geometric stability maintained via tight radii:
  * Small inputs, badges, table cells: `4px` to `6px` (`rounded-md`).
  * Feature cards and data panels: `8px` to `12px` (`rounded-xl`).
  * Modal overlays and dialog containers: `12px` to `16px` (`rounded-2xl`).
  * Avatars and status telemetry pips: `50%` (`rounded-full`).

---

## 2. Complete Design Tokens & Color Palette

### 2.1 Color Tokens Matrix
| Token Name | Hex Code | Functional Role in UI |
| :--- | :--- | :--- |
| **Canvas Background** | `#FAF8FF` / `#F8F9FF` | Universal background for landing page and daylight application shells. |
| **Surface Lowest (Pure)** | `#FFFFFF` | Core card surfaces, table rows, input backgrounds, modal sheets. |
| **Surface Container Low** | `#F2F3FF` / `#EFF4FF` | Active category filters, breadcrumb wells, secondary metric wells. |
| **Surface Container Mid** | `#EAEDFF` / `#E5EEFF` | Icon badge containers, secondary hover states, progress troughs. |
| **Surface Hairline Border**| `#E2E8F0` / `#C3C6D7` | 1px boundary dividing cards, table cells, navigation sidebars. |
| **Primary Blue (Deep)** | `#004AC6` | Primary buttons, brand logotype, active navigation links, focal headings. |
| **Primary Container (Vivid)**| `#2563EB` | Active cursor trails, interactive pills, focus rings, progress indicators. |
| **Secondary Teal/Cyan** | `#00687A` / `#06B6D4` | Real-time event bus, telemetry pulses, syllabus sync badges. |
| **Sovereign Ink (Primary Text)**| `#0B1C30` / `#0F172A` | Highest-contrast headlines, student names, data values, modal titles. |
| **Muted Slate (Secondary Text)**| `#434655` / `#475569` | Explanatory subtext, table column headers, timestamps, inactive icons. |
| **Ash Metadata (Tertiary)** | `#737686` / `#64748B` | Subtle captions, keyboard shortcut tags (`<kbd>`), footnote credits. |
| **Semantic Success** | `#059669` / `#10B981` | Safe attendance ($\ge 75\%$), approved status, zero-hallucination pass. |
| **Semantic Warning** | `#D97706` / `#F59E0B` | Pending approvals, attendance warning buffer ($70\% - 74.9\%$). |
| **Semantic Critical/Error** | `#DC2626` / `#BA1A1A` | Attendance shortage ($< 75\%$), rejected proposals, error toasts. |
| **Console Dark Slate** | `#0B1727` / `#0D1C32` | Dark navigation sidebars (Student & HOD portals), JSON terminal viewer. |

### 2.2 Elevation & Depth System
Aura Academia eliminates muddy box shadows. Instead, it utilizes **multi-layered precision physics**:
1. **Level 0 (Flat Ground):** `#FAF8FF` or `#FFFFFF` without shadow.
2. **Level 1 (Card & Section):** `#FFFFFF` with `1px solid #E2E8F0` and micro-elevation `0 1px 3px rgba(15, 23, 42, 0.04)`.
3. **Level 2 (Active/Hover Cards):** Subtle border shift to `#CBD5E1` with `0 4px 12px rgba(15, 23, 42, 0.06)`.
4. **Level 3 (Modals & Overlays):** `#FFFFFF` with `1px solid #E2E8F0` accompanied by ambient occlusion: `0 1px 2px rgba(15, 23, 42, 0.04), 0 16px 36px -4px rgba(15, 23, 42, 0.12)`.
5. **Glassmorphism / Frosted Bar:** Universal header and studio floating bars use `backdrop-filter: blur(16px)` with `rgba(255, 255, 255, 0.88)` and a `1px` bottom border in `#E2E8F0`.

---

## 3. Deep Analysis: Landing Page & Public Workspaces

The landing page (`frontend/src/landing/App.tsx` and `pages/Home.tsx`) is a high-performance interactive showcase that immediately demonstrates the multi-role capabilities of the LMS.

### 3.1 Universal Fixed Navigation Header (`Header.tsx`)
* **Visual Appearance:** Height 80px (`pt-20` on body), sticky frosted glass (`backdrop-blur-md bg-white/90 border-b border-[#c3c6d7]/30`).
* **Brand Lockup:** Hexagonal institutional logo mark (`#004AC6`), bold logotype **Aura Academia**, and high-authority badge `[ACADEMIC LMS]` in `JetBrains Mono` font (`bg-[#eff4ff] text-[#004ac6] border border-[#d3e4fe]`).
* **Navigation Links:** `Overview`, `Modules`, `Ecosystem`, `Capabilities`, `Architecture`, `Technology`. Hovering produces a soft pill highlight (`hover:bg-[#eff4ff] text-[#004ac6]`).
* **Role Switcher Pills:** When viewing a workspace, an inline segmented switcher allows 1-click toggling between `HOD`, `Faculty`, and `Student`.
* **Action CTAs:** White neutral `Sign In` button and solid electric blue `Explore LMS →` button (`bg-[#2563eb] text-white`).

### 3.2 Hero Section with 3D Layered Visualization (`HeroSection.tsx`)
* **Background Atmosphere:** Deep ambient circular glows (`#004ac6/5` and `#7bd0ff/15` blurred at 120px) creating a majestic daylight depth.
* **Tagline Pill:** `CONNECTED ACADEMIC PLATFORM • ENTERPRISE READY` with a pulsing electric blue telemetry dot.
* **Hero Headline:** *"Everything Your College Needs. Connected."* in 56px Plus Jakarta Sans bold.
* **3D Interactive Tilt Engine:** A mouse-following CSS 3D perspective container (`perspective(1000px) rotateX(...) rotateY(...)`) holding **3 stacked structural glass cards**:
  1. **Top Layer (HOD Module — Governance):** Features live wireframe metrics: *Curriculum Flow (98% Synced)*, *Faculty Allocation (24 Members - Optimal)*, and *Accreditation Audits (Immutable Hash `0x8f...2b9`)*.
  2. **Inter-Layer Connection SVG:** Animated laser connector paths with pulsing cyan energy pulses (`<circle r="3.5">` animating along path).
  3. **Middle Layer (Faculty Module — Pedagogy):** Features 4 metric cards: *Syllabus Delivery (75%)*, *Submission Stream (42/48 Labs Submitted)*, *Evaluation Rubric (Deterministic)*, *Office Hours (3 Slots Booked)*.
  4. **Bottom Layer (Student Module — Learning Hub):** Features 3 enrolled course cards: *CS-301 Distributed Systems (94.2% A)*, *CS-204 Data Structures II (91.0% A-)*, and *AI-101 Machine Intelligence (95.5% A)* with visual progress bars and lecture halls.

### 3.3 One Platform. Three Experiences (`ThreeExperiencesSection.tsx`)
* Recreates the tri-tier role segmentation in 3 grand architectural panels:
  * **HOD Panel:** Governance dashboard, curriculum oversight, accreditation audit trail.
  * **Faculty Panel:** Fast attendance entry, rubric-based evaluation, student mentoring.
  * **Student Panel:** Real-time attendance ledger, class timetable, direct advisor access.
* Clicking any card dynamically pivots the entire viewport into the live simulated role workspace.

### 3.4 The Connected Ecosystem Event Bus (`ConnectedEcosystemSection.tsx`)
* **Visual Metaphor:** A central circular hub node (`#2563EB` with `hub` icon) surrounded by three role satellite nodes (`HOD`, `Faculty`, `Student`).
* **Animated SVG Physics:** Bidirectional dashed SVG curves connecting nodes to the core. Animated SVG circles represent real-time state events traversing the bus.
* **Simulation Console:** Users can click `Simulate State Change` to trigger an instantaneous 0.4ms event propagation across all nodes with live event stream logging.

### 3.5 Exhaustive Platform Capabilities Matrix (`CapabilitiesSection.tsx`)
* **Category Filter Bar:** Horizontal pill strip with counts: `All (11)`, `Governance`, `Instruction`, `Security`, `AI Intelligence`, `Infrastructure`.
* **Search Input:** Real-time filtering across titles and descriptions.
* **11 Capability Cards:** Clean white cards with 1px hairline border, hover elevation, and a distinct `View Architecture Spec →` link opening the `CapabilityModal`.
* Key Capabilities:
  1. *Hierarchical Multi-Tenancy*
  2. *Cryptographic Role Enforcement (RLS)*
  3. *Deterministic AI Orchestrator*
  4. *RAG-Based Knowledge Access*
  5. *Real-Time Attendance Engine*
  6. *Automated Timetable Matrix*
  7. *Rubric-Based Evaluation Engine*
  8. *Departmental Governance Console*
  9. *Student Learning Hub*
  10. *Enterprise Audit Trail*
  11. *Multi-Service Edge Routing*

### 3.6 5-Stage Deterministic AI Framework (`DeterministicAISection.tsx`)
* **Header:** *"An LMS Built for Intelligent Assistance — Grounding modern language intelligence in verified institutional knowledge and deterministic tools."*
* **Interactive 5-Stage Stepper:**
  * `Stage 01: User Context` (Role claims, department scope)
  * `Stage 02: LMS Interface` (Sanitized tokens, session state)
  * `Stage 03: AI Orchestrator` (Intent resolution engine, confidence score: 0.998)
  * `Stage 04: RAG & Tool Calling` (Vector handbook retrieval, typed DB tool execution)
  * `Stage 05: Verified Output` (Deterministic schema verification, source citation hash)
* **Dark Terminal Code Inspector:** When clicking any stage, the split-view renders a dark console (`#0B1727`) with syntax-highlighted JSON representing the exact execution payload, complemented by a green `[✓ Zero-Hallucination Guardrail]` certification badge.

### 3.7 Production Grade Stack (`TechStackSection.tsx`)
* Visualizes the 4 engineering tiers in stacked architecture cards:
  * **Layer 01: Client & Presentation Tier** (`React 19`, `Vite 8`, `Tailwind CSS 4`, `Redux Toolkit`).
  * **Layer 02: Application & BFF Service Tier** (`Node.js 24`, `Express 4`, `TypeScript 5`, `Zod`).
  * **Layer 03: Persistence & Tenancy Tier** (`Supabase PostgreSQL`, `Prisma ORM 5.22`, `IPv4 Pooler`).
  * **Layer 04: Security & Intelligence Tier** (`Firebase Admin SDK`, `RLS Deny Policies`, `Qdrant RAG`).

### 3.8 Modals & Overlays
* **`CapabilityModal.tsx`:** Centered 720px wide inspection dialog with blurred backdrop, displaying the deep architectural specification, API endpoints, schema fields, and security constraints.
* **`SignInModal.tsx`:** The authentic Aura Academia **Welcome Back** modal with institutional Google SSO button, email credential inputs, "Remember credentials" checkbox, and a secure `[Sign In →]` button that triggers green verification feedback.

---

## 4. Deep Analysis: Authentication & User Onboarding

### 4.1 Login Screen (`frontend/src/pages/Login.tsx`)
* **Layout:** Split-screen or centered card with clean `#F8FAFF` background.
* **Branding:** Prominent **Aura Academia** logo mark with blue gradient fill.
* **Google OAuth Button:** Full-width white button with official Google SVG icon, hairline border, and text *"Sign in with Google"*.
* **Zero-Mock Sync Engine:** On successful authentication, automatically invokes `recordAuthedUser()`, syncing the user's Firebase UID, verified email, and profile photo into the PostgreSQL `authed_users` table.
* **Dynamic Gatekeeper Routing:**
  * `SUPER_ADMIN` $\rightarrow$ Redirects to `/super-admin`.
  * `COLLEGE_ADMIN` $\rightarrow$ Validates tenant assignment and routes to `/college-admin`.
  * `HOD` $\rightarrow$ Validates department assignment and routes to `/hod`.
  * `FACULTY` $\rightarrow$ Routes to `/faculty`.
  * `STUDENT` $\rightarrow$ Routes to `/student`.
  * New / Unassigned User $\rightarrow$ Automatically routed to `/waiting-approval`.

### 4.2 User Onboarding & Approval Queue (`frontend/src/pages/WaitingApproval.tsx`)
* **Visual Tone:** Reassuring, institutional awaiting-verification state.
* **Centerpiece Card:** Clean white card with an amber/blue hourglass status illustration.
* **User Identity Pill:** Displays authenticated email, name, and current status: `Status: Pending Administrator Review`.
* **Interactive Polling Action:** *"Check Approval Status"* button that queries the user's updated database role in real-time without requiring a page reload. Escalates immediately once approved.
* **Secure Session Teardown:** Clean sign-out action clearing Firebase and localStorage tokens.

---

## 5. Deep Analysis: Super Admin Portal (`/super-admin`)

### 5.1 Dashboard Layout
* **Header:** Global institutional governance bar displaying system health, total registered colleges, active student count, and authenticated Super Admin avatar (`amirthavarsshan0806@gmail.com`).
* **Institution Registry Table:**
  * Columns: `Logo`, `College Name`, `Unique Code`, `Domain`, `Assigned Admin`, `City / Country`, `Status`, `Actions`.
  * Status Badge: Green `Active` or Gray `Disabled`.
  * Actions: `Edit`, `Assign Admin`, `View Logs`, `Deactivate`.

### 5.2 Modal: College Provisioning Engine
* Multi-tab modal for registering new higher-education institutions:
  * Name: e.g. *Bharath Institute of Higher Education & Research (BIHER)*.
  * Code: e.g. *BIHER*.
  * Domain Whitelist: e.g. `@bharathuniv.ac.in`.
  * Physical Location: Address, City, State, Country.
  * Digital Branding: Official website URL and institutional logo URL with real-time live preview thumbnail.
  * Designated Administrator: Auto-complete picker searching registered users by email to bind the initial `COLLEGE_ADMIN`.

### 5.3 Institutional Audit Logs Modal (`CollegeLogsModal.tsx`)
* Terminal-style inspection modal streaming timestamped system events, account creation, role escalations, and security authorization logs with actor UIDs.

---

## 6. Deep Analysis: College Admin Portal (`/college-admin`)

### 6.1 Navigation & Shell Structure (`CollegeAdmin.tsx`)
* **Left Navigation Sidebar:** 260px fixed desktop sidebar with 15 granular administrative modules:
  * `Dashboard`
  * `RAG Vault` (Database icon)
  * `College` $\rightarrow$ `College Profile`, `Departments`, `Academic Structure`
  * `Users` $\rightarrow$ `HODs`, `Faculty`, `Students`
  * `Academics` $\rightarrow$ `Programs`, `Subjects`, `Batches`, `Classes`, `Academic Year`
  * `Timetable`
  * `Examinations`
  * `Attendance` $\rightarrow$ `College Overview`, `Department`, `Classes`
  * `Performance` $\rightarrow$ `Students`, `Departments`, `Reports`
  * `Announcements`
  * `Roles & Permissions`
  * `Import / Export`
  * `Settings` & `Sign Out`

### 6.2 Key Administrative Views
* **College Profile (`CollegeProfile.tsx`):** Zero-mock live institutional profile editor (Name, Code, Domain, Contact Phone, Official Email, Address, Logo URL with preview).
* **Department & Academic Structure (`CollegeDepartments.tsx`, `CollegePrograms.tsx`, `CollegeBatches.tsx`, `CollegeClasses.tsx`):**
  * Hierarchical cascading selectors: Select Department $\rightarrow$ Select Program $\rightarrow$ Select Batch $\rightarrow$ Manage Classes.
  * Class Incharge Assignment: Select an active faculty member from the department to serve as class incharge.
* **User Management (`ManageHods.tsx`, `ManageFaculty.tsx`, `ManageStudents.tsx`):**
  * Direct table views showing registered accounts, registration numbers, departments, approval statuses, and role assignment controls.
* **RAG Vault (`CollegeAdminRagVault.tsx`):** Administrative document ingestion hub where institutional handbooks, examination codes, and academic policies are uploaded, parsed into chunks, and embedded into Qdrant for RAG tool retrieval.

---

## 7. Deep Analysis: HOD Departmental Portal (`/hod/*`)

### 7.1 Shell & Sidebar (`HodLayout.tsx`)
* **Theme:** Deep sovereign slate sidebar (`#0D1C32`) with white/gold typography and active cyan telemetry highlights.
* **Header:** Displays HOD Name (e.g. *Dr. Alan Turing*), Department (e.g. *Computer Science & Engineering*), and active term *Fall 2026*.
* **14 Granular Routes:**
  * `Dashboard Overview` (`/hod`)
  * `AI Executive Assistant` (`/hod/chat`)
  * `Department Overview` (`/hod/department`)
  * `Faculty Management` (`/hod/faculty`)
  * `Academic Programs` (`/hod/programs`)
  * `Department Batches` (`/hod/batches`)
  * `Classes & Incharge` (`/hod/classes`)
  * `Students Directory` (`/hod/students`)
  * `Subjects & Syllabi` (`/hod/subjects`)
  * `Academic Calendar` (`/hod/calendar`)
  * `Attendance Surveillance` (`/hod/attendance`)
  * `Performance & Analytics` (`/hod/analytics`)
  * `Reports & Governance` (`/hod/reports`)
  * `Audit Dossiers` (`/hod/audit`)

### 7.2 HOD Key Operational Features
* **Departmental Governance Console:** Metric tiles showing active faculty count (e.g., *24 Active - 96% optimal load balance*), curriculum review requests, and overall department attendance.
* **Curriculum Proposal Workflow:** Interactive cards for approving syllabus revisions or requesting amendments, broadcasting instant synchronization events across faculty and student registries.
* **Faculty Workload Balancer:** Visual load bars showing teaching hours per faculty, with a 1-tap `Rebalance Load` action.
* **Attendance Surveillance (`AttendanceSurveillancePage.tsx`):** Real-time departmental attendance heatmaps identifying classes with abnormal absentee rates.
* **HOD AI Executive Assistant (`HodChatPage.tsx`):** Dedicated chat interface powered by 7 canonical departmental tools (aggregates attendance, retrieves faculty load, checks regulatory compliance).

---

## 8. Deep Analysis: Faculty Portal (`/faculty/*`)

### 8.1 Shell & Header (`FacultyLayout.tsx`)
* **Sidebar:** 260px clean daylight sidebar (`#FFFFFF` with `#E2E8F0` border), blue active indicators, collapsible on mobile.
* **Omnibar Search (`FacultySearchBar.tsx`):** Cmd+K instant modal searching across students, enrolled subjects, classrooms, and system links.
* **Top Header:** Faculty greeting (*Dr. Elena Rostova*), designation (*Professor of Distributed Systems*), assigned academic session, and quick AI Assistant toggle drawer button.

### 8.2 The 4-Tab Attendance Engine (`FacultyAttendancePage.tsx`)
The centerpiece of faculty daily workflow:
1. **Tab 1: Mark Attendance (`mark`):**
   * Filter controls: Class selector, Subject selector, Date picker, Period selector (`Period 1` to `Period 8`), and optional session topic/remarks.
   * Roster Table: Enrolled student list with photo avatar, register number, and 4-way segmented toggle:
     * `P` (Present - Green `#10B981`)
     * `A` (Absent - Red `#EF4444`)
     * `L` (Late - Amber `#F59E0B`)
     * `OD` (On Duty - Blue `#3B82F6`)
   * Quick Actions: *"Mark All Present"* button for instantaneous 100% check-off.
   * Lock & Save Session: Commits session with atomic PostgreSQL row-level locks, preventing duplicate entries for the same class+date+period.
2. **Tab 2: Shortage & Analytics (`stats`):**
   * Real-time calculation flagging students with $< 75\%$ attendance in red callout badges, showing exact classes needed to regain eligibility.
3. **Tab 3: Session History (`history`):**
   * Historical session log with timestamp, period, subject code, total students present, and faculty signature.
4. **Tab 4: Student Leaves Review (`leaves`):**
   * Review queue for student medical and academic leave requests with 1-click `Approve` / `Reject` and faculty remarks.

### 8.3 Classes & Student Rosters (`FacultyClassesPage.tsx`, `FacultyClassStudentsPage.tsx`)
* Visual cards for each assigned class showing current semester, student strength, and class representative badge.
* Student Directory with search, register number sorting, and individual student profile viewer (`FacultyStudentDetailsPage.tsx`).

### 8.4 Faculty AI Assistant (`FacultyChatPage.tsx`)
* Grounded instructional assistant equipped with **19 canonical tools** (timetable lookup, class roster queries, attendance shortage reports, institutional policy search).

---

## 9. Deep Analysis: Student Portal (`/student/*`)

### 9.1 Shell & Sidebar (`StudentLayout.tsx`)
* **Theme:** High-authority dark navy sidebar (`#0B1727`) with crisp white logotype and blue active state pills.
* **13 Dedicated Student Pages:**
  * `Dashboard` (`/student`)
  * `AI Assistant` (`/student/chat`)
  * `My Class` (`/student/class`)
  * `My Batch` (`/student/batch`)
  * `My Program` (`/student/program`)
  * `My Department` (`/student/department`)
  * `My Attendance` (`/student/attendance`)
  * `Time Table` (`/student/timetable`)
  * `My Subjects` (`/student/subjects`)
  * `Learning Content` (`/student/content`)
  * `Assignments` (`/student/assignments`)
  * `Class Incharge` (`/student/class-incharge`)
  * `Academic Calendar` (`/student/academic-calendar`)

### 9.2 Student Dashboard (`StudentDashboard.tsx`)
* High-density aggregate view displaying:
  * Student Profile Card (Name, Register Number, Department, Batch, Class Incharge).
  * Overall Attendance Circular Ring / Progress Bar.
  * Today's Class Schedule (Current period, subject code, instructor, lecture hall).
  * Enrolled Subjects Quick Grid with credit allocations.

### 9.3 Live Attendance Surveillance (`StudentAttendancePage.tsx`)
* **Overall Attendance Banner:**
  * Large percentage display (e.g. `84.6%`).
  * Status Badge: `ELIGIBLE` (Green) or `SHORTAGE ALERT` (Red).
  * **Safe Margin Metric:** Displays the exact number of classes the student can safely miss while remaining $\ge 75\%$, or the exact deficit classes needed to recover.
* **Subject-by-Subject Breakdown:**
  * Cards showing Subject Name, Code, Classes Held, Classes Attended, Percentage, and Status (`SAFE` / `CRITICAL`).
* **Weekly Period-by-Period Schedule:**
  * Monday to Friday daily timetable showing marked status for each period: `PRESENT`, `ABSENT`, `ON_DUTY`, or `SCHEDULED`.
* **Medical Leave Management:**
  * `Apply for Leave` modal allowing students to select reason (`HEALTH`, `ACADEMIC_EVENT`, `PERSONAL`), date range, and explanation. Live status tracking (`PENDING` $\rightarrow$ `APPROVED`).
* **Official Attendance Transcript:** 1-click verified PDF/transcript download button.

### 9.4 Assignment Submission & SHA-256 Receipt (`StudentAssignmentsPage.tsx`)
* Submissions portal allowing drag-and-drop file upload.
* Upon submission, generates an immutable receipt with a cryptographic SHA-256 hash (e.g. `sha256:0x7a3f8b...`) guaranteeing proof of timely turn-in.

### 9.5 Student AI Academic Assistant (`StudentChatPage.tsx`)
* Conversational academic terminal featuring:
  * Topic Presets: *Attendance & Safe Margin*, *Weekly Timetable*, *Assigned Class Incharge*, *Attendance Condonation Bylaws*, *CIA 40-Mark Evaluation Framework*.
  * Powered by **12 deterministic data tools** for live personal records and **2 grounded RAG tools** for official institutional regulations.

---

## 10. Motion Graphics Scene Architecture & Visual Translation

The HTML-based motion graphics demo (`motion-graphics/scene.html`) translates these exact UI/UX design specifications into a 45-second, 60 FPS, 1080p Full HD video:

| Shot | Time | Visual Focus | Exact UI Elements Recreated on Canvas |
| :--- | :--- | :--- | :--- |
| **Shot 1** | 0.0s – 5.5s | **Aura Academia Reveal** | Universal Header, `[ACADEMIC LMS]` badge, Headline *"Your College. One Intelligent Platform."*, interactive vector cursor clicking `[Explore LMS]` and `[Explore the Platform →]`. |
| **Shot 2** | 5.5s – 13.0s | **Tri-Tier Role Workspaces** | 3-tab segmented switcher (`HOD`, `Faculty`, `Student`). Cursor clicks `HOD` (Governance console), then `Faculty` (evaluation queue & attendance), then `Student` (course hub & GPA). |
| **Shot 3** | 13.0s – 19.5s | **Platform Capabilities Matrix** | 11-card grid. Cursor clicks category filter `AI Intelligence`, then clicks card `RAG-Based Knowledge Access` revealing modal spec. |
| **Shot 4** | 19.5s – 27.5s | **5-Stage Deterministic AI** | Stepper pipeline (`User Context` $\to$ `LMS Interface` $\to$ `AI Orchestrator` $\to$ `RAG & Tools` $\to$ `Verified Output`). Cursor clicks Stage 03 to launch the dark terminal JSON inspector with `[✓ Zero-Hallucination Guardrail]`. |
| **Shot 5** | 27.5s – 34.5s | **Enterprise Tech Stack** | 4-layer stacked architecture cards: Frontend (`React 19`), Backend (`Express 4`), Database (`Supabase PostgreSQL`), AI Layer (`RAG Pipeline`). |
| **Shot 6** | 34.5s – 40.5s | **Interactive Portal Sign-In** | Callout banner `Experience a Connected College LMS`. Cursor clicks `[Access LMS Portal →]`, types email into Welcome Back modal, clicks `[Sign In →]`, triggering green verification bloom. |
| **Shot 7** | 40.5s – 45.0s | **Institutional Climax & Hold** | Brand lockup **AURA ACADEMIA**, subtitle `SOVEREIGN ACADEMIC INFRASTRUCTURE`, master CTA with daylight shimmer sweep, and enterprise certification seals (`ISO 27001` • `FERPA Compliant` • `LTI 1.3 Certified`). |

---
*End of UI/UX & Page Design Deep Research Document.*

