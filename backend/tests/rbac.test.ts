import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';

const mockFirebaseAuth = vi.mocked(
  (await import('../src/config/firebase')).firebaseAuth,
);
const mockPrisma = vi.mocked(
  (await import('../src/config/database')).default,
);

// Helper: simulate an authenticated admin user
function mockAuthenticatedAdmin(collegeId = 'college-uuid') {
  mockFirebaseAuth.verifyIdToken.mockResolvedValue({
    uid: 'admin-firebase-uid',
    aud: '', auth_time: 0, exp: 0, iat: 0, iss: '', sub: '',
    firebase: { identities: {}, sign_in_provider: '' },
  });

  mockPrisma.user.findUnique.mockResolvedValue({
    id: 'admin-uuid',
    firebaseUid: 'admin-firebase-uid',
    email: 'admin@test.com',
    phone: null,
    collegeId,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    userRoles: [
      {
        id: 'ur-1',
        userId: 'admin-uuid',
        roleId: 'role-admin',
        assignedAt: new Date(),
        assignedBy: null,
        role: {
          id: 'role-admin',
          name: 'COLLEGE_ADMIN',
          displayName: 'College Admin',
          description: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          permissions: [
            { id: 'rp-1', roleId: 'role-admin', permissionId: 'p-1', createdAt: new Date(), permission: { id: 'p-1', name: 'approvals:read', displayName: 'View Approvals', description: null, module: 'approvals', createdAt: new Date(), updatedAt: new Date() } },
            { id: 'rp-2', roleId: 'role-admin', permissionId: 'p-2', createdAt: new Date(), permission: { id: 'p-2', name: 'approvals:manage', displayName: 'Manage Approvals', description: null, module: 'approvals', createdAt: new Date(), updatedAt: new Date() } },
            { id: 'rp-3', roleId: 'role-admin', permissionId: 'p-3', createdAt: new Date(), permission: { id: 'p-3', name: 'users:read', displayName: 'View Users', description: null, module: 'users', createdAt: new Date(), updatedAt: new Date() } },
          ],
        },
      },
    ],
  } as any);
}

function mockAuthenticatedStudent(collegeId = 'college-uuid') {
  mockFirebaseAuth.verifyIdToken.mockResolvedValue({
    uid: 'student-firebase-uid',
    aud: '', auth_time: 0, exp: 0, iat: 0, iss: '', sub: '',
    firebase: { identities: {}, sign_in_provider: '' },
  });

  mockPrisma.user.findUnique.mockResolvedValue({
    id: 'student-uuid',
    firebaseUid: 'student-firebase-uid',
    email: 'student@test.com',
    phone: null,
    collegeId,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    userRoles: [
      {
        id: 'ur-1',
        userId: 'student-uuid',
        roleId: 'role-student',
        assignedAt: new Date(),
        assignedBy: null,
        role: {
          id: 'role-student',
          name: 'STUDENT',
          displayName: 'Student',
          description: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          permissions: [
            { id: 'rp-1', roleId: 'role-student', permissionId: 'p-1', createdAt: new Date(), permission: { id: 'p-1', name: 'profiles:read', displayName: 'Read Profiles', description: null, module: 'profiles', createdAt: new Date(), updatedAt: new Date() } },
            { id: 'rp-2', roleId: 'role-student', permissionId: 'p-2', createdAt: new Date(), permission: { id: 'p-2', name: 'profiles:write', displayName: 'Write Profiles', description: null, module: 'profiles', createdAt: new Date(), updatedAt: new Date() } },
          ],
        },
      },
    ],
  } as any);
}

describe('RBAC — Role-Based Access Control', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow admin to access admin endpoints', async () => {
    mockAuthenticatedAdmin();
    mockPrisma.user.findMany.mockResolvedValue([]);
    mockPrisma.user.count.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should deny student access to admin endpoints', async () => {
    mockAuthenticatedStudent();

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSION');
  });

  it('should deny student access to approval management', async () => {
    mockAuthenticatedStudent();

    const res = await request(app)
      .get('/api/approvals')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(403);
  });

  it('should allow admin to access approvals', async () => {
    mockAuthenticatedAdmin();
    mockPrisma.accountApproval.findMany.mockResolvedValue([]);
    mockPrisma.accountApproval.count.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/approvals')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Tenant Isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should prevent College A admin from reviewing College B approval', async () => {
    mockAuthenticatedAdmin('college-a-uuid');

    // Approval belongs to College B
    mockPrisma.accountApproval.findUnique.mockResolvedValue({
      id: 'approval-1',
      userId: 'user-1',
      requestedRole: 'FACULTY',
      requestedCollege: 'college-b-uuid',
      status: 'PENDING',
      requestedAt: new Date(),
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null,
      notes: null,
    } as any);

    const res = await request(app)
      .post('/api/approvals/approval-1/review')
      .set('Authorization', 'Bearer valid-token')
      .send({ status: 'APPROVED' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('TENANT_MISMATCH');
  });
});
