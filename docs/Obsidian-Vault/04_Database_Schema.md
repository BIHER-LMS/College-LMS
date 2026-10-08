# Database Schema

Database is hosted on **Supabase** (PostgreSQL) and managed by **Prisma** (`backend/prisma/schema.prisma`).

## Models (16 total)
- **Tenancy:** `College`
- **Identity & RBAC:** `Role`, `Permission`, `RolePermission`, `User`, `UserRole`, `Profile`, `AuthedUser`, `AccountApproval`, `Session`, `AuditLog`.
- **Academic Entities:** `Department`, `AcademicYear`, `Program`, `Batch`, `Class`, `Semester`, `Subject`.

## Roles (RBAC)
`AccountStatus`: `PENDING`, `ACTIVE`, `REJECTED`, `SUSPENDED`, `DISABLED`
`RoleName`: `STUDENT`, `FACULTY`, `TRAINER`, `HOD`, `TPO`, `COLLEGE_ADMIN`, `SUPERINTENDENT`, `SUPER_ADMIN`

## Prisma Configuration Caution
Vercel serverless connections cannot use the direct IPv6 interface. 
- Use the **IPv4 Pooler URL** (`aws-0-ap-northeast-1.pooler.supabase.com:6543`) with `?pgbouncer=true` for `DATABASE_URL`.
- Use the direct database URL for `DIRECT_URL` (requires a machine with IPv6 support, usually local development machines) for Prisma migrations.
