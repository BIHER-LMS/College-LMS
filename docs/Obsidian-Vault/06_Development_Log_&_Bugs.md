# Development Log & Bugs

## Recent Major Fixes
1. **Department Deletion Constraints (Error 23503):** Implemented manual cascading deletion for departments in `collegeService.ts` to clear related `authed_users`, `subjects`, `programs`, `batches`, and `classes` before department removal.
2. **Super Admin Assignment UI Bug:** Fixed an issue where assigned `COLLEGE_ADMIN` users continued to show the "Assign to College" dropdown. Implemented a dynamic UI to show a green badge ("Assigned to [College]") with an "Unassign" option. Also updated React state synchronously upon assignment so UI reflects changes immediately without refresh.
3. **Landing Page Overhaul:** First approach via automated HTML-to-React tool was buggy (overlap, colors, typography issues). Completely replaced with a purpose-built React + Tailwind setup (`landing page super/`).
4. **Database Vercel Error Fix:** Resolved a critical `Can't reach database server` error occurring in Vercel because Vercel doesn't support Supabase's IPv6-only direct connection. Set up IPv4 connection pooler in the `ap-northeast-1` region.
5. **Module Syntax Fixes:** Updated imports failing build due to `verbatimModuleSyntax` enforcing `import type { ... }` and `noUnusedLocals`.

## Currently in Progress
- **HOD Module:** Being worked on by other team members (do not modify).
- User needs to manually update the Vercel env variable (`DATABASE_URL`) to use the new IPv4 pooler URL to restore database access in the live environment.

## Upcoming Work
1. Department & Program Management
2. Batch & Section Creation
3. Faculty & Student Bulk Onboarding
4. Course / Curriculum Mgmt
5. Student Dashboard (`/student`)

### 3. Invisible "Edit Profile" Button & Zod Schema Crash
- **Symptoms**: The Edit option was completely missing visually from the College Profile page, and saving changes triggered a `400 Bad Request`.
- **UI Root Cause**: Missing `brand` color scale in the Tailwind environment caused `bg-brand-500` to fail, rendering white text on a white card background.
- **API Root Cause**: Strict Zod validation on `PATCH /api/college-admin/college/profile` rejected the payload because it contained unmapped fields (like `isActive`) and mismatched database fields (sending `addressLine1` when Prisma expected `address`).
- **Fix (Tailwind)**: Hard-swapped all `brand-500` utility classes to standard `blue-600` natively in the `.tsx` components (bypassing Vite config restart issues).
- **Fix (Data Flow)**: Reconfigured the `CollegeProfile.tsx` payload to construct an exact mapping for `updatableFields`, filtering out undefineds, and normalizing `addressLine1` to `address` to match the [[04_Database_Schema]].

### 4. Faculty Portal Full Production Integration
- **Context**: Kishore and team completed the standalone Faculty Portal in `faculty-portal-main`. Required seamless integration into the production repository (`backend/` and `frontend/`) and cross-module wiring without touching the HOD module (`/hod`).
- **Integration**:
  - Registered `/api/faculty/*` with controller, service, repository, and multi-account dev testing support.
  - Registered `facultyReducer` in centralized Redux Toolkit store (`store/index.ts`).
  - Mounted `FacultyLayout` and all 12 child routes under `/faculty/*` in `App.tsx`.
  - Wired live portal links in Landing page (`FacultyWorkspace.tsx`, `RoleShowcaseSection.tsx`), Sign In (`Login.tsx`, `WaitingApproval.tsx`), and College Admin (`ManageFaculty.tsx`).
  - See full documentation in [[07_Faculty_Portal_Integration]], [[08_Conversation_History_&_Decisions]], and [[09_Reasoning_&_Problem_Solving_Graph]].

### 5. Faculty Subject/Class Assignment & Authenticated Profile Editing
- **Context**: Upgrading College Admin Faculty management and removing prototype dev switchers in favor of authenticated user workflows.
- **Implementations**:
  - **Removed Preview Button**: Cleaned header of `ManageFaculty.tsx` by eliminating `"Open Faculty Portal Preview"`.
  - **Mandatory Subject Assignment**: Added subject assignment dropdown. If unassigned, renders a prominent `⚠️ Subject Assign Pending` warning indicator.
  - **1-to-1 Class Incharge Constraint**: Added optional class incharge assignment with automatic single-faculty enforcement per class.
  - **Removed Dev Switchers**: Completely removed top navbar and bottom sidebar `"Switch Faculty (Dev)"` buttons from `FacultyLayout.tsx`.
  - **Authenticated User Card**: Rendered real faculty user profile, department, and dynamic role (`Class Incharge & Subject Teacher` vs `Subject Teacher`) with sign-out and profile shortcuts.
  - **Self-Service Name & Photo Editing**: Implemented full editable inputs for faculty `displayName` and `profilePhoto` in `FacultyProfilePage.tsx` with live preview and multi-table synchronization (`User`, `Profile`, `AuthedUser`).

