import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Route modules
import authRoutes from './modules/auth/auth.routes';
import profileRoutes from './modules/profiles/profile.routes';
import approvalRoutes from './modules/approvals/approval.routes';
import userRoutes from './modules/users/user.routes';
import collegeRoutes from './modules/colleges/college.routes';
import collegeAdminRoutes from './modules/college-admin/collegeAdmin.routes';
import facultyRoutes from './modules/faculty/faculty.routes';
import roleRoutes from './modules/roles/role.routes';
import auditRoutes from './modules/audit/audit.routes';
import secureDataRoutes from './modules/secure-data/secureData.routes';
import uploadRoutes from './modules/upload/upload.routes';

const app = express();

// ─── Security Middleware ─────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ─── Rate Limiting ───────────────────────────────────
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.NODE_ENV === 'development' ? 100_000 : env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Disable rate limiting in development mode
    if (env.NODE_ENV === 'development') return true;
    // Health checks do not access account data; auth sync must remain rate limited.
    if (req.path === '/api/health') return true;
    return false;
  },
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later',
    },
  },
});

app.use(limiter);

// ─── Body Parsing ────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Health Check ────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

import studentRoutes from './modules/student/student.routes';

// ─── API Routes ──────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/college-admin', collegeAdminRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/student', studentRoutes);
import hodRoutes from './modules/hod_temp/routes/index';
import announcementRoutes from './modules/announcements/announcement.routes';
app.use('/api', hodRoutes);
app.use('/api', secureDataRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/announcements', announcementRoutes);

// ─── Error Handling ──────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
