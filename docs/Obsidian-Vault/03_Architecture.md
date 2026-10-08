# Architecture

## Frontend (`frontend/src/`)
- React Router v7 driving standard SPA navigation with nested sub-layouts.
- **Entry Points:** `App.tsx` routes between `pages/` (Home, Login, WaitingApproval, CollegeAdmin, SuperAdmin) and nested `/faculty/*` routes.
- **Faculty Module (`modules/faculty/`):** 12 comprehensive pages & components managed via Redux Toolkit (`facultySlice.ts`) and wrapped in `FacultyLayout.tsx`. See [[07_Faculty_Portal_Integration]].
- **Landing Module:** A modular implementation lives in `landing/App.tsx`, providing dynamic previews and direct links to live portals, integrated via `Home.tsx`.
- Connects to Firebase (`config/firebase.ts`) and Supabase directly for client realtime/tracking queries (`config/supabase.ts`).

## Backend (`backend/src/`)
- Express 4 server mapping routes dynamically.
- `modules/` directory organizes domain boundaries (`approvals`, `audit`, `auth`, `college-admin`, `faculty`, etc).
- **Faculty Module (`modules/faculty/`):** Implements Controller-Service-Repository pattern for `/api/faculty/*` handling dashboard, attendance, classes, students, reminders, subjects, and profiles.
- **Middleware:** `auth.middleware.ts` for Firebase tokens, `rbac.middleware.ts` for permissions, `tenant.middleware.ts` for data isolation, and `validation.middleware.ts` running Zod schemas.

## Routing (Vercel)
Vercel is setup to intercept `/api/(.*)` towards the Express backend via Serverless Functions, while all other routes fallback to the frontend single-page application.
