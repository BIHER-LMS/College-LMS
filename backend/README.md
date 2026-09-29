# College LMS Backend

**Phase 1 — Authentication & Account Setup**

Backend REST API for the College Learning Management System. This service handles authorization, multi-tenancy, RBAC, profiles, approvals, and session management. Firebase Authentication handles identity verification.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Language | TypeScript (strict mode) |
| Database | Supabase PostgreSQL |
| ORM | Prisma |
| Auth | Firebase Admin SDK |
| Validation | Zod |
| Testing | Vitest + Supertest |
| Containerization | Docker |
| API Docs | OpenAPI 3.0 |

## Architecture

```
Frontend (Firebase Client SDK)
    ↓
Firebase Authentication
    ↓ Firebase ID Token
Express API
    ↓ Firebase Admin SDK verifies token
    ↓ Extract Firebase UID
    ↓ Find/create LMS User
    ↓ Check tenant → Check role → Check permissions
Prisma ORM
    ↓
Supabase PostgreSQL
```

## Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL (or Supabase project)
- Firebase project with Email/Password + Google auth enabled

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your real credentials
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run Migrations

```bash
npx prisma migrate dev --name init
```

### 6. Seed Database

```bash
npm run prisma:seed
```

### 7. Start Development Server

```bash
npm run dev
```

Server starts at `http://localhost:4000`

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/colleges` | List colleges (for onboarding) |
| GET | `/api/colleges/:id` | Get college details |

### Authentication (Firebase token required)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/onboarding` | Register LMS user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Refresh session |
| POST | `/api/auth/password-changed` | Record password change |
| GET | `/api/auth/sessions` | List active sessions |
| DELETE | `/api/auth/sessions/:id` | Revoke session |

### Profiles
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/profiles/me` | Get own profile |
| PUT | `/api/profiles/me` | Update own profile |
| GET | `/api/profiles/me/completion` | Profile completion status |
| GET | `/api/profiles/:userId` | View user profile (requires permission) |

### Approvals (requires `approvals:read` / `approvals:manage`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/approvals` | List approval requests |
| GET | `/api/approvals/:id` | Get approval details |
| POST | `/api/approvals/:id/review` | Approve/reject account |

### Users (requires `users:read` / `users:write`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users` | List users (tenant-scoped) |
| GET | `/api/users/:id` | Get user details |
| PATCH | `/api/users/:id/status` | Update account status |

### Roles (requires `roles:read`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/roles` | List roles with permissions |

### Audit (requires `audit:read`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/audit` | List audit logs |

## Supported Roles

| Role | Self-Assignable | Requires Approval |
|------|:-:|:-:|
| STUDENT | ✅ | ❌ (auto-approved) |
| FACULTY | ✅ | ✅ |
| TRAINER | ✅ | ✅ |
| HOD | ✅ | ✅ |
| TPO | ✅ | ✅ |
| COLLEGE_ADMIN | ✅ | ✅ |
| SUPERINTENDENT | ❌ | N/A (provisioned) |
| SUPER_ADMIN | ❌ | N/A (provisioned) |

## Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `NODE_ENV` | ✅ | `development` / `production` / `test` |
| `PORT` | ✅ | Server port (default: 4000) |
| `DATABASE_URL` | ✅ | Supabase PostgreSQL connection string |
| `FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | ✅ | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | ✅ | Firebase service account private key |
| `FRONTEND_URL` | ✅ | CORS origin (frontend URL) |
| `RATE_LIMIT_WINDOW_MS` | ❌ | Rate limit window (default: 900000) |
| `RATE_LIMIT_MAX_REQUESTS` | ❌ | Max requests per window (default: 100) |
| `LOG_LEVEL` | ❌ | `error` / `warn` / `info` / `debug` |

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Tests use mocked Firebase and Prisma — no real credentials required.

## Docker

```bash
# Build
docker build -t college-lms-backend .

# Run (inject env vars)
docker run -p 4000:4000 \
  -e DATABASE_URL=your_db_url \
  -e FIREBASE_PROJECT_ID=your_project \
  -e FIREBASE_CLIENT_EMAIL=your_email \
  -e FIREBASE_PRIVATE_KEY="your_key" \
  -e FRONTEND_URL=http://localhost:3000 \
  college-lms-backend
```

## Prisma Migrations

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations (production)
npx prisma migrate deploy

# View database in browser
npx prisma studio
```

## Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Email/Password** and **Google** auth providers
3. Enable **Phone Number** verification (optional for OTP)
4. Go to Project Settings → Service Accounts → Generate New Private Key
5. Copy the `project_id`, `client_email`, and `private_key` into `.env`

## Project Structure

```
backend/
├── src/
│   ├── config/           # Environment, Firebase, Prisma client
│   ├── middleware/        # Auth, RBAC, tenant, validation, error
│   ├── modules/
│   │   ├── auth/         # Onboarding, sessions, login/logout
│   │   ├── profiles/     # Profile CRUD, completion
│   │   ├── approvals/    # Account approval workflow
│   │   ├── users/        # User management (admin)
│   │   ├── colleges/     # Tenant CRUD
│   │   ├── roles/        # Role/permission listing
│   │   └── audit/        # Audit log viewing
│   ├── schemas/          # Zod validation schemas
│   ├── services/         # Business logic layer
│   ├── utils/            # Response helpers, logger, errors
│   ├── app.ts            # Express app setup
│   └── server.ts         # Entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── tests/                # Vitest test files
├── openapi.yaml          # API documentation
├── Dockerfile            # Production Docker image
└── .env.example          # Environment template
```

## Known Limitations / Remaining Work

- **File uploads**: Profile photo upload is URL-based; actual file storage (GCS/S3) not yet implemented
- **Email notifications**: No email service for approval notifications yet
- **Advanced search**: User search is basic (LIKE queries); full-text search could be added
- **Pagination cursors**: Offset-based pagination; cursor-based could improve large datasets
- **Firebase token caching**: Each request verifies the token; a short-lived cache could reduce Firebase API calls
- **Role hierarchy**: Roles are flat; a hierarchical role system could simplify permission management
- **Batch operations**: No bulk approve/reject endpoint yet