### 6. Super Admin College Logs & Pending Approvals Dashboard
- **Context**: The Super Admin needed visibility into application logs on a per-college basis, and the ability to manage requests for the `COLLEGE_ADMIN` role, while remaining restricted from approving lower-tier roles (HOD, Faculty).
- **Implementations**:
  - **Waiting Approvals Updates**: Added `COLLEGE_ADMIN` as an selectable role in `WaitingApproval.tsx`. Made Department selection optional if `COLLEGE_ADMIN` is selected.
  - **College Logs Modal**: Created a new UI component `CollegeLogsModal.tsx` in `frontend/src/components/SuperAdmin/` with two tabs: Activity Logs and Waiting Approvals.
  - **Activity Logs**: Queries the `authed_users` table to display a reverse-chronological "Recent Logins" feed per college. Queries the `classes` table (joined through `departments`) to display recent "Class Creations", and queries the `departments` table for "Recent Department Creations".
  - **Pending Approvals Logic**: Queries `authed_users` where `approval_status = 'PENDING'` for a specific college. 
    - If `requested_role === 'COLLEGE_ADMIN'`, the Super Admin is presented with `[Approve]` and `[Reject]` buttons.
    - If `requested_role` is HOD, Faculty, or Student, the buttons are hidden and replaced with a badge: `Requires College Admin Action`, enforcing strict authorization boundaries.
  - **Integration**: Placed a `View Logs` button on each College card in the `SuperAdmin.tsx` panel that passes the `CollegeRecord` state to open the Modal.

### 7. Professional "Create Department" Form Integration
- **Context**: The existing Department creation UI in the College Admin module was too basic. Required a professional UI with strict constraints: no database schema changes, authentication-based college assignment, and HOD assignment integration.
- **Backend Architecture**:
  - Defined a new Zod schema (`createDepartmentSchema`) in `collegeAdmin.schema.ts` validating `name`, `code`, `hod_uid`, and `is_active`.
  - Added a new service method `createDepartment` in `collegeAdmin.service.ts` checking for duplicate `name` and `code` per college, and verifying `hod_uid` existence/role.
  - Registered `POST /api/college-admin/departments` in `collegeAdmin.routes.ts`.
- **Frontend Architecture**:
  - Implemented `fetchEligibleHODs` in `collegeService.ts` via Supabase to fetch unassigned HODs.
  - Rewrote `createDepartment` in `collegeService.ts` to call the Node.js backend using the Firebase `Auth token` instead of a direct Supabase insert, enforcing backend validation constraints.
  - Rebuilt `CollegeDepartments.tsx` featuring a professional modal layout (Lucide icons, shadow UI), integrated real-time searchable department filtering, dynamic status badges, and optional dropdown HOD mapping.
  - **Bug Fix**: Fixed a `400 Bad Request` validation error during department creation. The root cause was twofold: the backend Zod schema had an incorrect `body: z.object()` nesting which failed the generic `validate` middleware, and the frontend payload included a `college_id` which was rejected by `.strict()`. Removed the incorrect nesting in `collegeAdmin.schema.ts` and stripped `college_id` on the frontend.

### 8. HOD Department Sync & Route Lockout Bug
- **Context**: When a College Admin assigned an existing HOD to a newly created department, the HOD still saw a "Department Not Assigned" screen on login.
- **Root Cause**: 
  1. `ManageHods.tsx` updated `authed_users.department_id` but failed to set `departments.hod_uid` in the database.
  2. The backend `createDepartment` endpoint updated `departments.hod_uid` but missed updating `authed_users.department_id`.
  3. Even when updated, `HodRoute` cached `lms_user` from `localStorage`, missing live updates if the user stayed logged in.
- **Fix**: 
  - Added a transactional database update in `createDepartment` (`backend/src/modules/college-admin/collegeAdmin.service.ts`) to sync both tables.
  - Rewrote `assignDepartment` in `ManageHods.tsx` to explicitly clear the previous department's `hod_uid`, assign the new department's `hod_uid`, and update `authed_users`.
  - Updated `HodRoute` (`App.tsx`) to directly query Supabase for the latest `department_id` and refresh `localStorage` automatically, unblocking the HOD without requiring a manual re-login.

