# Deployment

The platform is deployed via **Vercel** configured as a multi-service workspace (`vercel.json`).

## Vercel Routing
- `src: "/api/(.*)"` -> `backend/src/server.ts`
- `src: "/(.*)"` -> `frontend/index.html` (React SPA)

## Environment Variables
Ensure these are set in Vercel:
- `DATABASE_URL`: `postgresql://...aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- `DIRECT_URL`: `postgresql://...db.lmnbsauvjqursjxocsgf.supabase.co:5432/postgres`
- `FIREBASE_PROJECT_ID`: `lms-college-5975a`
- `FIREBASE_CLIENT_EMAIL`: Service account email
- `FIREBASE_PRIVATE_KEY`: Service account private key
- `FRONTEND_URL`: Hosted URL domain

*Note: Database connection fails on Vercel unless using the IPv4 pooler in `DATABASE_URL`!*
