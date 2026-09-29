import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';

// Get mocked modules
const mockFirebaseAuth = vi.mocked(
  (await import('../src/config/firebase')).firebaseAuth,
);
const mockPrisma = vi.mocked(
  (await import('../src/config/database')).default,
);

describe('Authentication Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject requests without Authorization header', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should reject requests with invalid Bearer format', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'InvalidFormat');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject expired/invalid Firebase tokens', async () => {
    mockFirebaseAuth.verifyIdToken.mockRejectedValue(
      new Error('Firebase ID token has expired'),
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer expired-token');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should reject users who have not onboarded (for protected routes)', async () => {
    mockFirebaseAuth.verifyIdToken.mockResolvedValue({
      uid: 'firebase-uid-123',
      aud: '',
      auth_time: 0,
      exp: 0,
      iat: 0,
      iss: '',
      sub: '',
      firebase: { identities: {}, sign_in_provider: '' },
    });

    // No user in DB
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should accept valid Firebase token with active user', async () => {
    mockFirebaseAuth.verifyIdToken.mockResolvedValue({
      uid: 'firebase-uid-123',
      aud: '',
      auth_time: 0,
      exp: 0,
      iat: 0,
      iss: '',
      sub: '',
      firebase: { identities: {}, sign_in_provider: '' },
    });

    const mockUser = {
      id: 'user-uuid',
      firebaseUid: 'firebase-uid-123',
      email: 'test@example.com',
      phone: null,
      collegeId: 'college-uuid',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      userRoles: [
        {
          id: 'ur-1',
          userId: 'user-uuid',
          roleId: 'role-1',
          assignedAt: new Date(),
          assignedBy: null,
          role: {
            id: 'role-1',
            name: 'STUDENT',
            displayName: 'Student',
            description: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            permissions: [
              {
                id: 'rp-1',
                roleId: 'role-1',
                permissionId: 'perm-1',
                createdAt: new Date(),
                permission: {
                  id: 'perm-1',
                  name: 'profiles:read',
                  displayName: 'Read Profiles',
                  description: null,
                  module: 'profiles',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              },
            ],
          },
        },
      ],
    };

    // First call in auth middleware
    mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser as any);
    // Second call in getCurrentUser
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      ...mockUser,
      college: { id: 'college-uuid', name: 'Demo College', code: 'DEMO' },
      profile: {
        id: 'profile-uuid',
        userId: 'user-uuid',
        firstName: 'Test',
        lastName: 'User',
        profileCompletionPercentage: 50,
      },
    } as any);

    // For profile completion
    mockPrisma.profile.update.mockResolvedValue({} as any);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('user-uuid');
  });

  it('should reject PENDING accounts', async () => {
    mockFirebaseAuth.verifyIdToken.mockResolvedValue({
      uid: 'firebase-uid-pending',
      aud: '',
      auth_time: 0,
      exp: 0,
      iat: 0,
      iss: '',
      sub: '',
      firebase: { identities: {}, sign_in_provider: '' },
    });

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-uuid',
      firebaseUid: 'firebase-uid-pending',
      email: 'pending@test.com',
      phone: null,
      collegeId: 'college-uuid',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      userRoles: [],
    } as any);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('ACCOUNT_PENDING');
  });
});

describe('Health Check', () => {
  it('should return healthy status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });
});

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
