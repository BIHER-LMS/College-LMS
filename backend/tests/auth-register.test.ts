import request from 'supertest';
import app from '../src/app';
import { firebaseAuth } from '../src/config/firebase';
import prisma from '../src/config/database';

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects registration with invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: 'Password123!',
        phone: '9876543210',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects registration with short password (< 8 chars)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'newuser@college.edu',
        password: 'short',
        phone: '9876543210',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects registration with phone number shorter than 10 digits', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'newuser@college.edu',
        password: 'ValidPassword123!',
        phone: '12345',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects registration when email already exists in authed_users', async () => {
    (prisma.authedUser.findFirst as any).mockResolvedValue({
      uid: 'existing-uid',
      email: 'existing@college.edu',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'existing@college.edu',
        password: 'ValidPassword123!',
        phone: '9876543210',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('creates user in Firebase and saves shadow record in PostgreSQL', async () => {
    (prisma.authedUser.findFirst as any).mockResolvedValue(null);
    (firebaseAuth.getUserByEmail as any).mockRejectedValue({ code: 'auth/user-not-found' });
    (firebaseAuth.createUser as any).mockResolvedValue({
      uid: 'new-firebase-uid-123',
      email: 'student.new@college.edu',
      phoneNumber: '+919876543210',
    });
    (prisma.authedUser.upsert as any).mockResolvedValue({
      uid: 'new-firebase-uid-123',
      email: 'student.new@college.edu',
      phone: '+919876543210',
      role: 'USER',
      approval_status: 'PENDING',
    });
    (prisma.user.upsert as any).mockResolvedValue({
      id: 'user-id-123',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'student.new@college.edu',
        password: 'SecurePassword123!',
        phone: '9876543210',
        displayName: 'New Student',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.uid).toBe('new-firebase-uid-123');
    expect(res.body.data.email).toBe('student.new@college.edu');
    expect(firebaseAuth.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'student.new@college.edu',
        password: 'SecurePassword123!',
        phoneNumber: '+919876543210',
        emailVerified: true,
      }),
    );
  });

  it('falls back to Firebase REST API if Admin SDK service account key throws invalid_grant', async () => {
    (prisma.authedUser.findFirst as any).mockResolvedValue(null);
    (firebaseAuth.getUserByEmail as any).mockRejectedValue(
      new Error('Error fetching access token: invalid_grant (Invalid grant: account not found)'),
    );
    (firebaseAuth.createUser as any).mockRejectedValue(
      new Error('Error fetching access token: invalid_grant (Invalid grant: account not found)'),
    );
    (prisma.authedUser.upsert as any).mockResolvedValue({
      uid: 'rest-fallback-uid-456',
      email: 'student.fallback@college.edu',
      phone: '+919876543210',
      role: 'USER',
      approval_status: 'PENDING',
    });
    (prisma.user.upsert as any).mockResolvedValue({ id: 'user-id-456' });

    // Mock global fetch for this test
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('accounts:signUp')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              localId: 'rest-fallback-uid-456',
              email: 'student.fallback@college.edu',
              idToken: 'mock-id-token',
            }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as any;

    try {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'student.fallback@college.edu',
          password: 'SecurePassword123!',
          phone: '9876543210',
          displayName: 'Fallback Student',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.uid).toBe('rest-fallback-uid-456');
      expect(res.body.data.email).toBe('student.fallback@college.edu');
    } finally {
      global.fetch = originalFetch;
    }
  });
});

