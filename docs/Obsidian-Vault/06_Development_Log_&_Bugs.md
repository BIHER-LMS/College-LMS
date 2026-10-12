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
  - **Test Suite Verification**: Verified that all 88 Faculty tests (`tests/faculty-rag-tools.test.ts`, `tests/faculty-backend-tools.test.ts`, `tests/faculty-ai-orchestrator.test.ts`) pass with 100% compliance.

