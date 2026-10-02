/*
# Recreate demo users with proper auth format

## Problem
Previous seed data used bcrypt cost 6 and empty raw_app_meta_data, causing
"Database error querying schema" on login. Also, auth.identities.email is a
generated column and cannot be inserted directly.

## Fix
Recreate all 7 demo users with:
- bcrypt cost 10 password hashing (GoTrue-compatible)
- raw_app_meta_data with provider info
- Proper auth.identities rows (without inserting email column — it's generated)
- email_confirmed_at set

## Demo Accounts (password: password123)
- demo.user1@example.com through demo.user5@example.com (USER)
- demo.moderator@example.com (MODERATOR)
- demo.admin@example.com (ADMIN)
*/

DO $$
DECLARE
  v_user1 uuid := 'a0000000-0000-4000-8000-000000000001';
  v_user2 uuid := 'a0000000-0000-4000-8000-000000000002';
  v_user3 uuid := 'a0000000-0000-4000-8000-000000000003';
  v_user4 uuid := 'a0000000-0000-4000-8000-000000000004';
  v_user5 uuid := 'a0000000-0000-4000-8000-000000000005';
  v_mod uuid := 'a0000000-0000-4000-8000-000000000006';
  v_admin uuid := 'a0000000-0000-4000-8000-000000000007';
