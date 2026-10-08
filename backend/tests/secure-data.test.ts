import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../src/config/firebase', () => ({ firebaseAuth: { verifyIdToken: vi.fn() } }));
vi.mock('../src/config/database', () => {
  const method = () => ({ findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), count: vi.fn(), update: vi.fn(), updateMany: vi.fn(), create: vi.fn(), delete: vi.fn() });
  const db = { authedUser: method(), user: method(), college: method(), department: method(), program: method(), batch: method(), class: method(), subject: method(), accountApproval: method(), academicYear: method(), userRole: method(), role: method(), auditLog: method(), $queryRaw: vi.fn(), $transaction: vi.fn() };
  return { default: db };
});
import router from '../src/modules/secure-data/secureData.routes';
import prisma from '../src/config/database';
import { firebaseAuth } from '../src/config/firebase';
const db = prisma as any;
const verify = vi.mocked(firebaseAuth.verifyIdToken);
const app = express();
app.use(express.json());
app.use('/api', router);
app.use((err: any, _req: any, res: any, _next: any) => res.status(err.statusCode || 500).json({ error: { code: err.code || 'INTERNAL_ERROR' } }));
const token = (verb: 'get' | 'post' | 'patch' | 'delete', path: string) => request(app)[verb](path).set('Authorization', 'Bearer firebase-id-token');
const approved = (role = 'COLLEGE_ADMIN', extras = {}) => ({ uid: 'real-uid', email: 'verified@example.com', role, approval_status: 'APPROVED', college_id: 'college-a', department_id: null, class_id: null, ...extras });

beforeEach(() => {
  vi.clearAllMocks();
  verify.mockResolvedValue({ uid: 'real-uid', email: 'verified@example.com', email_verified: true } as any);
  db.authedUser.findUnique.mockResolvedValue(approved());
  db.user.findUnique.mockResolvedValue(null);
  db.college.findFirst.mockResolvedValue({ id: 'college-a' });
  db.department.findFirst.mockResolvedValue({ id: 'dept-a', college_id: 'college-a', is_active: true });
  db.department.findMany.mockResolvedValue([]);
  db.$transaction.mockImplementation((fn: any) => fn(db));
  db.$queryRaw.mockResolvedValue([{ id: 'college-a' }]);
});

