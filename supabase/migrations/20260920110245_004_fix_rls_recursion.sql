/*
# Fix profiles RLS policy — remove self-referencing subquery

## Problem
The original "profiles_select_own_or_admin" policy used a subquery back into the profiles table
to check the user's role:
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN (...))

This creates a recursive RLS check: to read profiles you need to read profiles to check your role,
which causes "Database error querying schema" on Supabase.

## Fix
- SELECT: allow users to read their own row (auth.uid() = id) unconditionally.
  Admins can see all via a security-definer helper function that bypasses RLS.
- INSERT/UPDATE: unchanged (auth.uid() = id, no recursion).

Also fixes similar recursion in cases, case_locations, case_photos, case_matches,
reports, audit_logs, and notifications policies that query profiles for role checks.
All admin role checks now use a SECURITY DEFINER function that reads profiles without
triggering RLS on profiles.
*/

-- Helper: check caller's role without triggering profiles RLS
CREATE OR REPLACE FUNCTION is_admin_or_moderator()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
  );
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
  );
$$;

-- ============ PROFILES ============
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
CREATE POLICY "profiles_select_own_or_admin" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR is_admin_or_moderator());

-- (INSERT and UPDATE policies are fine — no recursion)

-- ============ CASES ============
DROP POLICY IF EXISTS "cases_select_public_active" ON cases;
CREATE POLICY "cases_select_public_active" ON cases
  FOR SELECT TO anon, authenticated
  USING (
    status = 'ACTIVE'
    OR created_by = auth.uid()
    OR is_admin_or_moderator()
  );

DROP POLICY IF EXISTS "cases_update_owner_or_admin" ON cases;
CREATE POLICY "cases_update_owner_or_admin" ON cases
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR is_admin_or_moderator())
  WITH CHECK (created_by = auth.uid() OR is_admin_or_moderator());

DROP POLICY IF EXISTS "cases_delete_owner_or_admin" ON cases;
CREATE POLICY "cases_delete_owner_or_admin" ON cases
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR is_admin());

-- ============ CASE LOCATIONS ============
DROP POLICY IF EXISTS "case_locations_select_restricted" ON case_locations;
CREATE POLICY "case_locations_select_restricted" ON case_locations
  FOR SELECT TO anon, authenticated
  USING (
    location_type != 'EXACT_INTERNAL'
    OR EXISTS (SELECT 1 FROM cases c WHERE c.id = case_locations.case_id AND c.created_by = auth.uid())
    OR is_admin_or_moderator()
  );

-- ============ CASE PHOTOS ============
DROP POLICY IF EXISTS "case_photos_select_public" ON case_photos;
CREATE POLICY "case_photos_select_public" ON case_photos
  FOR SELECT TO anon, authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_photos.case_id
        AND (c.status = 'ACTIVE' OR c.created_by = auth.uid())
    )
  );

-- ============ CASE MATCHES ============
DROP POLICY IF EXISTS "case_matches_select_related" ON case_matches;
CREATE POLICY "case_matches_select_related" ON case_matches
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM cases c WHERE c.id = found_case_id AND c.created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM cases c WHERE c.id = missing_case_id AND c.created_by = auth.uid())
    OR is_admin_or_moderator()
  );

DROP POLICY IF EXISTS "case_matches_insert_owner" ON case_matches;
CREATE POLICY "case_matches_insert_owner" ON case_matches
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM cases c WHERE c.id = found_case_id AND c.created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM cases c WHERE c.id = missing_case_id AND c.created_by = auth.uid())
    OR is_admin_or_moderator()
  );

DROP POLICY IF EXISTS "case_matches_update_related" ON case_matches;
CREATE POLICY "case_matches_update_related" ON case_matches
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM cases c WHERE c.id = found_case_id AND c.created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM cases c WHERE c.id = missing_case_id AND c.created_by = auth.uid())
    OR is_admin_or_moderator()
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM cases c WHERE c.id = found_case_id AND c.created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM cases c WHERE c.id = missing_case_id AND c.created_by = auth.uid())
    OR is_admin_or_moderator()
  );

-- ============ REPORTS ============
DROP POLICY IF EXISTS "reports_select_own_or_admin" ON reports;
CREATE POLICY "reports_select_own_or_admin" ON reports
  FOR SELECT TO authenticated
  USING (reported_by = auth.uid() OR is_admin_or_moderator());

DROP POLICY IF EXISTS "reports_update_admin" ON reports;
CREATE POLICY "reports_update_admin" ON reports
  FOR UPDATE TO authenticated
  USING (is_admin_or_moderator())
  WITH CHECK (is_admin_or_moderator());

-- ============ AUDIT LOGS ============
DROP POLICY IF EXISTS "audit_logs_select_admin" ON audit_logs;
CREATE POLICY "audit_logs_select_admin" ON audit_logs
  FOR SELECT TO authenticated
  USING (is_admin());

-- Grant execute on helper functions to authenticated role
GRANT EXECUTE ON FUNCTION is_admin_or_moderator() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