### 9. Elimination of Fake/Hallucinated AI Data in Faculty AI Module
- **Context**: The Faculty AI chatbot was hallucinating dummy/fake student records (e.g., "Aarav Sharma", "Bhavna Patel", "Chetan Verma") when queried with "list my class students" for the active Faculty Class Incharge user ("Amirtha Varsshan", class "B.Sc AI & ML - Year III (Sec A)").
- **Root Cause**:
  1. In `facultyAi.service.ts`, `detectToolIntent` regex matched the generic word `"students"` from `"list my class students"`, passing `"students"` as `classId`.
  2. Because `"students"` was not a valid UUID, the database lookup failed.
  3. `facultyBackendToolService.ts` swallowed errors with `catch { // Fallback }` and returned hardcoded mock student records. Tools 1 through 17 had similar fallback arrays with fake people and fake classes.
  4. In `frontend/src/modules/faculty/api/facultyApi.ts`, `sendChatMessage` had a fallback that called `getFallbackFacultyChatResponse(payload)`, generating fake mock messages if the server returned 404 or 500.
- **Fix**:
  - **Dynamic Incharge Class Resolution**: Implemented `resolveClassId(classId, context)` in `facultyBackendToolService.ts` to dynamically resolve the faculty's assigned/incharge class from PostgreSQL when omitted or when generic keywords are passed.
  - **Sanitized Intent ID Extraction**: Replaced loose regexes with `extractExplicitClassId` and `extractExplicitStudentId` in `facultyAi.service.ts` so words like `"students"` or `"details"` are never captured as IDs.
  - **Zero Fake Data Policy**: Removed all 17 dummy fallback mock arrays (Aarav Sharma, Alan Turing, CS501, etc.) from `facultyBackendToolService.ts`. Queries now hit PostgreSQL directly via `facultyService`, `facultyRepo`, or Prisma. If no records exist, factual empty states (e.g., "No enrolled students found in this class in the database") are returned.
  - **Removed Frontend Fallback**: Deleted `getFallbackFacultyChatResponse` and ensured `sendChatMessage` propagates real backend errors directly without fabrication.
### 10. Real Database Output & Roster Resolution for HOD Executive AI Assistant
- **Context**: When an HOD user ("Amirtha Varsshan", Department: "Department of Computer Science (CS)", Class: "B.sc AI & ML - Year III (Sec A)") asked `"list the student and the particluar class labled"` in `/hod/chat`, the assistant failed to call any tools and responded with a canned fallback greeting displaying a raw department UUID:
  `"Hello Amirtha Varsshan. I am your departmental AI Assistant for Department 78acc8ed-1bf0-43e1-be5f-815ca46a0835. I can help you review attendance summaries..."`
- **Root Cause**:
  1. **Intent Matching Gap**: `detectToolIntent` in `hodAi.service.ts` required keywords like `"attendance"`, `"percentage"`, or `"at risk"`. Prompts asking for student or class rosters (`"list the student and the particluar class labled"`, `"class roster"`, `"students enrolled"`) failed intent matching and triggered zero tools.
  2. **Stopword Capture as Class ID**: The class extraction regex in `detectToolIntent` captured arbitrary words following `"class"` (e.g., `"class labled"` -> `classId: "labled"`), which caused invalid UUID queries or `NotFoundError` when passed to PostgreSQL.
  3. **Missing Enrolled Student Roster**: `getClassAttendance` in `hodAnalyticsToolService.ts` only computed and returned `atRiskStudents` (< 75% attendance), completely omitting the full enrolled student list. In addition, `getDepartmentAttendance` only selected `uid` without `display_name` and `register_number`.
  4. **Raw UUID in Canned Greeting**: When tools were not triggered, the response synthesis displayed the raw UUID `Department 78acc8ed-1bf0-43e1-be5f-815ca46a0835` instead of resolving the human-readable department name.
