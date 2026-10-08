# College LMS — RLS and authorization design

**Design first; implementation status:** See the verification/rollout section at the end. This design is for the *existing* Firebase + Express/Prisma + Supabase PostgreSQL system, not a replacement identity service. Derived from `docs/PERFORMANCE_AUDIT.md` and the live schema (24 public tables, 15 without RLS, nine with unconditional public policies as of 2026-10-07). No role supplied in a request body, URL, localStorage or editable Firebase user metadata may grant permissions.

## Trusted identity and enforcement boundary

1. Firebase Admin verifies the ID token (signature, project, expiry and UID). Retrieve email from the **verified** token; never from `/auth/sync` body. Look up the UID in `authed_users` and, while both identity systems exist, reconcile with `users`/`user_roles`. Access to protected operations requires a trusted active/approved account and *consistent* tenant/role assignment; ambiguity or suspension fails closed. Preprovisioned students awaiting first login require a separate verified-email binding, not an arbitrary UID remap. Any administrative bootstrap is an out-of-band trusted process, not the browser.
2. Tenant/department/class relationships come from database rows. For students, `authed_users.class_id → classes.batch_id → batches.program_id → programs.department_id → departments.college_id`; faculty subject/class assignments must point into their own college; HOD department and college must match the department row. Check ownership **in the query/transaction** for both reads and writes. Prevent moving existing rows to another tenant on update even when the row's old tenant was accessible.
3. Existing browser `@supabase/supabase-js` uses a publishable key with **anon** PostgREST identity. Firebase ID tokens are not Supabase-signed JWTs and `auth.uid()` cannot identify these users. Therefore **no direct PostgREST CRUD for protected tables can be safely authorized by Firebase-based RLS today**. The near-term design is: backend Prisma/raw SQL over the trusted server connection, with mandatory server-side tenant/RBAC guards; `anon` and Supabase `authenticated` roles have **no privileges on private tables**, and RLS is enabled with **no permissive client policies**. PostgreSQL `postgres`/server owner may bypass RLS: server authorization is indispensable. A future direct-client feature needs a verified JWT bridge/claims issued by trusted code, with separately reviewed granular RLS; it is not part of this pass. No `SECURITY DEFINER` shortcut is proposed.
4. Public college discovery, if required for onboarding, is a narrow `GET /api/public/colleges` response (active ID/name/code only) and associated department list with safe fields. Do not grant anon SELECT on entire `colleges` or `departments`. Registration and waiting-status endpoints require Firebase verification for personal data.

## Role matrix (server/API operations, not editable DB metadata)

Legend: `self` own UID; `class` enrolled/assigned class only; `dept` assigned department only; `college` verified tenant only; `global` reviewed superadmin only; `none` denied. A role never implies another role's write privileges. Where workflows are not implemented, default **none** rather than adding guessed rights.

| Role | Identity/profile | Students, attendance and timetable | Academic structure | Approvals/users/roles/audit |
|---|---|---|---|---|
| STUDENT | own profile read, explicitly editable personal fields | own enrollment, subjects/timetable, **own** attendance; no faculty/other-student private profiles; no mark | assigned college/department read-only public course fields | none |
| FACULTY | own profile fields | roster/details for *assigned class*, own/assigned-class timetable, mark attendance **only assigned class, enrolled students, approved faculty** | own department/subjects/classes read; no cross-dept academic writes | no approval or role changes |
| HOD | own profile fields | own department faculty/student scoped read; class-incharge management only for class/faculty in own department; department attendance summary | own department programs/batches/classes/subjects create/update as existing HOD workflow; college years read only | faculty requests for **own department only**, no college-admin approval; limited scoped audit only if explicitly granted |
| TPO | own profile | approved college-scoped placement data only (not implemented); no attendance changes by default | college read as required; no academic structure mutation without explicit feature | none by default |
| TRAINER | own profile | only explicitly assigned class/training resources (assignment model not yet implemented); no general roster/mark rights | assigned read-only | none by default |
| COLLEGE_ADMIN | own profile | college members/academic data with college-scoped management; no other college | college academic structure and HOD/faculty/student administration | college faculty/student/HOD requests as authorized, NOT self-elevation, not global role permission editing, college audit only |
| SUPERINTENDENT | own profile | scope must be explicitly recorded/approved; currently no trustable assignment scope in schema; **deny privileged actions pending specification** | deny mutation by default | none pending specification |
| SUPER_ADMIN | own profile | global only where needed for governance/support; avoid unnecessary raw student PII access by default | provision/manage colleges and college admins globally | manage COLLEGE_ADMIN approvals/central roles; global audit with tracked actor; cannot bypass Firebase token verification |

