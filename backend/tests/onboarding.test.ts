import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';

const mockFirebaseAuth = vi.mocked(
  (await import('../src/config/firebase')).firebaseAuth,
);
const mockPrisma = vi.mocked(
  (await import('../src/config/database')).default,
);

describe('Onboarding — POST /api/auth/onboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject onboarding with invalid college ID', async () => {
    mockFirebaseAuth.verifyIdToken.mockResolvedValue({
      uid: 'new-user-uid',
      aud: '', auth_time: 0, exp: 0, iat: 0, iss: '', sub: '',
      firebase: { identities: {}, sign_in_provider: '' },
    });
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/onboarding')
      .set('Authorization', 'Bearer valid-token')
      .send({
        collegeId: 'not-a-uuid',
        requestedRole: 'STUDENT',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject onboarding with SUPER_ADMIN role', async () => {
    mockFirebaseAuth.verifyIdToken.mockResolvedValue({
      uid: 'new-user-uid',
      aud: '', auth_time: 0, exp: 0, iat: 0, iss: '', sub: '',
      firebase: { identities: {}, sign_in_provider: '' },
    });
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/onboarding')
      .set('Authorization', 'Bearer valid-token')
      .send({
        collegeId: '550e8400-e29b-41d4-a716-446655440000',
        requestedRole: 'SUPER_ADMIN',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject onboarding without authentication', async () => {
    const res = await request(app)
      .post('/api/auth/onboarding')
      .send({
        collegeId: '550e8400-e29b-41d4-a716-446655440000',
        requestedRole: 'STUDENT',
      });

    expect(res.status).toBe(401);
  });

  it('should successfully onboard a student (auto-approved)', async () => {
    const collegeId = '550e8400-e29b-41d4-a716-446655440000';

    mockFirebaseAuth.verifyIdToken.mockResolvedValue({
      uid: 'new-student-uid',
      aud: '', auth_time: 0, exp: 0, iat: 0, iss: '', sub: '',
      firebase: { identities: {}, sign_in_provider: '' },
    });

    // No existing user
    mockPrisma.user.findUnique.mockResolvedValueOnce(null); // auth middleware
    mockPrisma.user.findUnique.mockResolvedValueOnce(null); // firebaseUid check
    mockPrisma.user.findUnique.mockResolvedValueOnce(null); // email check

    mockFirebaseAuth.getUser.mockResolvedValue({
      uid: 'new-student-uid',
      email: 'newstudent@test.com',
    } as any);

    // Valid college
    mockPrisma.college.findUnique.mockResolvedValue({
      id: collegeId,
      name: 'Demo College',
      code: 'DEMO',
      isActive: true,
    } as any);

    // Valid role
    mockPrisma.role.findUnique.mockResolvedValue({
      id: 'role-student',
      name: 'STUDENT',
      isActive: true,
    } as any);

    // Transaction creates
    mockPrisma.user.create.mockResolvedValue({
      id: 'new-user-uuid',
      firebaseUid: 'new-student-uid',
      email: 'newstudent@test.com',
      phone: null,
      collegeId,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    mockPrisma.profile.create.mockResolvedValue({} as any);
    mockPrisma.userRole.create.mockResolvedValue({} as any);
    mockPrisma.auditLog.create.mockResolvedValue({} as any);

    const res = await request(app)
      .post('/api/auth/onboarding')
      .set('Authorization', 'Bearer valid-token')
      .send({
        collegeId,
        requestedRole: 'STUDENT',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.requiresApproval).toBe(false);
  });
});
