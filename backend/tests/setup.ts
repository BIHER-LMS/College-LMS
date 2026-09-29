import { vi } from 'vitest';

/**
 * Test setup — mock external dependencies so tests don't need
 * real Firebase credentials or a real database.
 */

// ─── Mock Firebase Admin SDK ─────────────────────────
vi.mock('../src/config/firebase', () => ({
  firebaseAuth: {
    verifyIdToken: vi.fn(),
    getUser: vi.fn(),
  },
  default: {},
}));

// ─── Mock environment variables ──────────────────────
vi.mock('../src/config/env', () => ({
  env: {
    NODE_ENV: 'test',
    PORT: 4000,
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    FIREBASE_PROJECT_ID: 'test-project',
    FIREBASE_CLIENT_EMAIL: 'test@test.iam.gserviceaccount.com',
    FIREBASE_PRIVATE_KEY: 'test-key',
    FRONTEND_URL: 'http://localhost:3000',
    RATE_LIMIT_WINDOW_MS: 900000,
    RATE_LIMIT_MAX_REQUESTS: 100,
    LOG_LEVEL: 'error',
  },
}));

// ─── Mock Prisma Client ──────────────────────────────
vi.mock('../src/config/database', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    profile: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    college: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    role: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    userRole: {
      create: vi.fn(),
    },
    accountApproval: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    session: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    rolePermission: {
      upsert: vi.fn(),
    },
    permission: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: any) => Promise<any>) => fn(mockPrisma)),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  };

  return { default: mockPrisma, prisma: mockPrisma };
});
