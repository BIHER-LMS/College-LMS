# PHASE 7 — TARGETS AND REALISTIC EXPECTATIONS
**Aura Academia (College LMS)**  
**Engineering Analysis Date:** October 2026  
**Auditor Roles:** Senior Backend Performance Engineer, PostgreSQL Query Optimization Specialist, Node.js/Express Architect, Vercel Serverless Performance Engineer, and Frontend Network Performance Analyst.

---

## 1. THE PHYSICAL FLOOR OF LATENCY: WHY SINGLE-DIGIT MILLISECONDS ARE UNREALISTIC FOR CLOUD WEB APPS

In naive discussions of web performance, it is common to hear unrealistic claims such as *"every API endpoint should respond in 5ms"*. For a cloud-deployed, authenticated, database-backed web application, **this is physically impossible** over the public internet.

Understanding the non-compressible physical, cryptographic, and architectural floors is essential for setting rigorous Service Level Objectives (SLOs).

```
+----------------------------------------------------------------------------------------------------+
|                         THE PHYSICAL LATENCY ANATOMY OF A WEB REQUEST                              |
+----------------------------------------------------------------------------------------------------+
| 1. Optical Transit & Speed of Light in Glass:                                                      |
|    • Mumbai (User) to Tokyo (Server): ~6,800 km fiber route.                                       |
|    • Speed of light in optical fiber = ~200,000 km/s.                                              |
|    • Unavoidable physical round-trip transit time (RTT) = ~68ms - 85ms across submarine cables.     |
|                                                                                                    |
| 2. TLS & Transport Handshake:                                                                      |
|    • DNS lookup + TCP 3-way handshake + TLS 1.3 negotiation = 1 to 2 RTTs on new connections.     |
|    • For persistent HTTP/2 or HTTP/3 sessions, connection reuse mitigates this, but mobile /        |
|      cellular networks re-negotiate connections frequently.                                        |
|                                                                                                    |
| 3. Vercel Serverless Scheduling & Edge Proxy:                                                      |
|    • Edge proxy ingress (`bom1`) -> Serverless function invocation routing = 10ms - 25ms.          |
|    • MicroVM warm dispatch & event-loop queue = 5ms - 15ms.                                        |
|                                                                                                    |
| 4. Cryptographic Authentication (Firebase Admin SDK):                                              |
|    • RSA-256 signature verification over SHA-256 hash using Google public keys = 1.5ms - 4.0ms CPU. |
|    • Public key cache lookups & token claim parsing = 0.5ms - 1.0ms.                               |
|                                                                                                    |
| 5. Database Connection Acquisition & PgBouncer:                                                    |
|    • Connection checkout from PgBouncer transaction pool = 0.5ms - 2.5ms (if not saturated).      |
|    • Co-located internal network ping (AWS EC2 to Supabase in ap-northeast-1) = 1.0ms - 3.0ms.      |
|                                                                                                    |
| 6. PostgreSQL Engine Execution:                                                                    |
|    • Index seek, heap fetch, and relational tuple assembly = 0.2ms - 5.0ms.                        |
|                                                                                                    |
| 7. JSON Serialization & Payload Transfer:                                                          |
|    • Node.js V8 `JSON.stringify()` on 30KB payload = 1.0ms - 3.0ms.                                 |
|    • TCP packet fragmentation and transmission over client bandwidth = 15ms - 45ms.                |
|                                                                                                    |
| PHYSICAL MINIMUM FLOOR (Warm, Co-located Tokyo/India): ~100ms - 160ms End-to-End                   |
| PHYSICAL MINIMUM FLOOR (Localhost workstation):         ~3ms - 8ms End-to-End                     |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. ISOLATING COLD STARTS & CROSS-REGION HOPS FROM WARM STEADY-STATE

A core pitfall in performance analysis is **hiding cold starts and cross-region hops in arithmetic averages**. Doing so distorts both metrics: it makes warm steady-state execution look artificially broken, while masking the true severity of container spin-up penalties.

### Independent Latency Categorization

| Execution State | Definition | Current Measured Latency | Post-Optimization Target | Primary Bottleneck |
| :--- | :--- | :--- | :--- | :--- |
| **Cold Container Spin-up** | First request on an idle Vercel serverless microVM | **1,400ms – 3,250ms** | **600ms – 950ms** | Node.js boot, Express router loading, Prisma client init, Firebase SDK boot |
| **Cross-Region Un-optimized** | Serverless function in US East (`iad1`) querying Tokyo DB | **1,250ms – 2,200ms** | **Eliminated** (Co-located in `hnd1`) | Trans-Pacific RTT (~185ms per query) circling the earth |
| **Warm Steady-State** | Subsequent requests on an existing warm container | **400ms – 900ms** (Current US) | **85ms – 150ms** (Co-located Tokyo) | Network transit from client to Tokyo, DB query execution |
| **Client Cached / Deduplicated** | In-flight request deduplication or SWR cache hit | **0ms – 5ms** | **0ms – 2ms** | Client-side memory lookup; 0 network or DB round trips |

---

## 3. REALISTIC SERVICE LEVEL OBJECTIVES (SLO) TARGETS

Rather than claiming unattainable single-digit numbers, we define **empirically grounded, rigorous target bands** based on endpoint complexity and actual workload requirements.

### Target Performance Bands (P50 and P95)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 TARGET SERVICE LEVEL OBJECTIVES                                  │
├───────────────────────────────┬──────────────────────┬─────────────────────┬─────────────────────┤
│ Endpoint Type                 │ Current Measured P95 │ Target Warm P50     │ Target Warm P95     │
├───────────────────────────────┼──────────────────────┼─────────────────────┼─────────────────────┤
│ 1. Public / Edge Ping         │ 356ms                │ 25ms - 35ms         │ < 50ms              │
│    (e.g. /api/health)         │                      │                     │                     │
├───────────────────────────────┼──────────────────────┼─────────────────────┼─────────────────────┤
│ 2. Simple Reference Query     │ 650ms - 850ms        │ 40ms - 65ms         │ < 90ms              │
│    (e.g. /academic-years)     │                      │                     │                     │
├───────────────────────────────┼──────────────────────┼─────────────────────┼─────────────────────┤
│ 3. Authenticated Single-Entity│ 850ms - 1,200ms      │ 55ms - 80ms         │ < 110ms             │
│    (e.g. /classes/:id/students│                      │                     │                     │
├───────────────────────────────┼──────────────────────┼─────────────────────┼─────────────────────┤
│ 4. Composite Heavy Dashboard  │ 1,850ms - 2,400ms    │ 85ms - 125ms        │ < 175ms             │
│    (e.g. /student/dashboard)  │                      │                     │                     │
├───────────────────────────────┼──────────────────────┼─────────────────────┼─────────────────────┤
│ 5. Mutation with Auth & Sync  │ 900ms - 1,500ms      │ 70ms - 110ms        │ < 150ms             │
│    (e.g. mark attendance)     │                      │                     │                     │
└───────────────────────────────┴──────────────────────┴─────────────────────┴─────────────────────┘
```

