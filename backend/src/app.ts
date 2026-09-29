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
import roleRoutes from './modules/roles/role.routes';
import auditRoutes from './modules/audit/audit.routes';

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
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
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

// ─── API Routes ──────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/college-admin', collegeAdminRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/audit', auditRoutes);

// ─── Error Handling ──────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