- **Fix**:
  - **Enriched Types & Schemas**: Added optional `students?: AtRiskStudentItem[]` to `HodClassAttendanceOutput` and `ClassAttendanceSummaryItem` across `hodAi.types.ts` and `hodAi.validation.ts`.
  - **Dynamic Class & Student Resolution**: In `hodAnalyticsToolService.ts`, when `classId` is omitted or empty, `getClassAttendance` dynamically resolves the active class in the HOD's department (`B.sc AI & ML - Year III (Sec A)`). When a specific `classId` is provided but not found, it cleanly throws `NotFoundError: Class not found: <classId>`.
  - **Full Enrolled Student Roster from PostgreSQL**: Both `getClassAttendance` and `getDepartmentAttendance` now populate the full enrolled student list with real database fields (`display_name`, `register_number`, and calculated attendance percentage) for students like `Amirtha Varsshan` (`8967BSCAIML`).
  - **Stopword-Resistant Intent Extraction**: Refined `detectToolIntent` in `hodAi.service.ts` to identify student and class roster intents (`student` + `class`/`particluar`/`labled`/`roster`), routing cleanly to `hod.getClassAttendance` or `hod.getDepartmentAttendance` without capturing English words as IDs.
  - **Human-Readable Department Resolution**: Updated `authMiddleware.ts` to populate `departmentName` on `req.hodContext` and added database fallback in `hodAi.service.ts` to always display `Department of Computer Science (CS)` instead of raw UUIDs.
  - **Comprehensive Verification**: All 85 HOD tests and 63 Faculty tests (148 tests in total) pass with 100% success rate, with zero TypeScript compilation errors (`tsc --noEmit`) in both backend and frontend.

### 11. Firebase Account Registration with Email, Phone Number, and Direct Applying Page Onboarding
- **Context**: The academic login portal (`/login`) previously only supported signing in with pre-existing credentials or Google Sign-In, lacking self-service registration for new applicants using email, phone number, and password, as well as automatic routing to the applying page (`/waiting-approval`).
- **Backend Architecture**:
  - **Registration Validation Schema**: Defined `registerSchema` in `backend/src/schemas/auth.schema.ts` validating `email`, `password` (min 8 chars), `phone` (min 10 digits), and `displayName`.
  - **Firebase Registration with Resilient Fallback**: Implemented `POST /api/auth/register` in `backend/src/modules/auth/auth.routes.ts`:
    - Normalizes phone numbers to E.164 (`+91...` / `+...`) and creates user via `firebaseAuth.createUser`.
    - Resolved `invalid_grant (Invalid grant: account not found)` runtime crash by implementing an automatic fallback to the Firebase Identity Toolkit REST API (`accounts:signUp` and `accounts:update` using Web API Key) when Admin SDK service account certificates are missing or revoked.
    - Upserts shadow records in PostgreSQL `authed_users` (role `'USER'`, `approval_status = 'PENDING'`, `phone = formattedPhone`).
  - **Auth Route Bypass in Middleware**: Updated `auth.middleware.ts` to allow pending applicant accounts through `/api/auth/*` endpoints (`/sync`, `/onboarding`, `/me`) so the frontend can retrieve their `approval_status` and route them to `/waiting-approval` without getting blocked by operational route checks (`403 ACCOUNT_PENDING`).
- **Frontend Architecture**:
  - **Registration Service**: Added `registerAccount` in `frontend/src/services/collegeService.ts` to call `POST /api/auth/register`.
  - **Applying Page Role Option**: Added `<option value="STUDENT">Student</option>` in `frontend/src/pages/WaitingApproval.tsx` allowing student applicants to choose their role alongside Faculty and HOD.
  - **Login / Register Page Redesign**: Upgraded `frontend/src/pages/Login.tsx`:
    - Added segmented control tabs (`[Sign In]` / `[Create Account]`) with smooth transitions.
    - Added input fields for Full Name, Institutional/Personal Email, Phone Number (with country code guidance), and Password.
    - Integrated direct onboarding flow: upon submission, registers account, signs in with `signInWithEmailAndPassword`, calls `finishSignIn`, and immediately redirects to `/waiting-approval` (the applying page) where the user completes their profile by choosing College, Role, and Department.
- **Verification**:
  - Automated test suite `backend/tests/auth-register.test.ts` (6/6 tests passing, including `invalid_grant` fallback).
  - All 27 auth tests, 85 HOD tests, and 63 Faculty tests pass with zero errors.
  - Verified live registration, login, and sync flow against running dev server with 200 OK responses.
  - Production build in `frontend` completed cleanly with Vite (`tsc -b && vite build` exited 0).

### 12. Super Admin User Visibility & Applying Page Onboarding Roles Fix
- **Context**: Newly registered accounts (created via email/password) were created in Firebase and stored in PostgreSQL `authed_users`, but did not appear in the Super Admin dashboard under the user accounts list. In addition, the applying page allowed selecting "Student" when students should be managed via academic enrollment rather than onboarding self-application.
- **Root Cause Analysis**:
  1. **Super Admin 403 Forbidden Error on `GET /api/secure-data/users`**:
     - In `backend/src/modules/secure-data/secureData.service.ts` line 132:
       `if (a.role === 'SUPER_ADMIN' && role !== 'COLLEGE_ADMIN') throw deny();`
     - When Super Admin loaded the dashboard, `fetchAuthedUsers()` in `frontend/src/services/collegeService.ts` called `secureDataApi.listUsers({})` without specifying a `role` filter (`role = undefined`).
     - The check evaluated `role !== 'COLLEGE_ADMIN'` as `true`, throwing `403 FORBIDDEN: Not authorized`.
     - `fetchAuthedUsers()` caught the 403 error and silently fell back to `getLocalAuthedUsers()`, which only contained 3 legacy cached accounts stored in browser `localStorage`.
  2. **401 Unauthorized on `GET /api/secure-data/me` for Unverified Email Registrants**:
     - Newly created Firebase email/password accounts default to `email_verified: false`.
     - The `verify` middleware in `secureData.routes.ts` enforced `(!decoded.email_verified && !isRagav)`, blocking registered applicants from reading their approval status on `/waiting-approval`.