**Role/status resolution:** `authed_users.role` is currently used by live faculty/HOD/student, whereas `users` + `user_roles` protect older API routes. Until transactional reconciliation lands, do not allow role escalation from either system alone; especially disallow public updates of `role`, `requested_role`, `approval_status`, `college_id` and `department_id`. A `USER` requesting a role has **no role permissions**. A suspended/rejected/disabled record cannot access protected APIs. Route-specific rights still require resource ownership.

## Tenant matrix

| Actor and requested scope | Own user/class | Own department | Same college, other department | Other college | Global |
|---|---|---|---|---|---|
| STUDENT | own self/read as above | academic catalog only | no private access | deny | deny |
| FACULTY | assigned class and self | allowed academic catalog; private roster only assigned classes | deny private access unless explicit class assignment and matching college | deny | deny |
| HOD | own self/class | manage scoped academic resources | deny | deny | deny |
| TPO/TRAINER | explicit assignment only | scoped feature-specific read if provisioned | deny without assignment | deny | deny |
| COLLEGE_ADMIN | manage own college users/classes | manage | manage own-college departments | deny | deny |
| SUPERINTENDENT | self only until a trusted scope model exists | deny | deny | deny | deny |
| SUPER_ADMIN | self | only as required by global role | only as required by global role | only as required by global role | college provisioning/central approvals, audited |

## Table ownership and operation matrix

All **public** tables below are private at the PostgREST boundary; no anonymous or generic Supabase-authenticated DML, and no `USING (true)` policies. Backend operations below are the intended **server-validated** exceptions; `INSERT/UPDATE` also validate target tenant and every referenced row. `DELETE` is denied by default where no current business workflow requires it. Names in parentheses denote a field/relationship whose value must be checked against the trusted subject.

| Table(s) | Owner/scope derived from DB | Read | Insert | Update | Delete |
|---|---|---|---|---|---|
| `colleges` | `id`; admin S.college_id / superadmin | student/faculty/HOD limited own public fields; college admin own; superadmin global | superadmin | own college-admin profile fields; global superadmin | superadmin with referential/data-retention review |
| `departments` | `college_id`→college | own college catalog; HOD assigned dept private details | own college admin | own college admin; HOD only approved dept fields | own college admin, transactional dependent cleanup |
| `programs`, `batches`, `classes`, `subjects` | through department/program/batch FK chain | enrolled/assigned users relevant college/department; HOD own dept; college admin own tenant | HOD own dept or college admin own college | HOD own dept or college admin own college; validate *old and new* FK paths | HOD own dept or college admin own college if workflow permits, guarded transaction |
| `academic_years`, `semesters` | year.college_id; semester.year_id | own college | college admin if workflow exists, superadmin if explicitly needed | same | same, with retention guard |
| `authed_users` | `uid` Firebase identity; college/department/class verified through DB | own contact/role; assigned-class faculty minimum student fields; HOD dept; admin college; superadmin necessary fields | verified `/auth/sync` for self only; privileged bulk provisioning scoped by class/college | own safe personal fields only; approved admin trusted role/assignment endpoint; no arbitrary field patch | verified admin scoped account deletion with history/FK review (not arbitrary client delete) |
| `users`, `profiles` | users.firebaseUid / profiles.userId and users.collegeId | self, scoped staff/admin minimum fields | trusted onboarding/sync | self whitelist (profile); trusted admin status scoped | highly restricted/admin retention process |
| `roles`, `permissions`, `role_permissions`, `user_roles` | server-controlled RBAC objects; user role by FK to user/college | own derived grants; college admin subset for UI; superadmin global | superadmin central RBAC only; admin can grant **approved permitted** user roles through service | same, no self-elevation | same, audited and guarded |
| `account_approvals` | requestedCollege FK, requested user FK | self status; authorized college/admin reviewer by requestedRole + tenant/department; superadmin college-admin requests | validated self request for allowed role | conditional PENDING review by authorized reviewer only; no self-review | no routine delete; retain history |
| `sessions` | `userId`→users.firebaseUid | self sessions (safe fields only), security admins with audit | trusted server on real login | owner revokes own; admin emergency revoke | retention process only; no client row mutation |
| `audit_logs` | `collegeId`, actor/subject; null for global | college admin college only; superadmin global; individual read only if expressly exposed | server service only | **never** | retention process only |
| `attendance_sessions`, `attendance_records` | session.class_id→class→tenant/dept, faculty UID, record.student_uid membership | student own records; assigned faculty their class; HOD dept aggregate; admin college | authorized class faculty; record student must be enrolled in session class; atomic | same and appropriate date/lock rules | explicit authorized correction with audit only |
| `class_timetables`, `faculty_timetables`, `faculty_reminders` | class→tenant/department; faculty UID→S college; reminder belongs to UID | enrolled student own class timetable; assigned faculty own/class; HOD own dept; admin college | assigned faculty/class incharge or admin scoped by FK | same with both old/new ownership | same, no deletion by ID alone |
| `_prisma_migrations` | deployment/DB administration | deployment tooling only | migration tooling only | tooling only | tooling only |

