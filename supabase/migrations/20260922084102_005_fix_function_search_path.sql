/*
# Fix SECURITY DEFINER functions — set search_path

## Problem
The functions `is_admin_or_moderator()`, `is_admin()`, and `handle_new_user()` are
SECURITY DEFINER but have no `search_path` set (proconfig = null). When Supabase's
auth system calls these during login/signup, the search_path may be empty or
unexpected, causing "Database error querying schema" because the unqualified
`profiles` table reference can't be resolved.

## Fix
Recreate all three functions with `SET search_path = public` so the `profiles`
table reference always resolves correctly regardless of the caller's search_path.

## Functions affected
- `is_admin_or_moderator()` — role check helper used in RLS policies
- `is_admin()` — admin role check helper used in RLS policies
- `handle_new_user()` — trigger function that creates profile on signup
*/

CREATE OR REPLACE FUNCTION is_admin_or_moderator()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
  );
$$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