- **Fix**:
  - **Applying Page Role Dropdown**: Removed "Student" option from `frontend/src/pages/WaitingApproval.tsx`, leaving Faculty and HOD as the selectable onboarding applicant roles.
  - **Super Admin User Listing**: In `secureData.service.ts`, updated line 132 to `if (a.role === 'SUPER_ADMIN' && role && role !== 'COLLEGE_ADMIN') throw deny();`. When Super Admin requests all users (`role` is undefined), the query succeeds and returns all `authed_users` from PostgreSQL.
  - **Enriched User Metadata**: Added `provider: true`, `last_login: true`, `photo_url: true`, and `phone: true` to `userSelect` in `secureData.service.ts` and mapped them in `collegeService.ts` (`fetchAuthedUsers` and `getAuthedUserProfile`).
  - **Registration-Aware Verification**: In `secureData.routes.ts`, imported `prisma` and allowed registered users existing in `authed_users` to query `/api/secure-data/me` regardless of initial email verification flag.
  - **Super Admin UI Modernization**: In `frontend/src/pages/SuperAdmin.tsx`:
    - Renamed section to **Authenticated Users** and updated subheadings/descriptions.
    - Updated provider badges with distinct styles for `google.com` (emerald) and `password` (indigo).
    - Improved quick assign modals to support all authenticated accounts.
- **Verification**:
  - Frontend compiled cleanly with Vite (`tsc -b && vite build` exited 0).
  - All 39 auth & secure-data tests passed (`vitest run tests/secure-data.test.ts tests/auth-register.test.ts tests/auth-sync.test.ts`).
  - Verified in PostgreSQL that manual user `varsshan2009@gmail.com` with `provider: "password"` and `approval_status: "PENDING"` is present and returned by the Super Admin endpoint.

### 13. College Admin Assignment and Unassignment Synchronization
- **Context**: In the Super Admin console, clicking "Unassign" on an assigned College Admin did not demote the user or remove them as College Admin in the database.
- **Root Cause**:
  1. The frontend was calling `updateUserProfile(u.uid, { role: 'USER', college_id: null })`, which mapped to `secureDataApi.assignUser`.
  2. `assignUser` only permits `COLLEGE_ADMIN` actors (Super Admin was rejected with `403 FORBIDDEN`), and only modified academic enrollment fields (`department_id`, `class_id`, `subject_id`, `register_number`), ignoring `role` and `college_id`.
  3. Updating the college record via `updateCollege` only modified `colleges` without touching `authed_users` or legacy `user`/`userRole` tables.
- **Fix**:
  - **Backend API Endpoints**:
    - Implemented `POST /api/secure-data/colleges/:id/assign-admin` and `POST /api/secure-data/colleges/:id/unassign-admin` in `secureData.routes.ts`.
    - Added `assignCollegeAdmin` and `unassignCollegeAdmin` to `secureData.service.ts`:
      - Atomically updates target user(s) in `authed_users` (role `USER`, `college_id: null`, `approval_status: 'PENDING'`).
      - Atomically syncs legacy `user` and `userRole` tables to avoid authorization discrepancies.
      - Clears or sets `adminUid`, `adminEmail`, and `adminName` on the `colleges` record.
    - Updated `patchCollege` to also automatically unassign admins if `adminEmail` or `adminUid` is cleared (`null`).
  - **Frontend UI & Service**:
    - Added `assignCollegeAdmin` and `unassignCollegeAdmin` to `secureDataApi.ts` and `collegeService.ts`.
    - Added `handleUnassignAdmin` in `SuperAdmin.tsx`.
    - Added an "Unassign" button to both the college institution cards and the Authenticated Users table rows.
- **Verification**:
  - Automated tests added to `backend/tests/secure-data.test.ts` (13/13 passing).
  - Frontend production build (`tsc -b && vite build`) passed with zero errors.