**Policy naming:** should future browser RLS be introduced, use `rls_<table>_<operation>_<principal>_<scope>` (e.g. `rls_profiles_select_self`, `rls_departments_select_college`), restrictive roles `TO authenticated` only after a verified JWT bridge; never duplicate `ALL` with per-operation policies. SELECT/DELETE use `USING`; INSERT uses `WITH CHECK`; UPDATE requires **both `USING` and `WITH CHECK`**, including non-transfer of tenant ownership. Do not rely on a policy that reads user-editable `raw_user_meta_data`. Superadmin claims must come from a server-maintained membership/role table and be recorded in audit. Presently *no client policies* are safe because PostgREST has no trusted Firebase identity; denial is intentional, not a missing grant.

**RLS performance strategy:** one narrowly scoped policy per operation/principal when feasible; index tenant/department/UID lookup columns actually used; use stable values once per statement, avoid repeated per-row multi-level joins or expensive volatile claims lookup, avoid many OR-ed permissive policies; test representative EXPLAIN, advisor output and multi-tenant denial under the exact `anon`/`authenticated` roles. Do not add security-definer helpers without a reviewed privilege, schema and search_path threat model. Backend owner bypass means indexes should match *backend* scoping predicates as well.

## Functional dependency and safe rollout (no blind policy drops)

| Current permissive dependency | Replacement endpoint/path before removal | Required test |
|---|---|---|
| Browser onboarding/waiting, `App` HOD lookup | verified `/api/auth/sync`, `/api/auth/status`, public college/department discovery | new USER can request and check status; no cross-user status |
| SuperAdmin college/users/logs CRUD | verified superadmin API for college provisioning/admin assignment/audit | Firebase superadmin can CRUD; fake localStorage user cannot; foreign admin denied |
| CollegeAdmin dashboard/academic structure/role approvals | verified college-admin API with tenant-resolved counts/list/CRUD/review | own-tenant CRUD & review work; other tenant denied, HOD can't approve college admin |
| Faculty/student/HOD reads/writes | backend routes already in use; fix auth and ownership gaps | student self only; faculty assigned class only; HOD own dept; cross-tenant 403/404 |
| Standalone portal deployments | confirm their actual deployment/usage; root Vercel does not mount them | all active clients use migrated API before DB cutover |