---

## 4. PRIORITIZING P95 AND USER-PERCEIVED RESPONSIVENESS OVER P50

### Why P50 is Deceptive
* The **median (P50)** only describes what happens to the luckiest 50% of requests during optimal conditions.
* In reality, a single web page does not make 1 request; it makes **5 to 8 requests** to assemble the view.
* If each individual request has a 90% probability of being fast (P90), the probability that **all 8 requests are fast** is:
  $$P(\text{all fast}) = 0.90^8 \approx 43\%$$
* That means **more than 57% of users experience tail latency (P95/P99)** on initial page load!
* Therefore, optimizing **P95 latency** and **frontend perceived responsiveness** is far more critical than micro-optimizing P50.

### Strategies to Maximize User-Perceived Responsiveness

```
+----------------------------------------------------------------------------------------------------+
|                         PERCEIVED RESPONSIVENESS ARCHITECTURE                                      |
+----------------------------------------------------------------------------------------------------+
| 1. Skeleton Screens & Staggered Rendering:                                                         |
|    • Never block the entire viewport behind a monolithic full-page loading spinner.                |
|    • Render immediate layout skeletons (`StudentAcademicSummary`, `TodayRemindersSkeleton`).      |
|    • The page feels interactive in < 50ms, even if data takes 120ms to populate.                  |
|                                                                                                    |
| 2. In-Flight Request Deduplication:                                                                |
|    • When parent layout (`FacultyLayout`) and child page (`FacultyDashboard`) mount together,     |
|      the second call attaches to the in-flight Promise rather than firing a second HTTP request.   |
|    • Halves server concurrency and eliminates PgBouncer connection queueing.                       |
|                                                                                                    |
| 3. Optimistic UI Updates on Mutations:                                                             |
|    • When marking attendance or updating reminders, update the Redux state immediately in 0ms.    |
|    • Send the background PATCH request asynchronously; roll back only if an error is returned.     |
|    • Eliminates perceived delay completely for daily faculty workflows.                            |
|                                                                                                    |
| 4. Safe Reference Caching:                                                                         |
|    • Academic years, departments, and semesters are cached for 5 minutes in memory.                |
|    • Navigation between `/faculty/classes`, `/faculty/attendance`, and `/faculty/timetable`         |
|      renders instantly from cache without re-fetching static academic structures.                  |
+----------------------------------------------------------------------------------------------------+
```

---

## 5. SUMMARY OF REALISTIC EXPECTATIONS

1. **Local Workstation vs. Cloud:** Endpoints responding in 1.7ms on `localhost:4000` will realistically take **35ms – 120ms** when deployed to cloud serverless infrastructure due to public internet transit, TLS, and submarine fiber propagation between India and Tokyo.
2. **Co-location is the Highest-Leverage Fix:** Moving Vercel functions to Tokyo (`hnd1`) cuts 185ms off *every single database round trip*, turning a 1,400ms dashboard into a ~120ms response.
3. **Database Execution is Already Fast:** PostgreSQL queries take < 1ms; our goal is not to micro-optimize SQL from 0.4ms to 0.2ms, but to **eliminate redundant queries entirely** (from 6 queries down to 1–2).
4. **P95 Certification:** Success will be judged by whether P95 latency across all core endpoints remains **under 180ms** under realistic concurrent traffic ($C = 5, C = 10$).
