import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

vi.mock('../src/config/database', () => ({
  default: {
    authedUser: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));
vi.mock('../src/modules/hod_temp/config/firebase', () => ({ verifyFirebaseIdToken: vi.fn() }));
vi.mock('../src/modules/hod_temp/config/db', () => ({
  prisma: {
    authedUser: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
    department: { findMany: vi.fn(), findUnique: vi.fn() },
  },
}));

import { firebaseAuth } from '../src/config/firebase';
import facultyPrisma from '../src/config/database';
import { facultyAuthMiddleware, requireFaculty } from '../src/modules/faculty/faculty.middleware';
import { prisma as hodPrisma } from '../src/modules/hod_temp/config/db';
import { verifyFirebaseIdToken } from '../src/modules/hod_temp/config/firebase';
import { requireAuth, requireHOD, type AuthenticatedRequest } from '../src/modules/hod_temp/middleware/authMiddleware';

const faculty = facultyPrisma as any;
const hod = hodPrisma as any;
const verifyFaculty = vi.mocked(firebaseAuth.verifyIdToken);
const verifyHod = vi.mocked(verifyFirebaseIdToken);
const collegeId = 'college-a';
const departmentId = 'dept-a';
const activeUser = (role: string) => ({
  uid: 'verified-uid', email: 'stored@example.com', role, approval_status: 'APPROVED',
  college_id: collegeId, department_id: departmentId,
});
const department = { id: departmentId, college_id: collegeId, hod_uid: 'verified-uid', is_active: true };

function request(token?: string): AuthenticatedRequest {
  return { headers: token ? { authorization: `Bearer ${token}` } : {} } as AuthenticatedRequest;
}
function response() {
  const res = { status: vi.fn(), json: vi.fn() } as unknown as Response;
  vi.mocked(res.status).mockReturnValue(res);
  return res;
}
const next = () => vi.fn() as NextFunction;

const originalEnv = process.env.NODE_ENV;
beforeEach(() => {
  process.env.NODE_ENV = 'production';
  vi.clearAllMocks();
  verifyFaculty.mockResolvedValue({ uid: 'verified-uid', email: 'verified@example.com' } as any);
  verifyHod.mockResolvedValue({ uid: 'verified-uid', email: 'verified@example.com' } as any);
  faculty.authedUser.findUnique.mockResolvedValue({ ...activeUser('FACULTY'), department });
  faculty.user.findUnique.mockResolvedValue(null);
  hod.authedUser.findUnique.mockResolvedValue(activeUser('HOD'));
  hod.user.findUnique.mockResolvedValue(null);
  hod.department.findUnique.mockResolvedValue(department);
  hod.department.findMany.mockResolvedValue([department]);
});
afterEach(() => { process.env.NODE_ENV = originalEnv; });

describe('faculty Firebase authentication', () => {
  it.each(['dev-user-verified-uid', 'verified-uid', 'unsigned.payload.signature'])('rejects unverified bearer %s', async (token) => {
    verifyFaculty.mockRejectedValue(new Error('Invalid signature'));
    const req = request(token);
    const res = response();
    const done = next();
    await facultyAuthMiddleware(req, res, done);
    expect(verifyFaculty).toHaveBeenCalledWith(token);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(done).not.toHaveBeenCalled();
    expect(faculty.authedUser.findUnique).not.toHaveBeenCalled();
  });

  it('does not accept dev headers, missing tokens, or an empty verified UID', async () => {
    const req = request();
    req.headers['x-dev-uid'] = 'verified-uid';
    const res = response();
    await facultyAuthMiddleware(req, res, next());
    expect(res.status).toHaveBeenCalledWith(401);
    expect(verifyFaculty).not.toHaveBeenCalled();
    verifyFaculty.mockResolvedValue({ uid: '' } as any);
    await facultyAuthMiddleware(request('token'), res, next());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('accepts only an approved, assigned faculty account bound to the verified UID', async () => {
    const req = request('valid-firebase-token');
    const res = response();
    const done = next();
    await facultyAuthMiddleware(req, res, done);
    expect(faculty.authedUser.findUnique).toHaveBeenCalledWith({ where: { uid: 'verified-uid' }, include: { department: true } });
    expect(req.facultyUser).toMatchObject({ uid: 'verified-uid', email: 'verified@example.com', role: 'FACULTY', college_id: collegeId, department_id: departmentId });
    expect(done).toHaveBeenCalledOnce();
    requireFaculty(req as Request, res, done);
    expect(done).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['missing user', null],
    ['pending', { ...activeUser('FACULTY'), approval_status: 'PENDING', department }],
    ['rejected', { ...activeUser('FACULTY'), approval_status: 'REJECTED', department }],
    ['suspended', { ...activeUser('FACULTY'), approval_status: 'SUSPENDED', department }],
    ['missing college', { ...activeUser('FACULTY'), college_id: null, department }],
    ['missing department', { ...activeUser('FACULTY'), department_id: null, department: null }],
    ['foreign department', { ...activeUser('FACULTY'), department: { ...department, college_id: 'college-b' } }],
    ['inactive department', { ...activeUser('FACULTY'), department: { ...department, is_active: false } }],
  ])('denies %s without a fabricated scope', async (_label, user) => {
    faculty.authedUser.findUnique.mockResolvedValue(user);
    const req = request('token');
    const res = response();
    const done = next();
    await facultyAuthMiddleware(req, res, done);
    expect(res.status).toHaveBeenCalledWith(user ? 403 : 401);
    expect(done).not.toHaveBeenCalled();
    expect(req.facultyUser).toBeUndefined();
  });

  it('reconciles a matching active legacy account but denies suspended or conflicting roles', async () => {
    faculty.user.findUnique.mockResolvedValue({ status: 'ACTIVE', collegeId, userRoles: [{ role: { name: 'FACULTY', isActive: true } }] });
    const res = response();
    const done = next();
    await facultyAuthMiddleware(request('token'), res, done);
    expect(done).toHaveBeenCalledOnce();
    faculty.user.findUnique.mockResolvedValue({ status: 'SUSPENDED', collegeId, userRoles: [{ role: { name: 'FACULTY', isActive: true } }] });
    await facultyAuthMiddleware(request('token'), res, done);
    expect(res.status).toHaveBeenCalledWith(403);
    faculty.user.findUnique.mockResolvedValue({ status: 'ACTIVE', collegeId, userRoles: [{ role: { name: 'HOD', isActive: true } }] });
    await facultyAuthMiddleware(request('token'), res, done);
    expect(done).toHaveBeenCalledOnce();
  });

  it('fails closed when the account lookup errors', async () => {
    faculty.user.findUnique.mockRejectedValue(new Error('offline'));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = response();
    await facultyAuthMiddleware(request('token'), res, next());
    expect(res.status).toHaveBeenCalledWith(500);
    log.mockRestore();
  });

  it('does not bypass role restrictions in development', () => {
    process.env.NODE_ENV = 'development';
    const req = request();
    req.facultyUser = { uid: 'verified-uid', email: 'test@example.com', role: 'STUDENT', department_id: departmentId, college_id: collegeId };
    const res = response();
    const done = next();
    requireFaculty(req as Request, res, done);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(done).not.toHaveBeenCalled();
  });
});

describe('HOD Firebase authentication and department assignment', () => {
  it('rejects missing tokens and verified responses with no UID', async () => {
    const done = next();
    await requireAuth(request(), response(), done);
    expect(done).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    expect(verifyHod).not.toHaveBeenCalled();
    verifyHod.mockResolvedValue({ uid: '' } as any);
    await requireAuth(request('token'), response(), done);
    expect(done).toHaveBeenCalledTimes(2);
    expect(hod.authedUser.findUnique).not.toHaveBeenCalled();
  });

  it.each(['dev-user-verified-uid', 'verified-uid', 'unsigned.payload.signature'])('rejects unverified bearer %s, even if another token format might pass', async (token) => {
    verifyHod.mockRejectedValue(new Error('Invalid signature'));
    const done = next();
    await requireAuth(request(token), response(), done);
    expect(verifyHod).toHaveBeenCalledWith(token);
    expect(done).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    expect(hod.authedUser.findUnique).not.toHaveBeenCalled();
  });

  it('looks up only the verified UID, not an email or raw token', async () => {
    hod.authedUser.findUnique.mockResolvedValue(null);
    const done = next();
    await requireAuth(request('token'), response(), done);
    expect(hod.authedUser.findUnique).toHaveBeenCalledWith({ where: { uid: 'verified-uid' } });
    expect(done).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it.each(['PENDING', 'REJECTED', 'SUSPENDED', null])('denies approval status %s', async (approval_status) => {
    hod.authedUser.findUnique.mockResolvedValue({ ...activeUser('HOD'), approval_status });
    const done = next();
    await requireAuth(request('token'), response(), done);
    expect(done).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  it('accepts an ACTIVE HOD with a matching active legacy account', async () => {
    hod.authedUser.findUnique.mockResolvedValue({ ...activeUser('HOD'), approval_status: 'ACTIVE' });
    hod.user.findUnique.mockResolvedValue({ status: 'ACTIVE', collegeId, userRoles: [{ role: { name: 'HOD', isActive: true } }] });
    const req = request('token');
    const done = next();
    await requireAuth(req, response(), done);
    await requireHOD(req, response(), done);
    expect(req.hod?.departmentId).toBe(departmentId);
    expect(done).toHaveBeenCalledTimes(2);
  });

  it('accepts an approved HOD assigned a department in their college', async () => {
    const req = request('token');
    const done = next();
    await requireAuth(req, response(), done);
    expect(req.user).toMatchObject({ uid: 'verified-uid', email: 'verified@example.com', collegeId });
    await requireHOD(req, response(), done);
    expect(req.hod?.departmentId).toBe(departmentId);
    expect(done).toHaveBeenCalledTimes(2);
  });

  it('uses a matching hod_uid if there is no explicit department; never picks the first department', async () => {
    const req = request('token');
    hod.authedUser.findUnique.mockResolvedValue({ ...activeUser('HOD'), department_id: null });
    const done = next();
    await requireAuth(req, response(), done);
    await requireHOD(req, response(), done);
    expect(hod.department.findMany).toHaveBeenCalledWith({ where: { hod_uid: 'verified-uid', college_id: collegeId }, take: 2 });
    expect(req.hod?.departmentId).toBe(departmentId);
    hod.department.findMany.mockResolvedValue([]);
    const req2 = request('token');
    await requireAuth(req2, response(), next());
    const denied = next();
    await requireHOD(req2, response(), denied);
    expect(denied).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    expect(req2.hod).toBeUndefined();
    hod.department.findMany.mockResolvedValue([department, { ...department, id: 'another-dept' }]);
    const ambiguous = request('token');
    await requireAuth(ambiguous, response(), next());
    await requireHOD(ambiguous, response(), denied);
    expect(denied).toHaveBeenCalledTimes(2);
    expect(ambiguous.hod).toBeUndefined();
  });

  it('does not infer a department for an admin with no explicit assignment', async () => {
    hod.authedUser.findUnique.mockResolvedValue({ ...activeUser('COLLEGE_ADMIN'), department_id: null });
    const req = request('token');
    await requireAuth(req, response(), next());
    const denied = next();
    await requireHOD(req, response(), denied);
    expect(hod.department.findMany).not.toHaveBeenCalled();
    expect(denied).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  it('denies a foreign department even when returned for an explicit ID or hod_uid', async () => {
    hod.department.findUnique.mockResolvedValue({ ...department, college_id: 'college-b' });
    const req = request('token');
    await requireAuth(req, response(), next());
    const denied = next();
    await requireHOD(req, response(), denied);
    expect(denied).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    hod.authedUser.findUnique.mockResolvedValue({ ...activeUser('HOD'), department_id: null });
    hod.department.findMany.mockResolvedValue([{ ...department, college_id: 'college-b' }]);
    const req2 = request('token');
    await requireAuth(req2, response(), next());
    await requireHOD(req2, response(), denied);
    expect(denied).toHaveBeenCalledTimes(2);
  });

  it('denies missing college and conflicting legacy status or roles', async () => {
    hod.authedUser.findUnique.mockResolvedValue({ ...activeUser('HOD'), college_id: null });
    const denied = next();
    await requireAuth(request('token'), response(), denied);
    expect(denied).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    hod.authedUser.findUnique.mockResolvedValue(activeUser('HOD'));
    hod.user.findUnique.mockResolvedValue({ status: 'ACTIVE', collegeId, userRoles: [{ role: { name: 'FACULTY', isActive: true } }] });
    await requireAuth(request('token'), response(), denied);
    expect(denied).toHaveBeenCalledTimes(2);
    hod.user.findUnique.mockResolvedValue({ status: 'SUSPENDED', collegeId, userRoles: [{ role: { name: 'HOD', isActive: true } }] });
    await requireAuth(request('token'), response(), denied);
    expect(denied).toHaveBeenCalledTimes(3);
  });
});
