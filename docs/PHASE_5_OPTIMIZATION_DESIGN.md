# PHASE 5 — OPTIMIZATION DESIGN & IMPLEMENTATION SPECIFICATION
**Aura Academia (College LMS)**  
**Engineering Design Date:** October 2026  
**Roles:** Senior Backend Performance Engineer, PostgreSQL Query Optimization Specialist, Node.js/Express Architect, Vercel Serverless Performance Engineer, and Frontend Network Performance Analyst.

---

## 1. PRIORITIZED OPTIMIZATION ROADMAP

Optimizations are strictly prioritized by **Impact-to-Effort Ratio (ROI)**, structured so that foundational infrastructure fixes immediately yield an ~80% latency drop before code-level and caching optimizations are layered on.

```
+----------------------------------------------------------------------------------------------------+
|                                    PRIORITIZED EXECUTION PHASES                                    |
+----------------------------------------------------------------------------------------------------+
| TIER 0: ZERO-CODE INFRASTRUCTURE CO-LOCATION (Immediate ~80% Latency Drop)                         |
|   • Co-locate Vercel Serverless Functions to Tokyo (`hnd1`) in vercel.json.                        |
|   • Result: Trans-Pacific RTT drops from ~185ms to < 8ms per database query.                       |
|                                                                                                    |
| TIER 1: DATABASE INTEGRITY & INDEXING (Eliminates 100% of Caught 42P01 Errors)                     |
|   • Execute DDL for 5 missing tables (attendance_sessions, class_timetables, etc.).               |
|   • Create 5 critical B-tree indexes on authed_users, classes, and subjects.                       |
|                                                                                                    |
| TIER 2: MIDDLEWARE & QUERY CONSOLIDATION (Eliminates 70% of Sequential DB Hops)                   |
|   • Short-lived in-memory LRU cache for verified actor identity in auth & student middleware.      |
|   • Batch N+1 query loop in `getTodayReminders` into a single set-based SQL statement.             |
|   • Consolidate multi-stage sequential queries in Student & Faculty dashboard services.           |
|                                                                                                    |
| TIER 3: FRONTEND LIFECYCLE & REQUEST DEDUPLICATION (Halves Client Traffic)                         |
|   • Remove duplicate `loadDashboard()` call in FacultyDashboard.tsx.                               |
|   • Add in-flight Promise deduplication map to studentApi.ts and facultyApi.ts.                    |
|   • Guard `auth.authStateReady()` with `if (!auth.currentUser)`.                                  |
|                                                                                                    |
| TIER 4: PRISMA CLIENT REUSE & SIZED POOLING (Eliminates Pool Starvation)                           |
|   • Align Prisma connection parameters for PgBouncer transaction mode (`pgbouncer=true`).         |
|   • Ensure lazy connection initialization on cold starts.                                          |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. TIER 0: REGIONAL CO-LOCATION & VERCEL TOPOLOGY

### Current vs. Target Topology
* **Current:** User (India) $\to$ Edge POP (`bom1`, Mumbai) $\to$ Vercel Function (`iad1`, Washington D.C.) $\to$ Supabase DB (`ap-northeast-1`, Tokyo) $\to$ Vercel Function $\to$ User.
* **Target:** User (India) $\to$ Edge POP (`bom1`, Mumbai) $\to$ Vercel Function (`hnd1`, Tokyo) $\to$ Supabase DB (`ap-northeast-1`, Tokyo) $\to$ User.

### Exact Change in `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/src/server.ts",
      "use": "@vercel/node",
      "config": {
        "regions": ["hnd1"]
      }
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/src/server.ts"
    },
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "dest": "/frontend/assets/$1"
    },
    {
      "src": "/(.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|json|txt))",
      "headers": {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
      },
      "dest": "/frontend/$1"
    },
    {
      "src": "/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=0, must-revalidate"
      },
      "dest": "/frontend/index.html"
    }
  ]
}
```

* **Expected Impact:** Database network transit drops from 185ms to 4ms – 8ms per query. An endpoint with 5 sequential queries drops from **925ms** of network wait to **25ms – 40ms**.

---

## 3. TIER 1: DATABASE SCHEMA & MISSING TABLES EXECUTION

### Problem
Codebase repositories query `attendance_sessions`, `attendance_records`, `class_timetables`, `faculty_timetables`, and `faculty_reminders`. These tables do not exist in the Supabase PostgreSQL database, causing caught `42P01` exceptions that waste round trips and leave attendance/timetables permanently empty.

### Action Plan
Execute DDL script based on [`backend/src/scripts/init_faculty_tables.ts`](file:///c:/Users/natha.HP/OneDrive/Documents/GitHub/College-LMS/backend/src/scripts/init_faculty_tables.ts) using Supabase SQL client:

```sql
-- 1. Create Enum
DO $$ BEGIN
  CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Faculty Timetables
