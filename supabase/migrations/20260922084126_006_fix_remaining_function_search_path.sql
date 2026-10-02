/*
# Fix remaining SECURITY DEFINER functions — set search_path

## Problem
`find_nearby_cases()` and `get_admin_stats()` are SECURITY DEFINER functions
without a `search_path` set, causing the same "Database error querying schema"
risk as the other functions.

## Fix
Recreate both with `SET search_path = public` so all table references resolve
correctly regardless of the caller's search_path.
*/

CREATE OR REPLACE FUNCTION find_nearby_cases(
  p_lat double precision,
  p_lng double precision,
  p_radius_km integer DEFAULT 10,
  p_case_type text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  case_type text,
  status text,
  person_name text,
  age_min integer,
  age_max integer,
  gender text,
  clothing text,
  description text,
  location_label text,
  found_at timestamptz,
  last_seen_at timestamptz,
  is_child boolean,
  created_at timestamptz,
  distance_km double precision,
  primary_photo_key text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id, c.case_type, c.status, c.person_name, c.age_min, c.age_max,
    c.gender, c.clothing, c.description, c.location_label, c.found_at,
    c.last_seen_at, c.is_child, c.created_at,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(cl.longitude, cl.latitude), 4326)::geography
    ) / 1000.0,
    (SELECT cp.storage_key FROM case_photos cp WHERE cp.case_id = c.id AND cp.is_primary = true AND cp.deleted_at IS NULL LIMIT 1)
  FROM cases c
  JOIN case_locations cl ON cl.case_id = c.id
  WHERE c.status = 'ACTIVE'
    AND (p_case_type IS NULL OR c.case_type = p_case_type)
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(cl.longitude, cl.latitude), 4326)::geography,
      p_radius_km * 1000
    )
  ORDER BY distance_km ASC;
END;
$$;

CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS TABLE(
  active_cases bigint,
  pending_review bigint,
  reported_cases bigint,
  reunited_cases bigint,
  active_users bigint,
  suspended_users bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT count(*) FROM cases WHERE status = 'ACTIVE'),
    (SELECT count(*) FROM cases WHERE status = 'PENDING_REVIEW'),
    (SELECT count(*) FROM reports WHERE status = 'PENDING'),
    (SELECT count(*) FROM cases WHERE status IN ('REUNITED','CLOSED')),
    (SELECT count(*) FROM profiles WHERE status = 'ACTIVE'),
    (SELECT count(*) FROM profiles WHERE status = 'SUSPENDED');
END;
$$;
