-- College LMS phase 2: the 9 tables that were browser-dependent (colleges, authed_users,
-- departments, programs, batches, classes, subjects, academic_years, semesters).
-- All direct PostgREST callers have been replaced by /api/secure-data/* and /api/public/*.
-- This migration ENABLES RLS and revokes anon/authenticated/PUBLIC grants.
-- The backend (postgres owner) bypasses RLS; policies here only guard against
-- accidental anon/key reuse. Public discovery uses /api/public/* (service role).
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- Audit guard: refuse if any policy already exists on these tables.
DO $guard$
DECLARE t text; n int;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'colleges', 'authed_users', 'departments', 'programs',
    'batches', 'classes', 'subjects', 'academic_years', 'semesters'
  ] LOOP
    SELECT count(*) INTO n FROM pg_policies WHERE schemaname='public' AND tablename=t;
    IF n <> 0 THEN RAISE EXCEPTION 'Policy review required for table %', t; END IF;
  END LOOP;
END $guard$;

-- Enable RLS
ALTER TABLE public.colleges           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authed_users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters          ENABLE ROW LEVEL SECURITY;

-- Revoke all privileges from anon, authenticated, PUBLIC
REVOKE ALL PRIVILEGES ON TABLE public.colleges, public.authed_users,
  public.departments, public.programs, public.batches, public.classes,
  public.subjects, public.academic_years, public.semesters
  FROM anon, authenticated, PUBLIC;

-- Deny all access to anon role explicitly (defense in depth)
CREATE POLICY "deny_anon_all_colleges"           ON public.colleges           FOR ALL TO anon           USING (false) WITH CHECK (false);
CREATE POLICY "deny_anon_all_authed_users"       ON public.authed_users       FOR ALL TO anon           USING (false) WITH CHECK (false);
CREATE POLICY "deny_anon_all_departments"        ON public.departments        FOR ALL TO anon           USING (false) WITH CHECK (false);
CREATE POLICY "deny_anon_all_programs"           ON public.programs           FOR ALL TO anon           USING (false) WITH CHECK (false);
CREATE POLICY "deny_anon_all_batches"            ON public.batches            FOR ALL TO anon           USING (false) WITH CHECK (false);
CREATE POLICY "deny_anon_all_classes"            ON public.classes            FOR ALL TO anon           USING (false) WITH CHECK (false);
CREATE POLICY "deny_anon_all_subjects"           ON public.subjects           FOR ALL TO anon           USING (false) WITH CHECK (false);
CREATE POLICY "deny_anon_all_academic_years"     ON public.academic_years     FOR ALL TO anon           USING (false) WITH CHECK (false);
CREATE POLICY "deny_anon_all_semesters"          ON public.semesters          FOR ALL TO anon           USING (false) WITH CHECK (false);

-- Deny all access to authenticated role explicitly (frontend must use backend)
CREATE POLICY "deny_auth_all_colleges"           ON public.colleges           FOR ALL TO authenticated  USING (false) WITH CHECK (false);
CREATE POLICY "deny_auth_all_authed_users"       ON public.authed_users       FOR ALL TO authenticated  USING (false) WITH CHECK (false);
CREATE POLICY "deny_auth_all_departments"        ON public.departments        FOR ALL TO authenticated  USING (false) WITH CHECK (false);
CREATE POLICY "deny_auth_all_programs"           ON public.programs           FOR ALL TO authenticated  USING (false) WITH CHECK (false);
CREATE POLICY "deny_auth_all_batches"            ON public.batches            FOR ALL TO authenticated  USING (false) WITH CHECK (false);
CREATE POLICY "deny_auth_all_classes"            ON public.classes            FOR ALL TO authenticated  USING (false) WITH CHECK (false);
CREATE POLICY "deny_auth_all_subjects"           ON public.subjects           FOR ALL TO authenticated  USING (false) WITH CHECK (false);
CREATE POLICY "deny_auth_all_academic_years"     ON public.academic_years     FOR ALL TO authenticated  USING (false) WITH CHECK (false);
CREATE POLICY "deny_auth_all_semesters"          ON public.semesters          FOR ALL TO authenticated  USING (false) WITH CHECK (false);

COMMIT;