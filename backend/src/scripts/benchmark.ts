/**
 * College LMS — Automated Reproducible Benchmark Suite
 * Phase 6: Performance Benchmarks
 *
 * Measures:
 *  - Request count, throughput (req/sec)
 *  - p50, p95, p99, min, max latency (monotonic performance.now())
 *  - HTTP error rates
 *  - Response payload sizes
 *  - Server-Timing parsing (backend compute vs db vs network)
 *  - Cold vs Warm invocation latency
 *  - Multi-concurrency runs (C=1, C=5, C=10)
 *
 * Usage:
 *   npx tsx src/scripts/benchmark.ts
 *   TARGET_URL=https://college-lms-2026-ten.vercel.app npx tsx src/scripts/benchmark.ts
 */

import { performance } from 'node:perf_hooks';

interface BenchmarkConfig {
  targetUrl: string;
  iterations: number;
  concurrency: number;
  testToken?: string;
}

interface RequestMetric {
  durationMs: number;
  statusCode: number;
  bytes: number;
  serverTiming?: string | null;
  serverTotalMs?: number;
  serverDbMs?: number;
  serverDbCount?: number;
  error?: string;
}

interface BenchmarkReport {
  endpoint: string;
  targetUrl: string;
  totalRequests: number;
  concurrency: number;
  successCount: number;
  errorCount: number;
  errorRatePercent: number;
  minMs: number;
  maxMs: number;
  meanMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  avgBytes: number;
  throughputReqSec: number;
  coldStartMs?: number;
  avgServerDbMs?: number;
  avgServerDbCount?: number;
}

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:4000';
const TEST_TOKEN = process.env.TEST_TOKEN || '';

function calculatePercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return Math.round(sorted[Math.max(0, Math.min(index, sorted.length - 1))] * 100) / 100;
}

function parseServerTiming(header: string | null): { total?: number; db?: number; dbCount?: number } {
  if (!header) return {};
  const result: { total?: number; db?: number; dbCount?: number } = {};
  const entries = header.split(',');
  for (const entry of entries) {
    const parts = entry.trim().split(';');
    const name = parts[0];
    for (const part of parts.slice(1)) {
      const [k, v] = part.split('=');
      if (k === 'dur') {
        const val = parseFloat(v);
        if (name === 'total') result.total = val;
        if (name === 'db') result.db = val;
      }
      if (k === 'desc' && name === 'db') {
        const match = v?.match(/(\d+)\s*queries/);
        if (match) result.dbCount = parseInt(match[1], 10);
      }
    }
  }
  return result;
}

async function executeRequest(url: string, headers: Record<string, string>): Promise<RequestMetric> {
  const t0 = performance.now();
  try {
    const res = await fetch(url, { headers });
    const buffer = await res.arrayBuffer();
    const durationMs = performance.now() - t0;
    const serverTiming = res.headers.get('server-timing');
    const parsed = parseServerTiming(serverTiming);

    return {
      durationMs,
      statusCode: res.status,
      bytes: buffer.byteLength,
      serverTiming,
      serverTotalMs: parsed.total,
      serverDbMs: parsed.db,
      serverDbCount: parsed.dbCount,
    };
  } catch (err: any) {
    return {
      durationMs: performance.now() - t0,
      statusCode: 0,
      bytes: 0,
      error: err.message,
    };
  }
}

