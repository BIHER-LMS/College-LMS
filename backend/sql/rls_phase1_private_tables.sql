-- College LMS phase 1: protected tables that have NO direct browser-client callers
-- and NO existing RLS policies. Reviewed against frontend/src on 2026-10-07.
-- See docs/RLS_AUTHORIZATION_DESIGN.md. Do not apply phase 2 while the
-- existing browser still queries colleges/authed_users/academic tables as anon.
-- PostgreSQL owner/server connection bypasses RLS; backend authorization is
-- mandatory. Coordinate with incident response and Supabase owner.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- Audit guard: refuse changes if another actor introduced policies since review.
DO $guard$
DECLARE t text; n int;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    '_prisma_migrations', 'account_approvals', 'attendance_records',
    'attendance_sessions', 'audit_logs', 'class_timetables',
    'faculty_reminders', 'faculty_timetables', 'permissions', 'profiles',
    'role_permissions', 'roles', 'sessions', 'user_roles', 'users'
  ] LOOP
    SELECT count(*) INTO n FROM pg_policies WHERE schemaname='public' AND tablename=t;
    IF n <> 0 THEN RAISE EXCEPTION 'Policy review required for table %', t; END IF;
  END LOOP;
END $guard$;

ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE public._prisma_migrations, public.account_approvals,
  public.attendance_records, public.attendance_sessions, public.audit_logs,
  public.class_timetables, public.faculty_reminders, public.faculty_timetables,
  public.permissions, public.profiles, public.role_permissions, public.roles,
  public.sessions, public.user_roles, public.users
  FROM anon, authenticated, PUBLIC;
COMMIT;
