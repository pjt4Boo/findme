/*
# Find Me - RLS Policies, Triggers, and Functions (Part 2)

Applies all Row Level Security policies, trigger functions, status validation,
and helper functions for nearby search and approximate location display.

## Security Model
- profiles: users see own profile; admins see all
- cases: public read for ACTIVE; owner/admin full access
- case_locations: exact coords hidden from non-owners; approximate visible
- case_photos: public read for active cases; owner manages
- case_matches: only related case owners and admins
- notifications: owner-only
- conversations/messages: participants-only
- reports: reporter + admins
- audit_logs: admin-only
- consents: owner-only
*/

-- ============ PROFILES POLICIES ============
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
CREATE POLICY "profiles_select_own_or_admin" ON profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('MODERATOR','ADMIN','SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "profiles_insert_self" ON profiles;
CREATE POLICY "profiles_insert_self" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============ CASES POLICIES ============
DROP POLICY IF EXISTS "cases_select_public_active" ON cases;
CREATE POLICY "cases_select_public_active" ON cases
  FOR SELECT TO anon, authenticated
  USING (
    status = 'ACTIVE'
    OR created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('MODERATOR','ADMIN','SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "cases_insert_authenticated" ON cases;
CREATE POLICY "cases_insert_authenticated" ON cases
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "cases_update_owner_or_admin" ON cases;
CREATE POLICY "cases_update_owner_or_admin" ON cases
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('MODERATOR','ADMIN','SUPER_ADMIN'))
  )
  WITH CHECK (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('MODERATOR','ADMIN','SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "cases_delete_owner_or_admin" ON cases;
CREATE POLICY "cases_delete_owner_or_admin" ON cases
  FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','SUPER_ADMIN'))
  );

-- ============ CASE LOCATIONS POLICIES ============
DROP POLICY IF EXISTS "case_locations_select_restricted" ON case_locations;
CREATE POLICY "case_locations_select_restricted" ON case_locations
  FOR SELECT TO anon, authenticated
  USING (
    location_type != 'EXACT_INTERNAL'
    OR EXISTS (SELECT 1 FROM cases c WHERE c.id = case_locations.case_id AND c.created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('MODERATOR','ADMIN','SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "case_locations_insert_case_owner" ON case_locations;
CREATE POLICY "case_locations_insert_case_owner" ON case_locations
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM cases c WHERE c.id = case_id AND c.created_by = auth.uid()));

DROP POLICY IF EXISTS "case_locations_update_case_owner" ON case_locations;
CREATE POLICY "case_locations_update_case_owner" ON case_locations
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM cases c WHERE c.id = case_id AND c.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM cases c WHERE c.id = case_id AND c.created_by = auth.uid()));

DROP POLICY IF EXISTS "case_locations_delete_case_owner" ON case_locations;
CREATE POLICY "case_locations_delete_case_owner" ON case_locations
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM cases c WHERE c.id = case_id AND c.created_by = auth.uid()));

-- ============ CASE PHOTOS POLICIES ============
DROP POLICY IF EXISTS "case_photos_select_public" ON case_photos;
CREATE POLICY "case_photos_select_public" ON case_photos
  FOR SELECT TO anon, authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (SELECT 1 FROM cases c WHERE c.id = case_photos.case_id AND (c.status = 'ACTIVE' OR c.created_by = auth.uid()))
  );

DROP POLICY IF EXISTS "case_photos_insert_case_owner" ON case_photos;
CREATE POLICY "case_photos_insert_case_owner" ON case_photos
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM cases c WHERE c.id = case_id AND c.created_by = auth.uid()));

DROP POLICY IF EXISTS "case_photos_update_case_owner" ON case_photos;
CREATE POLICY "case_photos_update_case_owner" ON case_photos
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM cases c WHERE c.id = case_id AND c.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM cases c WHERE c.id = case_id AND c.created_by = auth.uid()));

DROP POLICY IF EXISTS "case_photos_delete_case_owner" ON case_photos;
CREATE POLICY "case_photos_delete_case_owner" ON case_photos
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM cases c WHERE c.id = case_id AND c.created_by = auth.uid()));

-- ============ CASE MATCHES POLICIES ============
DROP POLICY IF EXISTS "case_matches_select_related" ON case_matches;
CREATE POLICY "case_matches_select_related" ON case_matches
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM cases c WHERE c.id = found_case_id AND c.created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM cases c WHERE c.id = missing_case_id AND c.created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('MODERATOR','ADMIN','SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "case_matches_insert_owner" ON case_matches;
CREATE POLICY "case_matches_insert_owner" ON case_matches
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM cases c WHERE c.id = found_case_id AND c.created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM cases c WHERE c.id = missing_case_id AND c.created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('MODERATOR','ADMIN','SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "case_matches_update_related" ON case_matches;
CREATE POLICY "case_matches_update_related" ON case_matches
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM cases c WHERE c.id = found_case_id AND c.created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM cases c WHERE c.id = missing_case_id AND c.created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('MODERATOR','ADMIN','SUPER_ADMIN'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM cases c WHERE c.id = found_case_id AND c.created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM cases c WHERE c.id = missing_case_id AND c.created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('MODERATOR','ADMIN','SUPER_ADMIN'))
  );

-- ============ NOTIFICATIONS POLICIES ============
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_own_or_system" ON notifications;
CREATE POLICY "notifications_insert_own_or_system" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============ CONVERSATIONS POLICIES ============
DROP POLICY IF EXISTS "conversations_select_participant" ON conversations;
CREATE POLICY "conversations_select_participant" ON conversations
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()));