export async function runEndpointBenchmark(
  endpoint: string,
  config: BenchmarkConfig
): Promise<BenchmarkReport> {
  const fullUrl = `${config.targetUrl}${endpoint}`;
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  if (config.testToken) {
    headers['Authorization'] = `Bearer ${config.testToken}`;
  }

  // 1. Cold/First Request
  const coldMetric = await executeRequest(fullUrl, headers);
  const coldStartMs = Math.round(coldMetric.durationMs * 100) / 100;

  // 2. Warm-up (2 iterations)
  await executeRequest(fullUrl, headers);
  await executeRequest(fullUrl, headers);

  // 3. Main Benchmark Run with Concurrency
  const metrics: RequestMetric[] = [];
  const startAll = performance.now();

  const totalToRun = config.iterations;
  let running = 0;
  let index = 0;

  await new Promise<void>((resolve) => {
    function launchNext() {
      while (running < config.concurrency && index < totalToRun) {
        index++;
        running++;
        executeRequest(fullUrl, headers).then((m) => {
          metrics.push(m);
          running--;
          if (metrics.length === totalToRun) {
            resolve();
          } else {
            launchNext();
          }
        });
      }
    }
    launchNext();
  });

  const totalWallTimeSec = (performance.now() - startAll) / 1000;
  const durations = metrics.map((m) => m.durationMs).sort((a, b) => a - b);
  const successCount = metrics.filter((m) => m.statusCode >= 200 && m.statusCode < 400).length;
  const errorCount = metrics.length - successCount;

  const sumDuration = durations.reduce((acc, d) => acc + d, 0);
  const sumBytes = metrics.reduce((acc, m) => acc + m.bytes, 0);

  const serverDbDurations = metrics.map((m) => m.serverDbMs).filter((d): d is number => d !== undefined);
  const serverDbCounts = metrics.map((m) => m.serverDbCount).filter((c): c is number => c !== undefined);

  return {
    endpoint,
    targetUrl: config.targetUrl,
    totalRequests: metrics.length,
    concurrency: config.concurrency,
    successCount,
    errorCount,
    errorRatePercent: Math.round((errorCount / metrics.length) * 10000) / 100,
    minMs: Math.round(durations[0] * 100) / 100,
    maxMs: Math.round(durations[durations.length - 1] * 100) / 100,
    meanMs: Math.round((sumDuration / durations.length) * 100) / 100,
    p50Ms: calculatePercentile(durations, 50),
    p95Ms: calculatePercentile(durations, 95),
    p99Ms: calculatePercentile(durations, 99),
    avgBytes: Math.round(sumBytes / metrics.length),
    throughputReqSec: Math.round((metrics.length / totalWallTimeSec) * 10) / 10,
    coldStartMs,
    avgServerDbMs: serverDbDurations.length ? Math.round((serverDbDurations.reduce((a, b) => a + b, 0) / serverDbDurations.length) * 100) / 100 : undefined,
    avgServerDbCount: serverDbCounts.length ? Math.round(serverDbCounts.reduce((a, b) => a + b, 0) / serverDbCounts.length) : undefined,
  };
}

async function runSuite() {
  console.log(`========================================================================`);
  console.log(`COLLEGE LMS — AUTOMATED BENCHMARK SUITE`);
  console.log(`Target URL: ${TARGET_URL}`);
  console.log(`Time:       ${new Date().toISOString()}`);
  console.log(`========================================================================\n`);

  const testEndpoints = [
    '/api/health',
    '/api/auth/me', // Returns 401 unauthenticated, tests middleware ingress speed
  ];

  const results: BenchmarkReport[] = [];

  for (const endpoint of testEndpoints) {
    console.log(`Benchmarking [${endpoint}] (C=1, 20 requests)...`);
    const reportSeq = await runEndpointBenchmark(endpoint, {
      targetUrl: TARGET_URL,
      iterations: 20,
      concurrency: 1,
      testToken: TEST_TOKEN,
    });
    results.push(reportSeq);

    console.log(`Benchmarking [${endpoint}] (C=5, 20 requests)...`);
    const reportConc5 = await runEndpointBenchmark(endpoint, {
      targetUrl: TARGET_URL,
      iterations: 20,
      concurrency: 5,
      testToken: TEST_TOKEN,
    });
    results.push(reportConc5);

    console.log(`Benchmarking [${endpoint}] (C=10, 20 requests)...`);
    const reportConc10 = await runEndpointBenchmark(endpoint, {
      targetUrl: TARGET_URL,
      iterations: 20,
      concurrency: 10,
      testToken: TEST_TOKEN,
    });
    results.push(reportConc10);
  }

  console.log(`\n========================================================================`);
  console.log(`BENCHMARK RESULTS TABLE`);
  console.log(`========================================================================`);
  console.table(
    results.map((r) => ({
      Endpoint: r.endpoint,
      Conc: r.concurrency,
      TotalReq: r.totalRequests,
      ColdStart: `${r.coldStartMs}ms`,
      p50: `${r.p50Ms}ms`,
      p95: `${r.p95Ms}ms`,
      p99: `${r.p99Ms}ms`,
      MinMax: `${r.minMs} - ${r.maxMs}ms`,
      ErrRate: `${r.errorRatePercent}%`,
      Throughput: `${r.throughputReqSec} req/s`,
      Payload: `${r.avgBytes} B`,
    }))
  );
}

if (process.argv[1]?.endsWith('benchmark.ts')) {
  runSuite().catch(console.error);
}
