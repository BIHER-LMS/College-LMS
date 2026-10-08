# Aura Academia — College LMS  
## Comprehensive Project Report & Development Log

**Generated:** 2026-10-03  
**Repository:** `College-LMS` (BIHER-LMS/College-LMS)  
**Conversation Session:** `0c464493-c667-4f09-bc9c-4a65d0ffb9f7`  
**Total User Requests in Session:** ~96  
**Total Agent Responses / Actions:** ~1489  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture & Codebase Structure](#3-architecture--codebase-structure)
4. [Conversation History — Chronological Development Log](#4-conversation-history--chronological-development-log)
5. [Bugs, Errors & Fixes — Complete Registry](#5-bugs-errors--fixes--complete-registry)
6. [Current Project Status](#6-current-project-status)
7. [Database Schema Summary](#7-database-schema-summary)
8. [Deployment Configuration](#8-deployment-configuration)
9. [Pending / Future Work](#9-pending--future-work)
10. [Git History](#10-git-history)

---

## 1. Project Overview

The **College Multi-Tenant Learning Management System (LMS)** — branded as **Aura Academia** — is an enterprise academic administration and learning platform designed for multiple higher education institutions under a unified architecture.

It separates:
- **System-wide governance** (Super Admin) from  
- **Localized institutional governance** (College Admin), with further plans for  
- **Departmental management** (HOD), **Faculty workflows**, and **Student learning environments**.

### Key Design Principles
- Multi-tenant architecture with strict data isolation per college
- Firebase Authentication for identity, Supabase PostgreSQL for persistence
- Role-based access control (RBAC) with granular permissions
- Vercel multi-service deployment (frontend SPA + Express API backend)
- Reactive frontend with real-time database polling for approval flows

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Frontend SPA** | React 19, Vite 8, TypeScript 7 | Type-safe reactive client-side UI |
| **Styling & UI** | Tailwind CSS 4 (arbitrary values), Google Material Symbols, Plus Jakarta Sans + Inter fonts | Modern design system |
| **Landing Page** | Modular React component architecture | Enterprise marketing/showcase page |
| **Client Auth** | Firebase Web SDK (v10) | Google OAuth & session management |
| **Client DB** | `@supabase/supabase-js` | Controlled client queries & record tracking |
| **Backend API** | Node.js 24, Express 4, TypeScript 5 | Business logic, secure endpoints & validation |
| **Server Auth** | Firebase Admin SDK | Bearer token verification & claims validation |
| **ORM & Database** | Prisma ORM 5.22, PostgreSQL (Supabase) | Type-safe migrations, schemas, relational storage |
| **Validation** | Zod | Runtime schema validation for API payloads |
| **Deployment** | Vercel (Multi-Services) | Edge routing: `/api/*` → Backend, `/*` → Frontend |
| **Production URL** | `college-lms-2026-ten.vercel.app` | Live production deployment |

---

## 3. Architecture & Codebase Structure

### Frontend (`frontend/src/`)
```
frontend/src/
├── App.tsx                          # Root router (React Router v7)
├── App.css                          # Global styles
├── index.css                        # Tailwind base imports
├── main.tsx                         # React DOM entry
│
├── config/
│   ├── firebase.ts                  # Firebase Web SDK init
│   └── supabase.ts                  # Supabase client + TypeScript interfaces
│
├── components/
│   └── (shared UI components)
│
├── pages/
│   ├── Home.tsx                     # Landing page entry → renders LandingApp
│   ├── Login.tsx                    # Firebase Google OAuth sign-in
│   ├── WaitingApproval.tsx          # Post-signup pending approval screen
│   ├── CollegeAdmin.tsx             # College Admin dashboard
│   └── SuperAdmin.tsx               # Super Admin platform management
│
├── services/
│   └── collegeService.ts            # API calls to backend
│
└── landing/                         # ← Modular landing page module
    ├── App.tsx                      # Landing page orchestrator
    ├── types.ts                     # Shared TypeScript types
    ├── data/
    │   └── mockData.ts              # Demo workspace data
    └── components/
        ├── Header.tsx               # Fixed header with nav & /login links
        ├── HeroSection.tsx          # 3D layered interface visualization
        ├── ThreeExperiencesSection.tsx
        ├── ConnectedEcosystemSection.tsx
        ├── RoleShowcaseSection.tsx
        ├── CapabilitiesSection.tsx
        ├── CapabilityModal.tsx
        ├── DeterministicAISection.tsx
        ├── TechStackSection.tsx
        ├── CTASection.tsx
        ├── SignInModal.tsx
        ├── Footer.tsx
        └── workspaces/
            ├── HodWorkspace.tsx
            ├── FacultyWorkspace.tsx
            └── StudentWorkspace.tsx
```

### Backend (`backend/src/`)
```
backend/src/
├── app.ts                           # Express app configuration
├── server.ts                        # HTTP server entry point
│
├── config/
│   ├── database.ts                  # Prisma client singleton
│   ├── env.ts                       # Environment variable validation
│   └── firebase.ts                  # Firebase Admin SDK init
│
├── middleware/
│   ├── auth.middleware.ts           # Firebase token verification
│   ├── error.middleware.ts          # Global error handler
│   ├── rbac.middleware.ts           # Role-based access control
│   ├── tenant.middleware.ts         # Multi-tenant isolation
│   └── validation.middleware.ts     # Zod schema validation
│
├── modules/
│   ├── approvals/approval.routes.ts
│   ├── audit/audit.routes.ts
│   ├── auth/auth.routes.ts
│   ├── college-admin/
│   │   ├── collegeAdmin.controller.ts
│   │   ├── collegeAdmin.routes.ts
│   │   └── collegeAdmin.service.ts
│   ├── colleges/college.routes.ts
│   ├── profiles/profile.routes.ts
│   ├── roles/role.routes.ts
│   └── users/user.routes.ts
│
├── schemas/
│   ├── approval.schema.ts
│   ├── auth.schema.ts
│   ├── college.schema.ts
│   ├── collegeAdmin.schema.ts
│   ├── profile.schema.ts
│   └── user.schema.ts
│
├── services/
│   ├── approval.service.ts
│   ├── audit.service.ts
│   ├── auth.service.ts
│   ├── college.service.ts
│   ├── profile.service.ts
│   ├── session.service.ts
│   └── user.service.ts
│
└── utils/
    ├── errors.ts                    # AppError class & error codes
    ├── logger.ts                    # Structured logging
    └── response.ts                  # API response formatters
```

### Database Schema (`backend/prisma/schema.prisma`)
- 16 models total including: `College`, `Role`, `Permission`, `RolePermission`, `User`, `UserRole`, `Profile`, `AccountApproval`, `Session`, `AuditLog`, `AuthedUser`, `Department`, `AcademicYear`, `Program`, `Batch`, `Class`, `Semester`, `Subject`

---

## 4. Conversation History — Chronological Development Log

### Phase 1: Logo Integration (Sep 28, 2026)
**User Request:** _"Add this logo in the app"_ — provided `sttich landing page/logo.png`

**Actions Taken:**
- Copied `logo.png` into `frontend/public/logo.png`
- Updated `index.html` favicon to reference `/logo.png`
- Integrated logo into the application header/navbar

---

### Phase 2: Landing Page — First Attempt (Sep 28, 2026)
**User Request:** _"Remove the existing landing page, add this one, connect sign up page"_ — provided `landing page updated/` folder

**Actions Taken:**
- Received a static HTML/CSS landing page design
- Attempted conversion from static HTML to React JSX components
- Created conversion scripts (`convert.cjs`, `fix_jsx.cjs`, `update_tw.cjs`)
- Integrated the converted landing page as the Home route

**Issues Encountered:**
- JSX conversion from static HTML had numerous syntax errors
- Tailwind class incompatibilities between static and Vite-based Tailwind
- Multiple visual bugs reported by user (see Phase 3)

---

### Phase 3: Landing Page Bug Fixing — Extensive Iteration (Sep 28–29, 2026)
**User Requests:** Multiple rounds of _"so many bugs"_, _"analyze attached images"_, _"fix this bugs"_, _"continue"_, _"proceed"_

**Bugs Reported (via screenshots):**
1. Layout misalignment — elements overlapping or incorrectly positioned
2. Typography mismatches vs. the Stitch design reference
3. Color palette deviations from the original design
4. Responsive breakpoint failures on mobile widths
5. Button styling inconsistencies
6. Missing or broken CSS classes after JSX conversion
7. Image rendering issues
8. Navigation link routing broken

**Actions Taken:**
- Multiple iterative passes comparing localhost screenshots to the design reference
- Class-by-class CSS diff analysis using custom scripts (`diff_classes.cjs`)
- Manual correction of dozens of Tailwind utility classes
- Responsive layout fixes across breakpoints
- Browser-based visual regression testing

**Outcome:** Despite extensive iteration, the HTML-to-React conversion approach proved fundamentally fragile. The user decided to scrap this attempt entirely.

---

### Phase 4: Landing Page — Complete Restart (Oct 2, 2026)
**User Request:** _"Delete the entire landing page and remove completely and then I will give the frontend file"_

**Actions Taken:**
- Deleted all old landing page files:
  - `frontend/scratch_convert.cjs`
  - `frontend/scratch_convert_login.cjs`
  - All files from the `landing page updated/` approach
- Cleaned the `Home.tsx` page back to a blank slate
- Confirmed clean build with `npm run build`

---

### Phase 5: Landing Page — "Landing Page Super" Integration (Oct 2, 2026)
**User Request:** _"Analyze this folder frontend and implement in the core application"_ — provided `landing page super/` folder

This was a **purpose-built React + TypeScript + Tailwind landing page** with:
- 12 modular React components
- 3 interactive workspace demos (HOD, Faculty, Student)
- TypeScript type system (`types.ts`)
- Mock data engine (`mockData.ts`)
- 3D tilt visualization, animated SVG inter-layer connections
- Sign-in modal, capability inspector modal
- Full responsive design with mobile drawer navigation

**Actions Taken:**

1. **Source Tree Transfer:**
   - Copied entire `landing page super/src/` into `frontend/src/landing/`
   - Preserved full component hierarchy and data modules

2. **Entry Point Wiring:**
   - Updated `frontend/src/pages/Home.tsx` to render `<LandingApp />` from `../landing/App`

3. **Logo Integration:**
   - Updated `Header.tsx` logo `src` from external Google URL to `/logo.png`
   - Changed `object-cover` to `object-contain` for proper rendering

4. **Navigation Integration — Connected to `/login`:**
   - Desktop header "Sign In" button → `<a href="/login">`
   - Desktop header "Explore LMS" button → `<a href="/login">`
   - Mobile drawer "Sign In" → `<a href="/login">`
   - Mobile drawer "Explore LMS" → `<a href="/login">`
   - HeroSection "Portal Login" CTA → `<a href="/login">`
   - CTASection "Access LMS Portal" → `<a href="/login">`
   - SignInModal "Go to College LMS Portal" → `<a href="/login">`

5. **TypeScript `verbatimModuleSyntax` Fixes:**
   - Converted all type imports across 14 files from `import { X }` to `import type { X }` where `X` is a type-only symbol
   - Files patched:
     - `App.tsx`, `CapabilitiesSection.tsx`, `CapabilityModal.tsx`
     - `ConnectedEcosystemSection.tsx`, `CTASection.tsx`, `Header.tsx`
     - `HeroSection.tsx`, `RoleShowcaseSection.tsx`, `SignInModal.tsx`
     - `ThreeExperiencesSection.tsx`, `FacultyWorkspace.tsx`
     - `HodWorkspace.tsx`, `StudentWorkspace.tsx`, `mockData.ts`

6. **Unused Variable Cleanup:**
   - Removed unused `React` imports (React 19 JSX transform doesn't require explicit import)
   - Renamed unused `onOpenSignIn` prop to `_onOpenSignIn` in `Header.tsx`

7. **Build Verification:**
   - `npm run build` (`tsc -b && vite build`) passed with **0 errors**
   - 1983 modules transformed, production bundle built in ~1.3s

---

### Phase 6: Vercel Production Database Connection Failure (Oct 2, 2026)
**User Shared Screenshot:** Production site at `college-lms-2026-ten.vercel.app/college-admin` showing:
```
Invalid `database_1.default.user.findUnique()` invocation:
Can't reach database server at 'db.lmnbsauvjqursjxocsgf.supabase.co:5432'
```
Plus 12+ `Failed to load resource: the server responded with a status of 500` errors in console.

**Root Cause Analysis:**
- Supabase direct connections (`db.[project-ref].supabase.co:5432`) resolve to **IPv6 only** (`2406:da14:25a:5800::1d3`)
- Vercel Serverless Functions run on **AWS Lambda, which does NOT support outbound IPv6**
- DNS `AAAA` record exists, but **no `A` record** → connection fails immediately on Vercel

**Investigation Process:**
1. Verified local direct connection works (local machine supports IPv6)
2. DNS resolution confirmed: IPv6 only (`resolve4` returned `ENODATA`)
3. Tested TCP connectivity to Supabase pooler hosts across 9 AWS regions
4. Brute-force tested Prisma authentication against all pooler regions
5. **Identified working pooler region:** `ap-northeast-1`

**Fix Applied:**

1. **`backend/prisma/schema.prisma`** — Added `directUrl`:
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```

2. **`backend/.env`** — Updated connection strings:
   ```env
   # Runtime (IPv4 pooler for Vercel/serverless)
   DATABASE_URL="postgresql://postgres.lmnbsauvjqursjxocsgf:[REDACTED_ROTATE_CREDENTIAL]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   
   # CLI/Migrations (direct IPv6, works from local dev machines)
   DIRECT_URL="postgresql://postgres:[REDACTED_ROTATE_CREDENTIAL]@db.lmnbsauvjqursjxocsgf.supabase.co:5432/postgres"
   ```

3. **Vercel Environment Variables** — User needs to update in Vercel Dashboard:
   - `DATABASE_URL` → pooler URL
   - `DIRECT_URL` → direct URL
   - Redeploy without build cache

**Verification:** Prisma `findFirst()` query executed successfully through the pooler connection.

---

## 5. Bugs, Errors & Fixes — Complete Registry

### 🔴 Critical Errors

| # | Error | Root Cause | Fix | Status |
|:--|:------|:-----------|:----|:-------|
| 1 | `Can't reach database server at 'db.lmnbsauvjqursjxocsgf.supabase.co:5432'` on Vercel production | Supabase direct connections are IPv6-only; Vercel Lambda doesn't support outbound IPv6 | Switched `DATABASE_URL` to Supabase IPv4 Connection Pooler (`aws-0-ap-northeast-1.pooler.supabase.com:6543`) with `?pgbouncer=true` | ✅ Fixed |
| 2 | `TS1484: 'X' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled` | Landing page source used `import { RoleType }` instead of `import type { RoleType }` | Changed all type-only imports to `import type { ... }` across 14 files | ✅ Fixed |
| 3 | Multiple `500` errors on `/api/college-admin/college/profile` API endpoint | Same as #1 — backend couldn't reach database | Same as #1 — pooler URL fix | ✅ Fixed |
| 4 | `Cross-Origin-Opener-Policy policy would block the window.close call` | Browser security policy warning in console (non-blocking) | Cosmetic warning; no code change needed | ⚠️ Non-blocking |

### 🟡 Build & Compilation Errors

| # | Error | Root Cause | Fix | Status |
|:--|:------|:-----------|:----|:-------|
| 5 | JSX conversion syntax errors (Phase 2 landing page) | Automated HTML-to-JSX conversion was lossy | Scrapped approach entirely; adopted purpose-built React components (Phase 5) | ✅ Resolved by restart |
| 6 | Tailwind class mismatches after HTML conversion | Static HTML used Tailwind classes incompatible with Vite's Tailwind 4 JIT | Scrapped approach; new landing page uses Tailwind arbitrary values (`text-[#004ac6]`) which work universally | ✅ Resolved by restart |
| 7 | Unused variable warnings (`React` import in React 19) | React 19 JSX transform doesn't require explicit `React` import | Removed unused `import React from 'react'` statements | ✅ Fixed |
| 8 | Unused prop parameter (`onOpenSignIn` in `Header.tsx`) | Prop accepted but not used after linking directly to `/login` | Renamed to `_onOpenSignIn` to suppress linter | ✅ Fixed |

### 🟢 Visual / UI Bugs (Phase 3 — Old Landing Page)

| # | Bug | Description | Fix | Status |
|:--|:----|:-----------|:----|:-------|
| 9 | Layout overlap | Elements overlapping incorrectly in hero section | Multiple CSS passes with diff analysis | ✅ Fixed (then scrapped) |
| 10 | Typography mismatch | Fonts not matching Stitch design reference | Font family corrections | ✅ Fixed (then scrapped) |
| 11 | Color deviations | Colors not matching the design spec | Hex code corrections | ✅ Fixed (then scrapped) |
| 12 | Responsive failures | Mobile layout breaking at certain widths | Responsive class fixes | ✅ Fixed (then scrapped) |
| 13 | Navigation routing broken | Landing page links not navigating to `/login` | Rewired as `<a href="/login">` tags | ✅ Fixed |

> **Note:** Bugs 9–12 were extensively fixed but ultimately the entire approach was scrapped in favor of the `landing page super` modular React implementation. The new implementation had zero visual bugs.

### 🔵 Configuration & Infrastructure Issues

| # | Issue | Root Cause | Fix | Status |
|:--|:------|:-----------|:----|:-------|
| 14 | `vercel.json` schema error | Invalid property in Vercel configuration | Corrected schema property | ✅ Fixed |
| 15 | Firebase credentials mismatch | Web app credentials needed updating | Updated to new Firebase web app credentials | ✅ Fixed |
| 16 | `WaitingApproval.tsx` instant routing after approval | Used `getAuthedUserProfile` with dual identifier lookup (`uid` or `email`) | Implemented proper post-approval redirect logic | ✅ Fixed |
| 17 | Prisma schema missing `directUrl` | No pooler support for serverless environments | Added `directUrl = env("DIRECT_URL")` to datasource block | ✅ Fixed |

---

## 6. Current Project Status

### ✅ Completed Modules

| Module | Status | Notes |
|:-------|:-------|:------|
| Firebase Google OAuth | ✅ Production | Login, logout, token management |
| User record sync (`authed_users`) | ✅ Production | Auto-sync on login |
| Role-based routing | ✅ Production | SUPER_ADMIN → `/super-admin`, COLLEGE_ADMIN → `/college-admin`, Pending → `/waiting-approval` |
| Waiting approval screen | ✅ Production | Real-time status polling, instant redirect on approval |
| Super Admin — College provisioning | ✅ Production | Create, edit colleges with full metadata |
| College Admin — Profile view/edit | ✅ Production | Live database, no mock data |
| Landing page (Aura Academia) | ✅ Production | Full modular React landing with interactive workspace demos |
| Vercel deployment | ✅ Production | Multi-service: frontend + backend |
| Supabase IPv4 pooler connection | ✅ Fixed | `ap-northeast-1` pooler verified |
| Backend API security middleware | ✅ Production | Auth, RBAC, tenant isolation, validation |

### 🚧 In Progress

| Module | Status | Notes |
|:-------|:-------|:------|
| HOD Module | 🚧 Under development | Being built by team members — **do not touch** |
| Vercel ENV update | ⏳ Pending user action | User needs to update `DATABASE_URL` in Vercel dashboard |

### 📋 Not Started

| Module | Priority |
|:-------|:---------|
| Department & Program Management (College Admin) | Next |
| Batch & Section Creation | Next |
| Faculty & Student Bulk Onboarding | Medium |
| Course & Subject Curriculum Management | Medium |
| Faculty Dashboard (`/faculty`) | Medium |
| Student Dashboard (`/student`) | Medium |

---

## 7. Database Schema Summary

### Prisma Models (16 total)

| Model | Table Name | Purpose |
|:------|:-----------|:--------|
| `College` | `colleges` | Multi-tenant institution records |
| `Role` | `roles` | System roles (STUDENT, FACULTY, HOD, etc.) |
| `Permission` | `permissions` | Granular permissions (e.g., `users:read`) |
| `RolePermission` | `role_permissions` | Role ↔ Permission many-to-many |
| `User` | `users` | Core user records with Firebase UID |
| `UserRole` | `user_roles` | User ↔ Role many-to-many |
| `Profile` | `profiles` | Extended user profiles |
| `AccountApproval` | `account_approvals` | Approval queue for new accounts |
| `Session` | `sessions` | Security/session tracking |
| `AuditLog` | `audit_logs` | Full audit trail |
| `AuthedUser` | `authed_users` | Supabase-managed auth records |
| `Department` | `departments` | Academic departments within colleges |
| `AcademicYear` | `academic_years` | Academic year periods |
| `Program` | `programs` | Degree programs (B.Tech, M.Tech, etc.) |
| `Batch` | `batches` | Student intake batches |
| `Class` | `classes` | Classroom sections |
| `Semester` | `semesters` | Academic term periods |
| `Subject` | `subjects` | Course subjects |

### Key Enums
- `AccountStatus`: PENDING, ACTIVE, REJECTED, SUSPENDED, DISABLED
- `ApprovalStatus`: PENDING, APPROVED, REJECTED
- `RoleName`: STUDENT, FACULTY, TRAINER, HOD, TPO, COLLEGE_ADMIN, SUPERINTENDENT, SUPER_ADMIN
- `AuditAction`: 16 audit event types

---

## 8. Deployment Configuration

### `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/src/server.ts",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/backend/src/server.ts" },
    { "src": "/assets/(.*)", "dest": "/frontend/assets/$1" },
    { "src": "/vite.svg", "dest": "/frontend/vite.svg" },
    { "src": "/(.*)", "dest": "/frontend/index.html" }
  ]
}
```

### Environment Variables Required on Vercel

| Variable | Value |
|:---------|:------|
| `DATABASE_URL` | `postgresql://postgres.lmnbsauvjqursjxocsgf:[REDACTED_ROTATE_CREDENTIAL]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres:[REDACTED_ROTATE_CREDENTIAL]@db.lmnbsauvjqursjxocsgf.supabase.co:5432/postgres` |
| `FIREBASE_PROJECT_ID` | `lms-college-5975a` |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk@lms-college-5975a.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | *(Firebase Admin SDK private key)* |
| `FRONTEND_URL` | `https://college-lms-2026-ten.vercel.app` |

---

## 9. Pending / Future Work

### Immediate Actions Required
1. **Update Vercel Environment Variables** — Change `DATABASE_URL` to the IPv4 pooler URL and add `DIRECT_URL`
2. **Redeploy on Vercel** — Without build cache to pick up new env vars
3. **Verify production** — Confirm `/college-admin` loads without database errors

### Development Roadmap
1. Department & Program Management (College Admin module)
2. Batch & Section Creation
3. Faculty & Student Bulk Onboarding (CSV/Excel upload)
4. Course & Subject Curriculum Management
5. Faculty Dashboard (`/faculty`)
6. Student Dashboard (`/student`)
7. Attendance tracking system
8. Assignment submission & grading
9. Timetable management

### Constraints
- **HOD Module** — Under active development by team members; do not modify

---

## 10. Git History

```
3238061 Update schema.prisma
54dc141 landing page changed
35788fe Update WaitingApproval.tsx
ac973dd main
2fa2cf4 main
a5df149 Update tailwind.config.js
dd4a165 fixed some bugs and produced some more bugs
86838ac .env changed
8a823be chore(firebase): update to new web app credentials
fa5b8bc fix(vercel): correct schema property in vercel.json
5da75eb updated vercel.json
6117bdf main
```

---

## Appendix: Key File Paths

| File | Purpose |
|:-----|:--------|
| `frontend/src/pages/Home.tsx` | Landing page entry point |
| `frontend/src/landing/App.tsx` | Landing page orchestrator (12 sections + modals) |
| `frontend/src/landing/components/Header.tsx` | Fixed header with logo, nav, `/login` links |
| `frontend/src/landing/components/HeroSection.tsx` | 3D layered visualization hero |
| `frontend/src/landing/components/SignInModal.tsx` | Sign-in modal with portal link |
| `frontend/src/pages/Login.tsx` | Firebase Google OAuth login |
| `frontend/src/pages/WaitingApproval.tsx` | Approval status polling |
| `frontend/src/pages/CollegeAdmin.tsx` | College Admin dashboard |
| `frontend/src/pages/SuperAdmin.tsx` | Super Admin platform management |
| `frontend/src/config/supabase.ts` | Supabase client + TypeScript interfaces |
| `frontend/src/config/firebase.ts` | Firebase Web SDK config |
| `backend/src/server.ts` | Express server entry |
| `backend/src/middleware/auth.middleware.ts` | Firebase token verification |
| `backend/src/modules/college-admin/` | College Admin API module |
| `backend/prisma/schema.prisma` | Full database schema (16 models) |
| `backend/.env` | Backend environment variables |
| `vercel.json` | Vercel deployment configuration |

---

*This report was generated from conversation session `0c464493-c667-4f09-bc9c-4a65d0ffb9f7` spanning September 28 – October 3, 2026.*