CREATE TABLE IF NOT EXISTS faculty_timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_uid VARCHAR(255) NOT NULL,
  day_of_week VARCHAR(50) NOT NULL,
  period VARCHAR(50) NOT NULL,
  start_time VARCHAR(50),
  end_time VARCHAR(50),
  class_id UUID,
  class_name VARCHAR(255) NOT NULL,
  subject_id UUID,
  subject_name VARCHAR(255) NOT NULL,
  room VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_faculty_timetables_uid ON faculty_timetables(faculty_uid);

-- 3. Faculty Reminders
CREATE TABLE IF NOT EXISTS faculty_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_uid VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
  class_id UUID,
  class_name VARCHAR(255),
  subject_name VARCHAR(255),
  due_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_time VARCHAR(50),
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_faculty_reminders_uid ON faculty_reminders(faculty_uid);

-- 4. Class Timetables
CREATE TABLE IF NOT EXISTS class_timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL,
  day_of_week VARCHAR(50) NOT NULL,
  period VARCHAR(50) NOT NULL,
  start_time VARCHAR(50),
  end_time VARCHAR(50),
  subject_name VARCHAR(255) NOT NULL,
  subject_code VARCHAR(100),
  faculty_name VARCHAR(255),
  room VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_class_timetables_class_id ON class_timetables(class_id);

-- 5. Attendance Sessions
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL,
  faculty_uid VARCHAR(255) NOT NULL,
  subject_id UUID,
  date DATE NOT NULL,
  period VARCHAR(50) NOT NULL,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_attendance_sessions_class_date_period UNIQUE (class_id, date, period)
);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_class_date ON attendance_sessions(class_id, date);

-- 6. Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_uid VARCHAR(255) NOT NULL,
  status "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_attendance_records_session_student UNIQUE (session_id, student_uid)
);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON attendance_records(student_uid);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON attendance_records(session_id);
```

---

## 4. TIER 1: JUSTIFIED POSTGRESQL INDEX SPECIFICATIONS

### Audit & Index Plan

| Target Table | Column(s) to Index | Index Type | Target Query Benefited | Expected Trade-off | Verification Command |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `authed_users` | `(class_id, role)` | B-Tree | `SELECT * FROM authed_users WHERE class_id = $1 AND role = 'STUDENT'` (Class Rosters) | Slight write overhead on student enrollment | `EXPLAIN (BUFFERS) SELECT * FROM authed_users WHERE class_id = '...' AND role = 'STUDENT'` |
| `authed_users` | `(department_id)` | B-Tree | `SELECT * FROM authed_users WHERE department_id = $1` (Dept Faculty/Student lists) | Minimal write overhead | `EXPLAIN (BUFFERS) SELECT * FROM authed_users WHERE department_id = '...'` |
| `authed_users` | `(college_id)` | B-Tree | Tenant boundary queries across users | Minimal write overhead | `EXPLAIN (BUFFERS) SELECT * FROM authed_users WHERE college_id = '...'` |
| `authed_users` | `(LOWER(email))` | B-Tree (Functional) | `WHERE uid = $1 OR LOWER(email) = $2 FOR UPDATE` (`record-user`) | Eliminates table scan during user login | `EXPLAIN ANALYZE SELECT * FROM authed_users WHERE LOWER(email) = '...'` |
| `classes` | `(faculty_uid)` | B-Tree | `getAssignedClasses` (`WHERE faculty_uid = $1`) | Minimal write overhead on class creation | `EXPLAIN (BUFFERS) SELECT * FROM classes WHERE faculty_uid = '...'` |
| `subjects` | `(department_id)` | B-Tree | `getSubjectsByDepartment` (`WHERE department_id = $1`) | Negligible write overhead | `EXPLAIN (BUFFERS) SELECT * FROM subjects WHERE department_id = '...'` |

### DDL to Apply
```sql
CREATE INDEX IF NOT EXISTS idx_authed_users_class_role ON authed_users(class_id, role);
CREATE INDEX IF NOT EXISTS idx_authed_users_dept ON authed_users(department_id);
CREATE INDEX IF NOT EXISTS idx_authed_users_college ON authed_users(college_id);
CREATE INDEX IF NOT EXISTS idx_authed_users_lower_email ON authed_users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_classes_faculty_uid ON classes(faculty_uid);
CREATE INDEX IF NOT EXISTS idx_subjects_department_id ON subjects(department_id);
```

---

## 5. TIER 2: PRISMA CLIENT REUSE & PGBOUNCER CONFIGURATION

### Problem
1. Supabase pooler runs in **PgBouncer Transaction Mode** on port 6543.
2. In transaction mode, prepared statements and connection-level advisory locks must not persist across transactions.
3. Node.js serverless functions running on Vercel spin up on-demand; if `PrismaClient` connects eagerly or allocates too many connections, PgBouncer's 15-slot pool exhausts quickly.

### Configuration Standard for `backend/src/config/database.ts`
```typescript
import { PrismaClient } from '@prisma/client';
import { env } from './env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Append connection_limit=1 and pgbouncer=true to connection string for serverless
const databaseUrl = process.env.DATABASE_URL || '';
const serverlessUrl = databaseUrl.includes('?') 
  ? `${databaseUrl}&connection_limit=1&pgbouncer=true` 
  : `${databaseUrl}?connection_limit=1&pgbouncer=true`;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: serverlessUrl,
      },
    },
    log: env.NODE_ENV === 'development' && process.env.PRISMA_LOG_QUERIES ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