BEGIN
  -- Insert auth.users with bcrypt cost 10 and proper metadata
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, last_sign_in_at,
    is_sso_user, is_anonymous
  )
  VALUES
    (v_user1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo.user1@example.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Demo User 1"}'::jsonb, now(), now(), null, false, false),
    (v_user2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo.user2@example.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Demo User 2"}'::jsonb, now(), now(), null, false, false),
    (v_user3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo.user3@example.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Demo User 3"}'::jsonb, now(), now(), null, false, false),
    (v_user4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo.user4@example.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Demo User 4"}'::jsonb, now(), now(), null, false, false),
    (v_user5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo.user5@example.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Demo User 5"}'::jsonb, now(), now(), null, false, false),
    (v_mod, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo.moderator@example.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Demo Moderator"}'::jsonb, now(), now(), null, false, false),
    (v_admin, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo.admin@example.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Demo Admin"}'::jsonb, now(), now(), null, false, false)
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    raw_app_meta_data = EXCLUDED.raw_app_meta_data,
    email_confirmed_at = EXCLUDED.email_confirmed_at;

  -- Insert identities (email column is generated, don't insert it)
  INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
  SELECT gen_random_uuid(), id, id::text, 'email', jsonb_build_object('sub', id::text, 'email', email), null, now(), now()
  FROM auth.users
  WHERE id IN (v_user1, v_user2, v_user3, v_user4, v_user5, v_mod, v_admin)
  ON CONFLICT DO NOTHING;

  -- Insert profiles with roles
  INSERT INTO profiles (id, email, full_name, role, status) VALUES
    (v_user1, 'demo.user1@example.com', 'Demo User 1', 'USER', 'ACTIVE'),
    (v_user2, 'demo.user2@example.com', 'Demo User 2', 'USER', 'ACTIVE'),
    (v_user3, 'demo.user3@example.com', 'Demo User 3', 'USER', 'ACTIVE'),
    (v_user4, 'demo.user4@example.com', 'Demo User 4', 'USER', 'ACTIVE'),
    (v_user5, 'demo.user5@example.com', 'Demo User 5', 'USER', 'ACTIVE'),
    (v_mod, 'demo.moderator@example.com', 'Demo Moderator', 'MODERATOR', 'ACTIVE'),
    (v_admin, 'demo.admin@example.com', 'Demo Admin', 'ADMIN', 'ACTIVE')
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, full_name = EXCLUDED.full_name;
END $$;

-- Cases, locations, matches, notifications, reports, audit logs
DO $$
DECLARE
  v_user1 uuid := 'a0000000-0000-4000-8000-000000000001';
  v_user2 uuid := 'a0000000-0000-4000-8000-000000000002';
  v_user3 uuid := 'a0000000-0000-4000-8000-000000000003';
  v_user4 uuid := 'a0000000-0000-4000-8000-000000000004';
  v_user5 uuid := 'a0000000-0000-4000-8000-000000000005';
  v_mod uuid := 'a0000000-0000-4000-8000-000000000006';
  v_admin uuid := 'a0000000-0000-4000-8000-000000000007';
  v_case1 uuid := 'b0000000-0000-4000-8000-000000000001';
  v_case2 uuid := 'b0000000-0000-4000-8000-000000000002';
  v_case3 uuid := 'b0000000-0000-4000-8000-000000000003';
  v_case4 uuid := 'b0000000-0000-4000-8000-000000000004';
  v_case5 uuid := 'b0000000-0000-4000-8000-000000000005';
  v_case6 uuid := 'b0000000-0000-4000-8000-000000000006';
  v_case7 uuid := 'b0000000-0000-4000-8000-000000000007';
  v_case8 uuid := 'b0000000-0000-4000-8000-000000000008';
BEGIN
  -- Missing cases (3)
  INSERT INTO cases (id, case_type, status, created_by, person_name, age_min, age_max, gender, clothing, description, location_visibility, location_label, last_seen_at, is_child, police_reference, additional_info) VALUES
    (v_case1, 'MISSING', 'ACTIVE', v_user1, 'Raj Kumar', 65, 70, 'MALE', 'White shirt, blue dhoti', 'Elderly man with white hair, walks with a limp. Last seen near Salem bus stand. May be confused about his surroundings.', 'LAST_KNOWN', 'Near Salem New Bus Stand', now() - interval '2 days', false, 'FIR/2024/00123', 'Has dementia, may not remember his address'),
    (v_case2, 'MISSING', 'ACTIVE', v_user2, 'Lakshmi Devi', 60, 65, 'FEMALE', 'Green saree with gold border', 'Elderly woman, short stature, greying hair. Speaks Tamil. Last seen near the market area.', 'LAST_KNOWN', 'Near Salem Market', now() - interval '1 day', false, null, null),
    (v_case3, 'MISSING', 'ACTIVE', v_user3, 'Arjun', 8, 10, 'MALE', 'Red t-shirt, blue shorts', 'Young boy, short hair. Last seen near the school. May have wandered off.', 'LAST_KNOWN', 'Near Salem School Area', now() - interval '6 hours', true, 'FIR/2024/00456', 'Child has autism and may not respond to strangers')
  ON CONFLICT (id) DO NOTHING;

  -- Found cases (5)
  INSERT INTO cases (id, case_type, status, created_by, person_name, age_min, age_max, gender, clothing, description, location_visibility, location_label, found_at, is_child) VALUES
    (v_case4, 'FOUND', 'ACTIVE', v_user4, null, 65, 70, 'MALE', 'White shirt, blue dhoti', 'Elderly man found near the bus stand. Appears confused, speaks Tamil. Walks with a limp.', 'FOUND_LOCATION', 'Near Salem New Bus Stand', now() - interval '1 day', false),
    (v_case5, 'FOUND', 'ACTIVE', v_user5, null, 60, 65, 'FEMALE', 'Green saree', 'Elderly woman found near the market. Short stature, greying hair. Speaks Tamil.', 'FOUND_LOCATION', 'Near Salem Market', now() - interval '12 hours', false),
    (v_case6, 'FOUND', 'ACTIVE', v_user4, null, 30, 40, 'MALE', 'Brown jacket, jeans', 'Man found sitting near the railway station. Appears disoriented but responsive.', 'FOUND_LOCATION', 'Near Salem Railway Station', now() - interval '3 hours', false),
    (v_case7, 'FOUND', 'ACTIVE', v_user5, null, 70, 80, 'FEMALE', 'Pink salwar kameez', 'Elderly woman found near the hospital. Does not speak, appears to have difficulty hearing.', 'FOUND_LOCATION', 'Near Salem Hospital', now() - interval '5 hours', false),
    (v_case8, 'FOUND', 'PENDING_REVIEW', v_user2, null, 8, 10, 'MALE', 'Red t-shirt, blue shorts', 'Young boy found near the school area. Not speaking, may have autism.', 'FOUND_LOCATION', 'Near Salem School Area', now() - interval '1 hour', true)
  ON CONFLICT (id) DO NOTHING;

  -- Case locations
  INSERT INTO case_locations (case_id, latitude, longitude, location_type) VALUES
    (v_case1, 11.6643, 78.1460, 'LAST_KNOWN'),
    (v_case2, 11.6520, 78.1520, 'LAST_KNOWN'),
    (v_case3, 11.6700, 78.1400, 'LAST_KNOWN'),
    (v_case4, 11.6650, 78.1470, 'FOUND_LOCATION'),
    (v_case5, 11.6530, 78.1530, 'FOUND_LOCATION'),
    (v_case6, 11.6600, 78.1380, 'FOUND_LOCATION'),
    (v_case7, 11.6680, 78.1450, 'FOUND_LOCATION'),
    (v_case8, 11.6710, 78.1410, 'FOUND_LOCATION')
  ON CONFLICT DO NOTHING;

  -- Potential matches (3)
  INSERT INTO case_matches (id, found_case_id, missing_case_id, status, distance_km, age_similarity_score, gender_match, description_similarity_score, clothing_similarity_score, time_proximity_score, overall_score) VALUES
    ('c0000000-0000-4000-8000-000000000001', v_case4, v_case1, 'POTENTIAL', 0.3, 95, true, 85, 90, 80, 87),
    ('c0000000-0000-4000-8000-000000000002', v_case5, v_case2, 'POTENTIAL', 0.5, 95, true, 80, 85, 75, 83),
    ('c0000000-0000-4000-8000-000000000003', v_case8, v_case3, 'POTENTIAL', 0.2, 100, true, 90, 95, 70, 88)
  ON CONFLICT (id) DO NOTHING;

  -- Notifications (5)
  INSERT INTO notifications (user_id, type, title, body, is_read) VALUES
    (v_user1, 'POTENTIAL_MATCH', 'Potential match found', 'A found person near your search area may match your missing person report.', false),
    (v_user2, 'POTENTIAL_MATCH', 'Potential match found', 'A found person near the market area may match your report.', false),
    (v_user1, 'NEARBY_FOUND', 'New found person nearby', 'A new found person was reported near Salem Bus Stand.', true),
    (v_user3, 'CASE_UPDATE', 'Your case has been approved', 'Your missing person report for Arjun is now active.', true),
    (v_user4, 'NEARBY_FOUND', 'New found person nearby', 'A new found person was reported near Salem Railway Station.', false)
  ON CONFLICT DO NOTHING;

  -- Reports (2)
  INSERT INTO reports (case_id, reported_by, reason, description, status) VALUES
    (v_case6, v_user1, 'PRIVACY_CONCERN', 'The description contains too much identifying information about the location.', 'PENDING'),
    (v_case7, v_user2, 'INAPPROPRIATE_IMAGE', 'The photo may not be appropriate for public viewing.', 'PENDING')
  ON CONFLICT DO NOTHING;

  -- Audit logs
  INSERT INTO audit_logs (actor_id, action, entity_type, entity_id) VALUES
    (v_mod, 'CASE_APPROVED', 'case', v_case1),
    (v_mod, 'CASE_APPROVED', 'case', v_case2),
    (v_mod, 'CASE_APPROVED', 'case', v_case3),
    (v_mod, 'CASE_APPROVED', 'case', v_case4),
    (v_mod, 'CASE_APPROVED', 'case', v_case5),
    (v_admin, 'USER_CREATED_CASE', 'case', v_case6)
  ON CONFLICT DO NOTHING;
END $$;
