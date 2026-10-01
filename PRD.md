# Product Requirements Document (PRD): College Multi-Tenant LMS

**Document Version:** 1.0.0  
**Status:** In Progress / Core Modules Implemented  
**Date:** September 2026  
**Repository:** `College-LMS`  

---

## 1. Executive Summary

The **College Multi-Tenant Learning Management System (LMS)** is an enterprise academic administration and learning platform designed to support multiple higher education institutions under a unified architecture. It separates system-wide governance (**Super Admin**) from localized institutional governance (**College Admin**), departmental management, faculty workflows, and student learning environments.

The platform utilizes a **modern decoupled architecture** with a reactive frontend single-page application (React + Vite), a TypeScript Express backend API, and a robust dual-layer cloud infrastructure utilizing **Firebase Authentication** for identity management and **Supabase (PostgreSQL with Prisma ORM)** for relational data persistence.

---

## 2. Technology Stack & Infrastructure

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend SPA** | React 18, Vite, TypeScript | Fast, type-safe client-side UI |
| **Styling & UI** | Tailwind CSS, Lucide Icons | Responsive modern design system |
| **Client Authentication** | Firebase Web SDK (v10) | Google OAuth & session management |
| **Direct Client DB** | `@supabase/supabase-js` | Controlled client queries & record tracking |
| **Backend API** | Node.js, Express, TypeScript | Business logic, secure endpoints & validation |
| **Server Authentication** | Firebase Admin SDK | Bearer token verification & claims validation |
| **ORM & Database** | Prisma ORM, PostgreSQL (Supabase) | Type-safe migrations, schemas, and relational storage |
| **Deployment / Routing** | Vercel Multi-Services | Unified edge routing (`/api/*` -> Backend, `/*` -> Frontend) |

---

## 3. User Roles & Permission Matrix

| Role | Access Level | Landing / Home Route | Capabilities |
| :--- | :--- | :--- | :--- |
| **SUPER_ADMIN** | System-Wide | `/super-admin` | Create/edit colleges, assign college admins, global platform monitoring. |
| **COLLEGE_ADMIN** | Single College | `/college-admin` | Manage assigned college profile, departments, faculty, students, academic structures. |
| **FACULTY** | Institutional Department | `/faculty` *(Planned)* | Manage subjects, assignments, attendance, student grading. |
| **STUDENT** | Class / Section | `/student` *(Planned)* | View courses, submit assignments, view marks and timetable. |
| **USER (Pending)** | Unassigned | `/waiting-approval` | Newly authenticated users pending role assignment and college affiliation. |

---

## 4. Completed Features & Implemented Modules

### 4.1. Authentication, Identity Sync & Dynamic Redirection
- **Google OAuth Integration:** Seamless single sign-on using Firebase Authentication with Google Provider.
- **Automatic User Record Synchronization:** When a user logs in, `recordAuthedUser` synchronizes their UID, email, display name, and avatar into the Supabase `authed_users` table.
- **Orphan / Account Conflict Resolution:** Handled unique constraint conflicts when users re-register with previous email addresses.
- **Smart Role-Based Route Gatekeeper:**
  - `SUPER_ADMIN` $\rightarrow$ Redirects to `/super-admin`.
  - `COLLEGE_ADMIN` $\rightarrow$ Validates institutional assignment and redirects to `/college-admin`.
  - Unassigned / New Accounts $\rightarrow$ Automatically routed to the dedicated **Pending Approval Screen**.

### 4.2. User Onboarding & Approval Queue (`/waiting-approval`)
- **Self-Service Status Polling:** Interactive "Check Approval Status" action that queries the user's updated database role in real-time without requiring a hard browser refresh.
- **Instant Escalation:** If a Super Admin assigns a role while the user is waiting, clicking status check immediately redirects them to their respective portal (`/college-admin` or `/super-admin`).
- **Secure Sign-Out:** Clean session teardown and Firebase sign-out mechanism from the waiting state.

### 4.3. Super Admin: College Institution Provisioning
- **Modal-Based Institution Creator:** Multi-field institution registry form with real-time validation.
- **Supported Institution Metadata:**
  - Institution Name & Unique Institutional Code (e.g., `BIHER`, `IITM`).
  - Allowed Email Domain (e.g., `@bharathuniv.ac.in`).
  - Physical location fields: Street Address, City, State, Country.
  - Digital Presence: Official Website URL and College Logo / Seal URL with live preview.
  - Designated Administrator: Assigned Admin Name, Email, and Admin UID.
  - Operational Status toggle (`is_active`).
- **Data Persistence:** Fully synchronized with the Supabase `colleges` table with automated timestamp management (`created_at`, `updated_at`).

