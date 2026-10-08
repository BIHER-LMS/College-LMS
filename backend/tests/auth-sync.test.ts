import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app';

const firebaseAuth = vi.mocked((await import('../src/config/firebase')).firebaseAuth);
const prisma = vi.mocked((await import('../src/config/database')).default);
const uid = 'firebase-uid-123';
const email = 'student@example.edu';
const bearer = (body: object) => request(app).post('/api/auth/sync').set('Authorization', 'Bearer valid-token').send(body);
const row = (overrides: Record<string, unknown> = {}) => ({ uid, email, role: 'STUDENT', approval_status: 'ACTIVE', ...overrides });

// The first SQL statement locks all candidate identities; the final one reads
// only the response columns. Intermediate statements represent writes.
function queryWithMatches(matches: object[], result = row()) {
  const query = vi.fn().mockResolvedValueOnce(matches);
  query.mockImplementation((sql: string) => sql.trimStart().startsWith('SELECT') ? Promise.resolve([result]) : Promise.resolve(1));
  prisma.$queryRawUnsafe = query as any;
  return query;
}

describe('POST /api/auth/sync identity binding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firebaseAuth.verifyIdToken.mockResolvedValue({
      uid, email: 'Student@Example.EDU', email_verified: true,
      firebase: { identities: {}, sign_in_provider: 'password' },
    } as any);
    prisma.user.findUnique.mockResolvedValue(null);
    queryWithMatches([]);
  });

  it('requires a valid Firebase token before reading or writing any account', async () => {
    expect((await request(app).post('/api/auth/sync').send({ email })).status).toBe(401);
    firebaseAuth.verifyIdToken.mockRejectedValue(new Error('invalid token'));
    expect((await bearer({ email })).status).toBe(401);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a malformed or missing email before querying accounts', async () => {
    for (const body of [{}, { email: 42 }, { email: ' ' }]) {
      const res = await bearer(body);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    }
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a forged body email even if it belongs to a dummy user', async () => {
    const res = await bearer({ email: 'victim@example.edu' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects an unverified Firebase email and missing email claim', async () => {
    firebaseAuth.verifyIdToken.mockResolvedValue({ uid, email, email_verified: false, firebase: { sign_in_provider: 'password' } } as any);
    expect((await bearer({ email })).status).toBe(403);
    firebaseAuth.verifyIdToken.mockResolvedValue({ uid, email_verified: true, firebase: { sign_in_provider: 'password' } } as any);
    expect((await bearer({ email })).status).toBe(403);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('creates a new USER using the normalized token email and server-owned metadata', async () => {
    const query = queryWithMatches([], row({ email }));
    const res = await bearer({ email: ' Student@Example.EDU ', displayName: 'Student', provider: 'admin', lastLogin: '2001-01-01' });
    expect(res.status).toBe(200);
    expect(query.mock.calls[1][0]).toContain("'USER', 'ACTIVE'");
    expect(query.mock.calls[1][0]).toContain('ON CONFLICT (uid) DO NOTHING');
    expect(query.mock.calls[1][1]).toBe(uid);
    expect(query.mock.calls[1][2]).toBe(email);
    expect(query.mock.calls[1][5]).toBe('password');
    expect(query.mock.calls[1][6]).not.toBe('2001-01-01');
  });

  it('updates only safe metadata for an existing UID with the same verified email', async () => {
    const query = queryWithMatches([row()]);
    const res = await bearer({ email, displayName: 'Student' });
    expect(res.status).toBe(200);
    expect(query.mock.calls[1][0]).toMatch(/UPDATE authed_users/);
    expect(query.mock.calls[1][0]).not.toMatch(/SET email|SET uid|role\s*=/);
    expect(firebaseAuth.getUser).not.toHaveBeenCalled();
  });

  it('rejects retargeting an established UID to another email without deleting either row', async () => {
    const query = queryWithMatches([row({ email: 'other@example.edu' }), row({ uid: 'other-firebase-uid' })]);
    const res = await bearer({ email });
    expect(res.status).toBe(409);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][0]).not.toContain('SELECT *');
  });

  it('rejects an existing UID whose email differs even if no other email row exists', async () => {
    const query = queryWithMatches([row({ email: 'other@example.edu' })]);
    expect((await bearer({ email })).status).toBe(409);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('rejects ambiguous case-insensitive email matches', async () => {
    const query = queryWithMatches([row(), row({ uid: 'another-uid', email: 'STUDENT@example.edu' })]);
    expect((await bearer({ email })).status).toBe(409);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('rejects a token email conflicting with the established legacy user record', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1', firebaseUid: uid, email: 'other@example.edu', status: 'ACTIVE', userRoles: [],
    } as any);
    const res = await bearer({ email });
    expect(res.status).toBe(409);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a race where the UID was concurrently inserted for a different email', async () => {
    const query = queryWithMatches([], row({ email: 'other@example.edu' }));
    expect((await bearer({ email })).status).toBe(409);
    expect(query).toHaveBeenCalledTimes(3);
  });

  it.each([
    ['established Firebase UID', 'another-real-uid', 'STUDENT'],
    ['wrong role for student placeholder', 'std_s001_abcde', 'COLLEGE_ADMIN'],
    ['unrecognized placeholder', 'std_norandom', 'STUDENT'],
  ])('rejects %s even when the email matches', async (_label, dummyUid, role) => {
    const query = queryWithMatches([row({ uid: dummyUid, role })]);
    const res = await bearer({ email });
    expect(res.status).toBe(409);
    expect(query).toHaveBeenCalledTimes(1);
    expect(firebaseAuth.getUser).not.toHaveBeenCalled();
  });

  it('rejects a placeholder UID that exists as a real Firebase account', async () => {
    const query = queryWithMatches([row({ uid: 'std_s001_abcde' })]);
    firebaseAuth.getUser.mockResolvedValue({ uid: 'std_s001_abcde' } as any);
    expect((await bearer({ email })).status).toBe(409);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('rejects a placeholder UID that is already bound to a legacy user', async () => {
    const query = queryWithMatches([row({ uid: 'std_s001_abcde' })]);
    firebaseAuth.getUser.mockRejectedValue({ code: 'auth/user-not-found' });
    prisma.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'legacy-user' } as any);
    expect((await bearer({ email })).status).toBe(409);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('does not assume Firebase lookup failures mean the UID is a placeholder', async () => {
    const query = queryWithMatches([row({ uid: 'std_s001_abcde' })]);
    firebaseAuth.getUser.mockRejectedValue(new Error('Firebase unavailable'));
    expect((await bearer({ email })).status).toBe(500);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it.each([['std_s001_abcde', 'STUDENT'], ['fac_new_abcde', 'FACULTY']])(
    'binds a proven %s placeholder, preserving its role and status', async (dummyUid, role) => {
      const query = queryWithMatches([row({ uid: dummyUid, role })], row({ role, approval_status: 'PENDING' }));
      firebaseAuth.getUser.mockRejectedValue({ code: 'auth/user-not-found' });
      const res = await bearer({ email });
      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe(role);
      expect(res.body.data.approval_status).toBe('PENDING');
      expect(firebaseAuth.getUser).toHaveBeenCalledWith(dummyUid);
      expect(query.mock.calls.some(([sql]) => sql.includes('DELETE FROM authed_users'))).toBe(false);
      expect(query.mock.calls.find(([sql]) => sql.includes('SET uid = $1'))?.[6]).toBe(dummyUid);
    },
  );

  it('does not swallow errors moving timetable references during migration', async () => {
    const query = vi.fn().mockResolvedValueOnce([row({ uid: 'std_s001_abcde' })]).mockRejectedValueOnce(new Error('write failed'));
    prisma.$queryRawUnsafe = query as any;
    firebaseAuth.getUser.mockRejectedValue({ code: 'auth/user-not-found' });
    expect((await bearer({ email })).status).toBe(500);
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('returns only explicitly selected self-facing fields, never the full private row', async () => {
    const query = queryWithMatches([row()], row({ parent_phone: 'private', dob: '2000-01-01' }));
    const res = await bearer({ email });
    expect(res.status).toBe(200);
    expect(res.body.data).not.toHaveProperty('parent_phone');
    expect(res.body.data).not.toHaveProperty('dob');
    const select = query.mock.calls.at(-1)![0];
    expect(select).not.toContain('SELECT *');
    expect(select).not.toContain('parent_phone');
    expect(select).not.toContain('dob');
    expect(select).toContain('approval_status');
    expect(res.body.data.email).toBe(email);
  });
});