describe('secure-data BFF', () => {
  it('public discovery exposes only active ID/name/code and no user data', async () => {
    db.college.findMany.mockResolvedValue([{ id: 'college-a', name: 'A', code: 'A' }]);
    expect((await request(app).get('/api/public/colleges')).body.data).toEqual([{ id: 'college-a', name: 'A', code: 'A' }]);
    expect(db.college.findMany.mock.calls[0][0]).toMatchObject({ where: { isActive: true }, select: { id: true, name: true, code: true } });
  });
  it('rejects missing, fake and unverified tokens without any dev bypass', async () => {
    expect((await request(app).get('/api/secure-data/me').set('x-dev-uid', 'real-uid')).status).toBe(401);
    verify.mockRejectedValue(new Error('bad signature'));
    expect((await token('get', '/api/secure-data/colleges')).status).toBe(401);
    expect(db.authedUser.findUnique).not.toHaveBeenCalled();
  });
  it('allows pending verified users only their own status, never protected lists', async () => {
    db.authedUser.findUnique.mockResolvedValue(approved('USER', { approval_status: 'PENDING' }));
    expect((await token('get', '/api/secure-data/me')).body.data).toMatchObject({ uid: 'real-uid', approval_status: 'PENDING' });
    expect((await token('get', '/api/secure-data/users?role=HOD')).status).toBe(403);
  });
  it('rejects token/email mismatch, rejected accounts and disagreeing legacy roles', async () => {
    db.authedUser.findUnique.mockResolvedValue(approved('COLLEGE_ADMIN', { email: 'other@example.com' }));
    expect((await token('get', '/api/secure-data/me')).status).toBe(401);
    db.authedUser.findUnique.mockResolvedValue(approved('COLLEGE_ADMIN', { approval_status: 'REJECTED' }));
    expect((await token('get', '/api/secure-data/stats')).status).toBe(403);
    db.authedUser.findUnique.mockResolvedValue(approved());
    db.user.findUnique.mockResolvedValue({ email: 'verified@example.com', status: 'ACTIVE', collegeId: 'college-a', userRoles: [{ role: { name: 'SUPER_ADMIN', isActive: true } }] });
    expect((await token('get', '/api/secure-data/stats')).status).toBe(403);
  });
  it('rejects foreign parent ids and forbidden parent transfers, despite caller college_id', async () => {
    db.department.findFirst.mockResolvedValue(null);
    expect((await token('get', '/api/secure-data/structure/programs?parentId=00000000-0000-4000-8000-000000000001')).status).toBe(404);
    expect(db.program.findMany).not.toHaveBeenCalled();
    expect((await token('post', '/api/secure-data/structure/programs?parentId=00000000-0000-4000-8000-000000000001').send({ name: 'BSc', type: 'UG', duration_years: 3, department_id: 'foreign' })).status).toBe(400);
    expect(db.program.create).not.toHaveBeenCalled();
    expect((await token('patch', '/api/secure-data/structure/programs/00000000-0000-4000-8000-000000000001').send({ department_id: 'foreign' })).status).toBe(400);
  });
  it('creates structure under a checked parent in the authenticated tenant', async () => {
    const parentId = '00000000-0000-4000-8000-000000000001';
    db.program.create.mockResolvedValue({ id: 'program-a', department_id: parentId, name: 'BSc' });
    const response = await token('post', `/api/secure-data/structure/programs?parentId=${parentId}`).send({ name: 'BSc', type: 'UG', duration_years: 3 });
    expect(response.status).toBe(201);
    expect(db.department.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ college_id: 'college-a', id: parentId }) }));
    expect(db.program.create.mock.calls[0][0].data).toMatchObject({ department_id: parentId, name: 'BSc' });
  });
  it('denies hard deletion of classes with possible attendance history', async () => {
    db.class.findFirst.mockResolvedValue({ id: '00000000-0000-4000-8000-000000000001' });
    expect((await token('delete', '/api/secure-data/structure/classes/00000000-0000-4000-8000-000000000001')).status).toBe(409);
    expect(db.class.delete).not.toHaveBeenCalled();
  });
  it('limits students to their own enrolled class and denies admin writes', async () => {
    const classId = '00000000-0000-4000-8000-000000000001';
    db.authedUser.findUnique.mockResolvedValue(approved('STUDENT', { department_id: 'dept-a', class_id: classId }));
    db.class.findFirst.mockResolvedValue({ id: classId });
    db.batch.findFirst.mockResolvedValue({ program: { department_id: 'dept-a' } });
    db.class.findMany.mockResolvedValue([{ id: classId }]);
    expect((await token('get', '/api/secure-data/structure/classes?parentId=00000000-0000-4000-8000-000000000002')).status).toBe(200);
    expect(db.class.findMany.mock.calls[0][0].where).toMatchObject({ id: classId });
    expect((await token('post', '/api/secure-data/structure/subjects?parentId=dept-a').send({ name: 'X', code: 'X', semester_number: 1 })).status).toBe(403);
  });
  it('rejects a foreign department on user assignment even with a valid college admin', async () => {
    db.authedUser.findFirst.mockResolvedValue(approved('FACULTY', { uid: 'faculty', department_id: 'dept-a' }));
    db.department.findFirst.mockResolvedValue(null);
    expect((await token('patch', '/api/secure-data/users/faculty').send({ department_id: '00000000-0000-4000-8000-000000000003' })).status).toBe(404);
    expect(db.authedUser.updateMany).not.toHaveBeenCalled();
  });
  it('refuses cascading tenant deletion when there are any members', async () => {
    db.authedUser.findUnique.mockResolvedValue(approved('SUPER_ADMIN', { college_id: null }));
    db.college.findUnique.mockResolvedValue({ id: 'college-a' });
    db.department.count.mockResolvedValue(0);
    db.authedUser.count.mockResolvedValue(1);
    db.user.count.mockResolvedValue(0);
    db.accountApproval.count.mockResolvedValue(0);
    db.academicYear.count.mockResolvedValue(0);
    expect((await token('delete', '/api/secure-data/colleges/college-a')).status).toBe(409);
    expect(db.college.delete).not.toHaveBeenCalled();
  });
  it('reviews a matching tenant request atomically and records a server-side audit', async () => {
    db.authedUser.findUnique.mockImplementation(({ where }: any) => where.uid === 'real-uid' ? approved() : approved('USER', { uid: 'other', department_id: 'dept-a', requested_role: 'FACULTY', approval_status: 'PENDING' }));
    db.authedUser.updateMany.mockResolvedValue({ count: 1 });
    db.user.findUnique.mockResolvedValue(null);
    const response = await token('post', '/api/secure-data/approvals/other').send({ decision: 'APPROVED' });
    expect(response.status).toBe(200);
    expect(db.authedUser.updateMany.mock.calls[0][0]).toMatchObject({ where: { uid: 'other', role: 'USER', approval_status: 'PENDING', college_id: 'college-a', requested_role: 'FACULTY' }, data: { role: 'FACULTY', approval_status: 'APPROVED' } });
    expect(db.auditLog.create.mock.calls[0][0].data).toMatchObject({ action: 'ACCOUNT_APPROVED', collegeId: 'college-a', metadata: { reviewerUid: 'real-uid', subjectUid: 'other' } });
  });
  it('limits reviewers to requested role and tenant; rejects self-review and non-pending transitions', async () => {
    db.authedUser.findUnique.mockImplementation(({ where }: any) => where.uid === 'real-uid' ? approved() : approved('USER', { uid: 'other', college_id: 'foreign', requested_role: 'FACULTY', approval_status: 'PENDING' }));
    expect((await token('post', '/api/secure-data/approvals/other').send({ decision: 'APPROVED' })).status).toBe(404);
    expect(db.authedUser.updateMany).not.toHaveBeenCalled();
  });
});
