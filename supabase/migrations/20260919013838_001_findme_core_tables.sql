/*
# Find Me - Core Tables (Part 1)

Creates all tables and indexes first, before any RLS policies that reference other tables.
Tables: profiles, cases, case_locations, case_photos, case_matches, notifications,
conversations, conversation_participants, messages, reports, audit_logs, consents.
Also enables PostGIS extension.
*/

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  role text NOT NULL DEFAULT 'USER' CHECK (role IN ('USER','MODERATOR','ADMIN','SUPER_ADMIN')),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED')),
  avatar_url text,
  preferred_language text DEFAULT 'en' CHECK (preferred_language IN ('en','ta','hi')),
  default_radius_km int NOT NULL DEFAULT 10 CHECK (default_radius_km IN (2,5,10,25,50)),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ CASES ============
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_type text NOT NULL CHECK (case_type IN ('FOUND','MISSING')),
  status text NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (status IN ('DRAFT','PENDING_REVIEW','ACTIVE','MATCHED','VERIFICATION','REUNITED','CLOSED','REJECTED','REMOVED')),
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  person_name text,
  age_min int CHECK (age_min >= 0 AND age_min <= 150),
  age_max int CHECK (age_max >= 0 AND age_max <= 150),
  gender text CHECK (gender IN ('MALE','FEMALE','OTHER','UNKNOWN')),
  clothing text,
  description text,
  location_visibility text NOT NULL DEFAULT 'APPROXIMATE_PUBLIC' CHECK (location_visibility IN ('EXACT_INTERNAL','APPROXIMATE_PUBLIC','LAST_KNOWN','FOUND_LOCATION')),
  location_label text,
  found_at timestamptz,
  last_seen_at timestamptz,
  is_child boolean NOT NULL DEFAULT false,
  police_reference text,
  additional_info text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

-- ============ CASE LOCATIONS ============
CREATE TABLE IF NOT EXISTS case_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  accuracy_m int,
  location_type text NOT NULL CHECK (location_type IN ('EXACT_INTERNAL','APPROXIMATE_PUBLIC','LAST_KNOWN','FOUND_LOCATION')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ CASE PHOTOS ============
CREATE TABLE IF NOT EXISTS case_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  storage_key text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- ============ CASE MATCHES ============
CREATE TABLE IF NOT EXISTS case_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  found_case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  missing_case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'POTENTIAL' CHECK (status IN ('POTENTIAL','CONFIRMED','REJECTED')),
  distance_km double precision,
  age_similarity_score int,
  gender_match boolean,
  description_similarity_score int,
  clothing_similarity_score int,
  time_proximity_score int,
  overall_score int NOT NULL DEFAULT 0,
  confirmed_by uuid REFERENCES profiles(id),
  rejected_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('NEARBY_FOUND','POTENTIAL_MATCH','CASE_UPDATE','CHAT_MESSAGE','CASE_CLOSED','ADMIN_MESSAGE')),
  title text NOT NULL,
  body text,
  data jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ CONVERSATIONS ============
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ CONVERSATION PARTICIPANTS ============
CREATE TABLE IF NOT EXISTS conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- ============ MESSAGES ============
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ REPORTS ============
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  reported_by uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN ('FAKE_CASE','WRONG_PERSON','HARASSMENT','PRIVACY_CONCERN','INAPPROPRIATE_IMAGE','SCAM','OTHER')),
  description text,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','REVIEWING','RESOLVED','DISMISSED')),
  resolved_by uuid REFERENCES profiles(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ AUDIT LOGS ============
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb,
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ CONSENTS ============
CREATE TABLE IF NOT EXISTS consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  consent_text text NOT NULL,
  agreed boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_type ON cases(case_type);
CREATE INDEX IF NOT EXISTS idx_cases_created_by ON cases(created_by);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_locations_case_id ON case_locations(case_id);
CREATE INDEX IF NOT EXISTS idx_case_locations_geo ON case_locations USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));
CREATE INDEX IF NOT EXISTS idx_case_photos_case_id ON case_photos(case_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_id);

-- ============ ENABLE RLS ON ALL TABLES ============
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

-- ============ STORAGE BUCKET ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-photos', 'case-photos', true)
ON CONFLICT (id) DO NOTHING;
