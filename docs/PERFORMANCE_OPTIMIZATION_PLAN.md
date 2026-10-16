# PERFORMANCE OPTIMIZATION PLAN
**Aura Academia (College LMS)**  
**Status:** Canonical Engineering Deliverable (Phase 8)  
**Date:** October 2026  
**Auditor Roles:** Senior Backend Performance Engineer, PostgreSQL Optimization Specialist, Vercel Serverless Performance Engineer.

---

## 1. PRIORITIZATION MATRIX & EXECUTION TIERS

Fixes are prioritized by **Impact-to-Effort Ratio (ROI)**. Tier 0 and Tier 1 address the root causes of multi-second delays with minimal risk and zero disruption to business logic.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    OPTIMIZATION ACTION MATRIX                                    │
├──────┬────────────────────────────────┬──────────┬──────────┬─────────────┬──────────────────────┤
│ Tier │ Optimization Action            │ Impact   │ Effort   │ Risk Level  │ Expected Latency Drop│
├──────┼────────────────────────────────┼──────────┼──────────┼─────────────┼──────────────────────┤
│ **0**│ Regional Co-location in Tokyo  │ Extreme  │ Low      │ Zero        │ **~80% (1,200ms+)**  │
│ **1**│ Provision 5 Missing DB Tables  │ Critical │ Low      │ Zero        │ **100% 42P01 eliminated│
│ **1**│ Add 5 PostgreSQL Indexes       │ High     │ Low      │ Very Low    │ **80% on rosters**   │
│ **2**│ In-Memory Auth Context Cache   │ High     │ Medium   │ Low         │ **~370ms on every req│
│ **2**│ Batch N+1 Reminders Query Loop │ High     │ Low      │ Low         │ **~800ms on reminders│
│ **3**│ Frontend Deduplication & Mount │ Medium   │ Low      │ Zero        │ **50% traffic drop** │
│ **4**│ Prisma Client Pool Sizing      │ Medium   │ Low      │ Zero        │ **No pool starvation│
└──────┴────────────────────────────────┴──────────┴──────────┴─────────────┴──────────────────────┘
```

---

## 2. DETAILED ACTION PLANS BY TIER

### TIER 0: REGIONAL CO-LOCATION IN VERCEL
* **Description:** Add `"regions": ["hnd1"]` (Tokyo) for serverless functions in [`vercel.json`](file:///c:/Users/natha.HP/OneDrive/Documents/GitHub/College-LMS/vercel.json).
* **Expected Impact:** Trans-Pacific RTT drops from ~185ms to < 8ms per database round trip. Eliminates 900ms – 1,300ms of idle network wait on multi-query endpoints.
* **Risk & Dependencies:** Zero risk. Supabase is in AWS Tokyo (`ap-northeast-1`); placing Vercel in Tokyo (`hnd1`) creates co-located low-latency execution.
* **Validation Steps:**
  1. Commit `vercel.json` and deploy.
  2. Inspect response header: `curl -i https://<domain>/api/health | grep X-Vercel-Id`.
  3. Confirm `::hnd1::` is present.

---

### TIER 1: DATABASE INTEGRITY & INDEX CREATION
* **Description:**
  1. Execute DDL from [`backend/src/scripts/init_faculty_tables.ts`](file:///c:/Users/natha.HP/OneDrive/Documents/GitHub/College-LMS/backend/src/scripts/init_faculty_tables.ts) to provision: `attendance_sessions`, `attendance_records`, `class_timetables`, `faculty_timetables`, and `faculty_reminders`.
  2. Create 5 B-tree indexes:
     * `CREATE INDEX idx_authed_users_class_role ON authed_users(class_id, role);`
     * `CREATE INDEX idx_authed_users_dept ON authed_users(department_id);`
     * `CREATE INDEX idx_authed_users_lower_email ON authed_users(LOWER(email));`
     * `CREATE INDEX idx_classes_faculty_uid ON classes(faculty_uid);`
     * `CREATE INDEX idx_subjects_department_id ON subjects(department_id);`
* **Expected Impact:**
  * Eliminates 100% of caught `42P01` database errors.
  * Replaces full-table sequential scans with indexed probes on student rosters and class listings.
* **Risk & Dependencies:** Zero risk. Table creation uses `CREATE TABLE IF NOT EXISTS`; indexes use `CREATE INDEX IF NOT EXISTS`.
* **Validation Steps:**
  1. Execute DDL via Supabase SQL client.
  2. Query `SELECT table_name FROM information_schema.tables WHERE table_name = 'attendance_sessions'`.
  3. Run `EXPLAIN (BUFFERS)` on class roster query to verify `Index Scan using idx_authed_users_class_role`.

---

### TIER 2: MIDDLEWARE CONTEXT CACHING & N+1 QUERY BATCHING
* **Description:**
  1. Add in-memory `LRUCache` (45s TTL) for verified user and student context in `authenticateFirebaseUser` and `buildStudentContext`, keyed by `firebaseUid`.
  2. Batch the iterative slot loop in `getTodayReminders` into a single SQL query: `SELECT ... WHERE class_id = ANY($1::uuid[]) AND date = $2::date`.
* **Expected Impact:**
  * Bypasses 2 database round trips on 99% of warm requests, saving ~370ms (current) or ~15ms (co-located).
  * Reduces `getTodayReminders` query count from $N+1$ to 1.
* **Risk & Dependencies:** Low risk. Ensure `authCache.delete(uid)` is called upon profile or role updates.
* **Validation Steps:**
  1. Verify query count in `Server-Timing` header drops from 6 to $\le 2$ on student dashboard.
  2. Verify reminders query completes in < 70ms.

---

### TIER 3: FRONTEND LIFECYCLE REFACTOR & REQUEST DEDUPLICATION
* **Description:**
  1. Remove duplicate `loadDashboard()` call from [`FacultyDashboard.tsx:23`](file:///c:/Users/natha.HP/OneDrive/Documents/GitHub/College-LMS/frontend/src/modules/faculty/pages/FacultyDashboard.tsx#L23).
  2. Guard `auth.authStateReady()` with `if (!auth.currentUser)` in `facultyApi.ts` and `studentApi.ts`.
  3. Implement in-flight promise deduplication map across `facultyApi` and `studentApi`.
* **Expected Impact:**
  * Halves initial HTTP request volume on faculty dashboard navigation.
  * Eliminates client-side microtask queuing delays.
* **Risk & Dependencies:** Zero risk. Layout already guarantees dashboard state loading.
* **Validation Steps:**
  1. Open browser Network tab; navigate to `/faculty`.
  2. Verify only 1 request to `/api/faculty/dashboard` is fired.

---

### TIER 4: PRISMA SIZING FOR PGBOUNCER TRANSACTION MODE
* **Description:** Configure `connection_limit=1` and `pgbouncer=true` in `DATABASE_URL` within [`backend/src/config/database.ts`](file:///c:/Users/natha.HP/OneDrive/Documents/GitHub/College-LMS/backend/src/config/database.ts).
* **Expected Impact:** Prevents Supabase PgBouncer pool saturation under concurrent multi-user traffic.
* **Risk & Dependencies:** Zero risk. Aligns Prisma with Supabase's transaction pooler architecture.
* **Validation Steps:**
  1. Run concurrent benchmark: `npx tsx src/scripts/benchmark.ts` at concurrency $C=10$.
  2. Confirm 0 connection timeout errors.