DROP POLICY IF EXISTS "conversations_insert_authenticated" ON conversations;
CREATE POLICY "conversations_insert_authenticated" ON conversations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "conversations_update_participant" ON conversations;
CREATE POLICY "conversations_update_participant" ON conversations
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()));

-- ============ CONVERSATION PARTICIPANTS POLICIES ============
DROP POLICY IF EXISTS "conv_participants_select_member" ON conversation_participants;
CREATE POLICY "conv_participants_select_member" ON conversation_participants
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM conversation_participants cp2 WHERE cp2.conversation_id = conversation_participants.conversation_id AND cp2.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "conv_participants_insert_conv_owner" ON conversation_participants;
CREATE POLICY "conv_participants_insert_conv_owner" ON conversation_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND c.created_by = auth.uid())
  );

-- ============ MESSAGES POLICIES ============
DROP POLICY IF EXISTS "messages_select_participant" ON messages;
CREATE POLICY "messages_select_participant" ON messages
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()));

DROP POLICY IF EXISTS "messages_insert_participant" ON messages;
CREATE POLICY "messages_insert_participant" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid())
  );

-- ============ REPORTS POLICIES ============
DROP POLICY IF EXISTS "reports_select_own_or_admin" ON reports;
CREATE POLICY "reports_select_own_or_admin" ON reports
  FOR SELECT TO authenticated
  USING (
    reported_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('MODERATOR','ADMIN','SUPER_ADMIN'))
  );

DROP POLICY IF EXISTS "reports_insert_authenticated" ON reports;
CREATE POLICY "reports_insert_authenticated" ON reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reported_by);

DROP POLICY IF EXISTS "reports_update_admin" ON reports;
CREATE POLICY "reports_update_admin" ON reports
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('MODERATOR','ADMIN','SUPER_ADMIN')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('MODERATOR','ADMIN','SUPER_ADMIN')));

-- ============ AUDIT LOGS POLICIES ============
DROP POLICY IF EXISTS "audit_logs_select_admin" ON audit_logs;
CREATE POLICY "audit_logs_select_admin" ON audit_logs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('ADMIN','SUPER_ADMIN')));

DROP POLICY IF EXISTS "audit_logs_insert_authenticated" ON audit_logs;
CREATE POLICY "audit_logs_insert_authenticated" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id OR actor_id IS NULL);

-- ============ CONSENTS POLICIES ============
DROP POLICY IF EXISTS "consents_select_own" ON consents;
CREATE POLICY "consents_select_own" ON consents
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "consents_insert_own" ON consents;
CREATE POLICY "consents_insert_own" ON consents
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============ STORAGE POLICIES ============
DROP POLICY IF EXISTS "case_photos_bucket_read" ON storage.objects;
CREATE POLICY "case_photos_bucket_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'case-photos');

DROP POLICY IF EXISTS "case_photos_bucket_insert" ON storage.objects;
CREATE POLICY "case_photos_bucket_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'case-photos');

DROP POLICY IF EXISTS "case_photos_bucket_update" ON storage.objects;
CREATE POLICY "case_photos_bucket_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'case-photos');

DROP POLICY IF EXISTS "case_photos_bucket_delete" ON storage.objects;
CREATE POLICY "case_photos_bucket_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'case-photos');

-- ============ TRIGGERS: updated_at ============
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated ON profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_cases_updated ON cases;
CREATE TRIGGER trg_cases_updated BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_case_matches_updated ON case_matches;
CREATE TRIGGER trg_case_matches_updated BEFORE UPDATE ON case_matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_conversations_updated ON conversations;
CREATE TRIGGER trg_conversations_updated BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_reports_updated ON reports;
CREATE TRIGGER trg_reports_updated BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============ CASE STATUS VALIDATION ============
CREATE OR REPLACE FUNCTION validate_case_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT (
      (OLD.status = 'DRAFT' AND NEW.status IN ('PENDING_REVIEW','REMOVED'))
      OR (OLD.status = 'PENDING_REVIEW' AND NEW.status IN ('ACTIVE','REJECTED','REMOVED'))
      OR (OLD.status = 'ACTIVE' AND NEW.status IN ('MATCHED','VERIFICATION','REUNITED','CLOSED','REMOVED'))
      OR (OLD.status = 'MATCHED' AND NEW.status IN ('VERIFICATION','ACTIVE','REUNITED','CLOSED','REMOVED'))
      OR (OLD.status = 'VERIFICATION' AND NEW.status IN ('REUNITED','ACTIVE','CLOSED','REMOVED'))
      OR (OLD.status = 'REUNITED' AND NEW.status IN ('CLOSED','REMOVED'))
      OR (OLD.status = 'CLOSED' AND NEW.status = 'REMOVED')
      OR (OLD.status = 'REJECTED' AND NEW.status = 'REMOVED')
    ) THEN
      RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
    END IF;
  END IF;

  IF NEW.status IN ('REUNITED','CLOSED','REMOVED') AND NEW.closed_at IS NULL THEN
    NEW.closed_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_case_status_validation ON cases;
CREATE TRIGGER trg_case_status_validation BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION validate_case_status_transition();

-- ============ HELPER: AUTO-CREATE PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============ HELPER: NEARBY CASES SEARCH ============
CREATE OR REPLACE FUNCTION find_nearby_cases(
  p_lat double precision,
  p_lng double precision,
  p_radius_km int DEFAULT 10,
  p_case_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  case_type text,
  status text,
  person_name text,
  age_min int,
  age_max int,
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
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============ HELPER: ADMIN DASHBOARD STATS ============
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS TABLE (
  active_cases bigint,
  pending_review bigint,
  reported_cases bigint,
  reunited_cases bigint,
  active_users bigint,
  suspended_users bigint
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