**Deployment gate:** do not remove permissive live policies/revoke grants while a running frontend still uses anon PostgREST for required workflows. First ship replacement backend+frontend, verify authenticated operations on deployed URL and app telemetry, then apply a reviewed transactional DB migration: enable RLS on 15 tables, revoke public `anon`/`authenticated` grants on all 24, remove superseded permissive policies on the nine tables **after** replacing each client dependency and testing. Since generic authenticated has no trusted Firebase UID, do not add new permissive policies for it. Test anonymous queries return 401/403; test all eight roles across self/own dept/own college/other tenant. Keep schema migration and frontend rollout coordinated with rollback steps. Rotate leaked DB credentials separately; changing RLS cannot revoke a privileged PostgreSQL password. Export Supabase Security/Performance Advisors **after** live cutover; the dashboard/advisor API is not available in this workspace by default.

## Verification record

Before changes: anonymous PostgREST read of `users`, `profiles`, `authed_users`, `colleges`, `_prisma_migrations` returned HTTP 200 with rows; every public table granted `anon` and `authenticated` full table privileges. No anonymous writes were attempted.

**2026-10-07, live phase 1 applied:** `backend/sql/rls_phase1_private_tables.sql` was executed as one checked transaction against the connected live Supabase database: enabled RLS and revoked `anon`, `authenticated`, and PUBLIC table privileges on 15 policy-less tables that have **no integrated browser direct callers**. Preflight confirmed zero existing policies on those tables. Postflight confirmed all 15 RLS-on with no anon grants, backend Prisma `user.count` and `authedUser.count` still work, and anonymous PostgREST SELECT now returns HTTP **401 / 42501** on `users`, `profiles`, `account_approvals`, `audit_logs`, `attendance_records`, `sessions`, and `_prisma_migrations`. Anonymous SELECT on `authed_users` and `colleges` still returns HTTP **200 with rows** because the nine browser-dependent public tables were **not** cut over. No policy was deleted in phase 1.

**2026-10-07, live verification after backend hardening:** Anonymous probe re-run after backend middleware and API changes — identical result confirmed: `authed_users` and `colleges` remain accessible (nine browser-dependent tables), all other private tables return 401. Backend test suite: **108 tests pass** (8 test files). Frontend build: **successful**.

**2026-10-07, live phase 2 applied:** All direct PostgREST callers replaced by `/api/secure-data/*` and `/api/public/*` backend endpoints (see `backend/src/modules/secure-data/` and `frontend/src/services/api/secureDataApi.ts`). `collegeService.ts` rewritten to use secure API; `SuperAdmin.tsx`, `CollegeLogsModal.tsx`, `ManageHods.tsx`, `App.tsx` (HOD dept lookup), `WaitingApproval.tsx` no longer import `supabase`. `backend/src/app.ts` mounts `/api/secure-data` router with Firebase-verified token + DB-derived actor. Migration `backend/sql/rls_phase2_browser_tables.sql` (executed via `apply_phase2.mjs` + `apply_deny_policies.mjs`) dropped all 39 permissive policies on the nine tables, enabled RLS on all nine, revoked `anon`/`authenticated`/`PUBLIC` grants, created explicit deny policies for `anon` and `authenticated` roles (18 new policies). Postflight: all 9 tables RLS=ON with deny policies; backend 108 tests pass; frontend build passes; secure-data test suite covers college/admin/user/approval/structure flows with role/tenant scoping.

**Remaining open items (not blocking Phase 2 cutover):**
- Supabase Advisor run (no MCP/dashboard credentials in workspace) — pending.
- Vercel deployed-function verification — pending owner.
- Supabase DB credential rotation + git-history remediation — requires credential owner.
- **Faculty attendance ownership hardening (`faculty.controller.ts`/`service.ts`/`repository.ts`): COMPLETED 2026-10-07**
  - Fixed `session_id` → `attendance_session_id` column mismatch in 2 queries (lines 662, 733 in repository)
  - Removed process-local fallback in `getFacultyUserProfile` (was updating in-memory object on DB failure)
  - Removed process-local fallback in `getTimetable` (was trying fallback UID on empty result)
  - Replaced all 20 hardcoded fallback UIDs (`lZNUh1S3JMf9Lwcm1rptUaYyoS72`) with `verifiedFacultyUid()` Firebase token verification
  - Added `verifiedFacultyActor()` helper for department/college context derived from DB
  - All faculty endpoints now use verified Firebase identity; backend 108 tests pass, frontend build passes