### 4.4. College Admin: Production College Profile Module
- **Zero-Mock Policy Enforcement:** Completely replaced placeholder/static mock data with live database records linked directly to the authenticated College Admin.
- **Identity-Secured API Access:**
  - Frontend requests attach Firebase ID tokens via `Authorization: Bearer <token>`.
  - Backend middleware decodes the token, checks the user's role in the database, verifies assigned `college_id`, and blocks unauthorized cross-tenant access.
- **Real-Data Display & Fallback Handling:** Displays actual counts (showing real `0` values rather than synthetic numbers).
- **Edit & Update Capability:** Allows College Admins to update their institution's address, contact email, phone, website, and branding via `PATCH /api/college-admin/college/profile`.

### 4.5. Backend API & Database Infrastructure
- **Prisma ORM Synchronization:**
  - Configured PostgreSQL datasource targeting Supabase direct pooler.
  - Complete schema mapping for snake_case PostgreSQL conventions (`logo_url`, `admin_name`, `admin_email`, `admin_uid`, `is_active`, `created_at`, `updated_at`).
- **Security & Access Control:**
  - Row Level Security (RLS) policies configured on Supabase tables.
  - Database schema scripts (`supabase_schema.sql` & `supabase_schema_part2.sql`) created and executed.
- **REST Endpoints Implemented:**
  - `GET /api/health` — System status and connectivity check.
  - `GET /api/college-admin/college/profile` — Fetch authenticated college profile.
  - `PATCH /api/college-admin/college/profile` — Update authenticated college profile.

### 4.6. Vercel Multi-Services Deployment Setup
- **Configured `vercel.json`:**
  - Implemented multi-service architecture with `backend` (Express) and `frontend` (Vite).
  - Configured reverse-proxy rewrites routing `/api/(.*)` to the backend service and `/(.*)` to the frontend.
  - Configured relative API baseURL defaults in the frontend client to seamlessly support local development and Vercel edge deployment.

---

## 5. Relational Data Models (Database Schema)

### 5.1. `colleges` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID / Text | PRIMARY KEY | Unique college identifier |
| `name` | Text | NOT NULL | Full institution name |
| `code` | Text | UNIQUE, NOT NULL | Short code (e.g. BIHER) |
| `domain` | Text | NULLABLE | Allowed student/faculty email domain |
| `address` | Text | NULLABLE | Physical address |
| `city` | Text | NULLABLE | City |
| `state` | Text | NULLABLE | State / Province |
| `country` | Text | NULLABLE | Country |
| `phone` | Text | NULLABLE | Official contact phone |
| `email` | Text | NULLABLE | Official contact email |
| `website` | Text | NULLABLE | Official website URL |
| `logo_url` | Text | NULLABLE | Public URL to institutional logo |
| `admin_name` | Text | NULLABLE | Name of assigned College Admin |
| `admin_email` | Text | NULLABLE | Email of assigned College Admin |
| `admin_uid` | Text | NULLABLE | Firebase UID of assigned College Admin |
| `is_active` | Boolean | DEFAULT true | Operational state of the tenant |
| `created_at` | Timestamptz | DEFAULT now() | Creation timestamp |
| `updated_at` | Timestamptz | NOT NULL | Last update timestamp |

### 5.2. `authed_users` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `uid` | Text | PRIMARY KEY | Firebase Auth UID |
| `email` | Text | UNIQUE, NOT NULL | User email address |
| `display_name`| Text | NULLABLE | Full name |
| `photo_url` | Text | NULLABLE | Profile avatar URL |
| `role` | Text | DEFAULT 'USER' | Role: `SUPER_ADMIN`, `COLLEGE_ADMIN`, `USER`, etc. |
| `college_id` | Text | NULLABLE | Foreign reference to assigned college |
| `provider` | Text | DEFAULT 'google'| Auth provider |
| `last_login` | Timestamptz | DEFAULT now() | Last session activity |
| `created_at` | Timestamptz | DEFAULT now() | Registration date |

---

## 6. Next Steps & Development Roadmap

1. **Department & Program Management:** Enable College Admin to create and organize departments (e.g., Computer Science, Mechanical) and programs (B.Tech, M.Tech).
2. **Batch & Section Creation:** Allow grouping students by academic years and specific classroom sections.
3. **Faculty & Student Bulk Onboarding:** CSV/Excel upload and domain-based auto-assignment for incoming students and staff.
4. **Course & Subject Curriculum Management:** Assignment of subjects to faculty and semester schedules.
5. **Role-Based Views for Faculty & Students:** Implement `/faculty` and `/student` role dashboards.