// Always store on globalThis to preserve connection pool across warm serverless invocations
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} else {
  // In serverless production, also assign to globalThis to reuse across warm invocations
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

---

## 6. TIER 2: AUTHENTICATION & MIDDLEWARE OPTIMIZATION

### Problem
Every incoming request to `/api/student/*` and `/api/faculty/*` currently triggers **two sequential database queries**:
1. `authenticateFirebaseUser`: Queries `prisma.user` (with nested roles and permissions).
2. `buildStudentContext` / `facultyAuthMiddleware`: Queries `prisma.authedUser` (with nested class and department hierarchy).

### Safe In-Memory Verification Context Architecture
* We **MUST NOT** bypass `firebaseAuth.verifyIdToken(idToken)`. Cryptographic verification of the bearer token must execute on every request to ensure token validity, expiry, and revocation.
* However, once the `firebaseUid` is cryptographically proven, the user's role and class assignment from PostgreSQL changes infrequently (days or months).
* **Solution:** A bounded, in-memory LRU cache (`LRUCache`) keyed strictly by `firebaseUid` with a short TTL (45 seconds).

```
Incoming Request (Bearer JWT)
       │
       ▼
[ firebaseAuth.verifyIdToken(idToken) ]  <-- Cryptographic check (ALWAYS RUNS)
       │
       ▼
Has Verified UID?
       │
       ├── Cache Hit (In-Memory LRU, TTL: 45s, Key: uid)
       │     └── Return verified UserContext & StudentContext directly (0ms DB delay)
       │
       └── Cache Miss
             ├── Query DB: users + roles + permissions
             ├── Query DB: authed_users + class + department hierarchy
             └── Store in LRU cache (TTL: 45s)
```

### Security & Invalidation Guarantee
1. **Tenant Isolation:** Cache key includes `uid`. Context includes strictly validated `collegeId` and `role`.
2. **Immediate Invalidation on Update:** When an admin or student updates their profile or role (`PATCH /api/student/profile`, `/api/approvals/:id`), the backend explicitly calls `authCache.delete(uid)`.
3. **Fail-Closed Expiry:** If a token is revoked or expires, `verifyIdToken` throws a 401 error before the cache is ever consulted.

---

## 7. SAFE CACHING ARCHITECTURE MATRIX (NO REDIS REQUIRED)

Per constraints, **no Redis or external cache service is introduced**. Instead, we use a two-tiered model:
1. **Tier A (Server-Side In-Memory LRU):** Short-lived (30s – 300s) for read-heavy reference and user-scoped context on warm serverless instances.
2. **Tier B (HTTP ETag / Stale-While-Revalidate Headers):** Delegating caching to Vercel's global CDN and browser HTTP caches for public/read-mostly static academic structures.

### Comprehensive Caching Matrix

| Cacheable Entity | Cache Layer & Mechanism | Cache Key & Scope | TTL | Stale Data Policy | Serverless Behavior | Invalidation Trigger | Auth Enforcement |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Verified Student Context** | Server In-Memory LRU (`authCache`) | `auth:student:${firebaseUid}`<br>(User-scoped) | **45 sec** | **Never Acceptable**.<br>If expired, re-fetch from DB. | Cached per warm container. Fresh container fetches once. | Explicit `authCache.delete(uid)` on profile/approval update. | `verifyIdToken()` must succeed *before* reading cache. |
| **Verified Faculty Context** | Server In-Memory LRU (`authCache`) | `auth:faculty:${firebaseUid}`<br>(User-scoped) | **45 sec** | **Never Acceptable**. | Cached per warm container. Fresh container fetches once. | Explicit `authCache.delete(uid)` on profile/role update. | `verifyIdToken()` must succeed *before* reading cache. |
| **Academic Years & Semesters** | Server In-Memory LRU + HTTP ETag | `ref:academic:${collegeId}`<br>(Tenant-scoped) | **300 sec** (5 min) | **Acceptable for 60s** during schedule updates. | Shared across all requests on the same warm container. | Invalidated on admin academic year update. | Must have valid authenticated user belonging to `collegeId`. |
| **Department List & Programs** | Server In-Memory LRU + HTTP ETag | `ref:depts:${collegeId}`<br>(Tenant-scoped) | **300 sec** (5 min) | **Acceptable for 60s**. | Shared across requests on the same warm container. | Invalidated on admin department update. | User must belong to the matching `collegeId`. |
| **Student Dashboard Composite** | Client-Side In-Flight Deduplicator | Memory Map in API client | **Request-scoped** (duration of pending promise) | **Never Acceptable**. | Runs in browser JS heap. | Promise completes or rejects. | Inherits active Firebase session token. |
| **Faculty Class Roster Summary** | Server In-Memory LRU | `class:roster:${classId}`<br>(Class-scoped) | **60 sec** | **Acceptable for 15s** during bulk uploads. | Warm container cache. | Invalidated on student assignment or bulk upload. | Verified faculty must be assigned to `classId` or be HOD/Admin. |

---

## 8. TIER 2: DASHBOARD & REMINDERS QUERY CONSOLIDATION

### A. Consolidate `getTodayReminders` (N+1 Elimination)
In [`backend/src/modules/faculty/faculty.repository.ts`](file:///c:/Users/natha.HP/OneDrive/Documents/GitHub/College-LMS/backend/src/modules/faculty/faculty.repository.ts):
* **Before:** Loop over $N$ schedule slots and execute individual `SELECT FROM attendance_sessions WHERE class_id = $1 AND period = $2`.
* **After:**
  ```typescript
  const classIds = assignedClasses.map(c => c.id);
  // Single query for all classes assigned to faculty today:
  const markedSessions: any = await prisma.$queryRawUnsafe(
    `SELECT class_id, period, updated_at 
     FROM attendance_sessions 
     WHERE class_id = ANY($1::uuid[]) AND date = $2::date`,
    classIds,
    today
  );
  // In-memory O(1) map lookup:
  const sessionMap = new Map<string, string>();
  for (const s of markedSessions) {
    sessionMap.set(`${s.class_id}_${s.period}`, s.updated_at);
  }
  ```
* **Impact:** Reduces SQL query count from $N+1$ to **1**, saving $N \times 185\text{ms}$ in current topology or $(N-1) \times 5\text{ms}$ in co-located topology.

### B. Consolidate Student Dashboard Execution
In [`backend/src/modules/student/student.service.ts`](file:///c:/Users/natha.HP/OneDrive/Documents/GitHub/College-LMS/backend/src/modules/student/student.service.ts):
* **Before:** 3 sequential stages of `Promise.all` that execute 6 queries sequentially.
* **After:** Single composite parallel dispatch:
  ```typescript
  const [hierarchy, academicYears, timetable, attendanceSummary] = await Promise.all([
    studentContext.classId ? this.studentRepo.getClassFullHierarchy(studentContext.classId) : null,
    studentContext.collegeId ? this.studentRepo.getAcademicYears(studentContext.collegeId) : [],
    studentContext.classId ? this.studentRepo.getClassTimetable(studentContext.classId) : [],
    studentContext.uid ? this.studentRepo.getStudentAttendanceSummary(studentContext.uid) : null,
  ]);
  ```

---

## 9. TIER 3: FRONTEND REQUEST DEDUPLICATION & LIFECYCLE REFACTOR

### A. Eliminate Duplicate `loadDashboard()` Dispatch
* **File:** [`frontend/src/modules/faculty/pages/FacultyDashboard.tsx`](file:///c:/Users/natha.HP/OneDrive/Documents/GitHub/College-LMS/frontend/src/modules/faculty/pages/FacultyDashboard.tsx)
* **Change:** Remove `loadDashboard()` from `FacultyDashboard.tsx`'s `useEffect`, because [`FacultyLayout.tsx`](file:///c:/Users/natha.HP/OneDrive/Documents/GitHub/College-LMS/frontend/src/layouts/FacultyLayout.tsx) already guarantees its dispatch for the module session:
  ```typescript
  // FacultyDashboard.tsx
  useEffect(() => {
    // Only load profile if missing; layout handles dashboard
    if (!profile && !loading.profile) {
      loadProfile();
    }
  }, []);
  ```

### B. Add In-Flight Promise Deduplication to `facultyApi.ts` & `studentApi.ts`
Implement the identical lightweight deduplication pattern established in `secureDataApi.ts`:
```typescript
// frontend/src/utils/apiDeduplicator.ts
const inFlightRequests = new Map<string, Promise<any>>();

export function deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = requestFn().finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, promise);
  return promise;
}
```
* **Usage in `facultyApi.ts`:**
  ```typescript
  getDashboard: () => deduplicateRequest('faculty:dashboard', async () => {
    const res = await api.get<FacultyDashboardData>('/faculty/dashboard');
    return res.data;
  }),
  ```

### C. Guard `auth.authStateReady()`
* **Files:** [`facultyApi.ts:45`](file:///c:/Users/natha.HP/OneDrive/Documents/GitHub/College-LMS/frontend/src/modules/faculty/api/facultyApi.ts#L45), [`studentApi.ts:29`](file:///c:/Users/natha.HP/OneDrive/Documents/GitHub/College-LMS/frontend/src/modules/student/api/studentApi.ts#L29)
* **Change:**
  ```typescript
  // Avoid microtask tick when user is already resolved
  if (!auth.currentUser) {
    await auth.authStateReady();
  }
  if (!auth.currentUser) throw new Error('Firebase sign-in required');
  ```

---

## 10. REGRESSION TESTING SUITE & REPEATABLE BENCHMARKS

To verify optimization effectiveness and prevent latency regressions, we specify two automated benchmarks:

### 1. Repeatable Endpoint Benchmark Script (`scripts/benchmark_endpoints.ts`)
A Node.js test script using `node:test` and `performance.now()` that measures:
1. P50, P90, and P99 latency across 20 iterations for:
   * `/api/health` (Baseline cold vs. warm network RTT)
   * `/api/student/dashboard`
   * `/api/faculty/dashboard`
   * `/api/faculty/today-reminders`
2. Asserts regression budgets:
   * **Warm `/api/health`:** $\le 35\text{ms}$ (Co-located Tokyo/India)
   * **Warm `/api/student/dashboard`:** $\le 150\text{ms}$ (P95)
   * **Warm `/api/faculty/today-reminders`:** $\le 100\text{ms}$ (P95)
   * **Database Query Count per Dashboard:** $\le 3$ queries (via `Server-Timing` assertions)

### 2. Frontend Network Invariant Test (`tests/frontend_mount_audit.test.ts`)
Using Playwright/Vitest:
* Mounts `FacultyLayout` and `FacultyDashboard`.
* Asserts that `GET /api/faculty/dashboard` is called **exactly once** during initial render.
* Asserts that zero unhandled 42P01 error toasts appear in browser console.

---

## 11. SUMMARY OF EXPECTED OUTCOMES

| Metric | Baseline Current State | Post-Optimization Target | Total Improvement |
| :--- | :--- | :--- | :--- |
| **Vercel $\leftrightarrow$ Supabase RTT** | ~185ms | **< 8ms** | **~96% faster** |
| **Failed 42P01 Queries** | 2–6 per page load | **0** (All tables provisioned) | **100% eliminated** |
| **Middleware DB Round Trips** | 2 queries (~370ms) | **0 on warm cache (< 1ms)** | **> 99% faster** |
| **Student Dashboard P95 Latency** | 1,450ms – 2,400ms | **80ms – 140ms** | **~94% faster** |
| **Faculty Reminders P95 Latency** | 1,200ms – 2,200ms | **50ms – 90ms** | **~96% faster** |
| **Initial Dashboard Requests** | 6 parallel requests | **2 parallel requests** | **67% network drop** |
| **PgBouncer Pool Utilization** | Peak saturation (15/15) | **Nominal (2–4/15)** | **No connection queueing** |
