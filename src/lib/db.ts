import type { Profile, Case, CaseLocation, CasePhoto, CaseMatch, Notification, Conversation, ConversationParticipant, Message, Report, AuditLog, Consent, NearbyCaseResult, AdminStats } from '@/types';

// ============ MongoDB-style document store backed by IndexedDB ============
// MongoDB's native driver only runs on Node.js. This gives the same
// document-model semantics (collections of flexible JSON documents)
// working entirely in the browser with no server.

const DB_NAME = 'findme-mongo';
const DB_VERSION = 1;

export type Doc = Record<string, unknown> & { _id?: string };

const COLLECTIONS = [
  'profiles',
  'cases',
  'case_locations',
  'case_photos',
  'case_matches',
  'notifications',
  'conversations',
  'conversation_participants',
  'messages',
  'reports',
  'audit_logs',
  'consents',
  'photo_blobs',
] as const;

let dbInstance: IDBDatabase | null = null;

export async function getDb(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const col of COLLECTIONS) {
        if (!db.objectStoreNames.contains(col)) {
          db.createObjectStore(col, { keyPath: '_id' });
        }
      }
    };
    req.onsuccess = () => {
      dbInstance = req.result;
      seedData(dbInstance!).then(() => resolve(dbInstance!));
    };
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(db: IDBDatabase, store: string, mode: IDBTransactionMode): IDBObjectStore {
  return db.transaction(store, mode).objectStore(store) as unknown as IDBObjectStore & T;
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// --- Collection operations (MongoDB-style) ---

async function insertOne<T extends Doc>(collection: string, doc: T): Promise<T> {
  const db = await getDb();
  const store = tx(db, collection, 'readwrite');
  if (!doc._id) doc._id = crypto.randomUUID();
  await reqToPromise(store.add(doc as Record<string, unknown>));
  return doc;
}

async function insertMany<T extends Doc>(collection: string, docs: T[]): Promise<T[]> {
  const db = await getDb();
  const store = tx(db, collection, 'readwrite');
  for (const doc of docs) {
    if (!doc._id) doc._id = crypto.randomUUID();
    await reqToPromise(store.add(doc as Record<string, unknown>));
  }
  return docs;
}

async function findOne<T extends Doc>(collection: string, filter: Partial<T>): Promise<T | null> {
  const all = await findMany<T>(collection, filter);
  return all[0] ?? null;
}

async function findMany<T extends Doc>(collection: string, filter: Partial<T> = {}): Promise<T[]> {
  const db = await getDb();
  const store = tx(db, collection, 'readonly');
  const all = await reqToPromise(store.getAll() as unknown as IDBRequest<T[]>);
  return (all as T[]).filter((doc) => matchFilter(doc, filter));
}

async function findAll<T extends Doc>(collection: string): Promise<T[]> {
  const db = await getDb();
  const store = tx(db, collection, 'readonly');
  return reqToPromise(store.getAll()) as Promise<T[]>;
}

async function updateOne<T extends Doc>(collection: string, filter: Partial<T>, updates: Partial<T>): Promise<T | null> {
  const db = await getDb();
  const store = tx(db, collection, 'readwrite');
  const all = await reqToPromise(store.getAll());
  const docs = all as T[];
  const doc = docs.find((d) => matchFilter(d, filter));
  if (!doc) return null;
  const updated = { ...doc, ...updates, updated_at: new Date().toISOString() };
  await reqToPromise(store.put(updated as Record<string, unknown>));
  return updated;
}

async function updateById<T extends Doc>(collection: string, id: string, updates: Partial<T>): Promise<T | null> {
  return updateOne<T>(collection, { _id: id } as unknown as Partial<T>, updates);
}

function matchFilter<T extends Doc>(doc: T, filter: Partial<T>): boolean {
  for (const [key, value] of Object.entries(filter)) {
    if (value === undefined) continue;
    const docVal = (doc as Record<string, unknown>)[key];
    if (Array.isArray(value)) {
      if (!value.includes(docVal)) return false;
    } else if (docVal !== value) {
      return false;
    }
  }
  return true;
}

// ============ Seed data ============

let seeded = false;

async function seedData(db: IDBDatabase): Promise<void> {
  if (seeded) return;
  const existing = await new Promise<number>((resolve) => {
    const req = db.transaction('profiles', 'readonly').objectStore('profiles').count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(0);
  });
  if (existing > 0) { seeded = true; return; }

  const now = new Date();
  const iso = (offsetMs: number) => new Date(now.getTime() - offsetMs).toISOString();

  const users: Profile[] = [
    { id: 'a0000000-0000-4000-8000-000000000001', email: 'demo.user1@example.com', full_name: 'Demo User 1', phone: null, role: 'USER', status: 'ACTIVE', avatar_url: null, preferred_language: 'en', default_radius_km: 10, created_at: iso(86400000 * 10), updated_at: iso(86400000 * 10) },
    { id: 'a0000000-0000-4000-8000-000000000002', email: 'demo.user2@example.com', full_name: 'Demo User 2', phone: null, role: 'USER', status: 'ACTIVE', avatar_url: null, preferred_language: 'en', default_radius_km: 10, created_at: iso(86400000 * 9), updated_at: iso(86400000 * 9) },
    { id: 'a0000000-0000-4000-8000-000000000003', email: 'demo.user3@example.com', full_name: 'Demo User 3', phone: null, role: 'USER', status: 'ACTIVE', avatar_url: null, preferred_language: 'en', default_radius_km: 10, created_at: iso(86400000 * 8), updated_at: iso(86400000 * 8) },
    { id: 'a0000000-0000-4000-8000-000000000004', email: 'demo.user4@example.com', full_name: 'Demo User 4', phone: null, role: 'USER', status: 'ACTIVE', avatar_url: null, preferred_language: 'en', default_radius_km: 10, created_at: iso(86400000 * 7), updated_at: iso(86400000 * 7) },
    { id: 'a0000000-0000-4000-8000-000000000005', email: 'demo.user5@example.com', full_name: 'Demo User 5', phone: null, role: 'USER', status: 'ACTIVE', avatar_url: null, preferred_language: 'en', default_radius_km: 10, created_at: iso(86400000 * 6), updated_at: iso(86400000 * 6) },
    { id: 'a0000000-0000-4000-8000-000000000006', email: 'demo.moderator@example.com', full_name: 'Demo Moderator', phone: null, role: 'MODERATOR', status: 'ACTIVE', avatar_url: null, preferred_language: 'en', default_radius_km: 10, created_at: iso(86400000 * 5), updated_at: iso(86400000 * 5) },
    { id: 'a0000000-0000-4000-8000-000000000007', email: 'demo.admin@example.com', full_name: 'Demo Admin', phone: null, role: 'ADMIN', status: 'ACTIVE', avatar_url: null, preferred_language: 'en', default_radius_km: 10, created_at: iso(86400000 * 5), updated_at: iso(86400000 * 5) },
  ];

  for (const u of users) {
    await insertOne('profiles', { ...u, _id: u.id, password_hash: 'password123' });
  }

  const cases: (Case & { _id: string })[] = [
    { _id: 'b0000000-0000-4000-8000-000000000001', id: 'b0000000-0000-4000-8000-000000000001', case_type: 'MISSING', status: 'ACTIVE', created_by: users[0].id, person_name: 'Raj Kumar', age_min: 65, age_max: 70, gender: 'MALE', clothing: 'White shirt, blue dhoti', description: 'Elderly man with white hair, walks with a limp. Last seen near Salem bus stand. May be confused about his surroundings.', location_visibility: 'LAST_KNOWN', location_label: 'Near Salem New Bus Stand', found_at: null, last_seen_at: iso(86400000 * 2), is_child: false, police_reference: 'FIR/2024/00123', additional_info: 'Has dementia, may not remember his address', created_at: iso(86400000 * 2), updated_at: iso(86400000 * 2), closed_at: null },
    { _id: 'b0000000-0000-4000-8000-000000000002', id: 'b0000000-0000-4000-8000-000000000002', case_type: 'MISSING', status: 'ACTIVE', created_by: users[1].id, person_name: 'Lakshmi Devi', age_min: 60, age_max: 65, gender: 'FEMALE', clothing: 'Green saree with gold border', description: 'Elderly woman, short stature, greying hair. Speaks Tamil. Last seen near the market area.', location_visibility: 'LAST_KNOWN', location_label: 'Near Salem Market', found_at: null, last_seen_at: iso(86400000), is_child: false, police_reference: null, additional_info: null, created_at: iso(86400000), updated_at: iso(86400000), closed_at: null },
    { _id: 'b0000000-0000-4000-8000-000000000003', id: 'b0000000-0000-4000-8000-000000000003', case_type: 'MISSING', status: 'ACTIVE', created_by: users[2].id, person_name: 'Arjun', age_min: 8, age_max: 10, gender: 'MALE', clothing: 'Red t-shirt, blue shorts', description: 'Young boy, short hair. Last seen near the school. May have wandered off.', location_visibility: 'LAST_KNOWN', location_label: 'Near Salem School Area', found_at: null, last_seen_at: iso(21600000), is_child: true, police_reference: 'FIR/2024/00456', additional_info: 'Child has autism and may not respond to strangers', created_at: iso(21600000), updated_at: iso(21600000), closed_at: null },
    { _id: 'b0000000-0000-4000-8000-000000000004', id: 'b0000000-0000-4000-8000-000000000004', case_type: 'FOUND', status: 'ACTIVE', created_by: users[3].id, person_name: null, age_min: 65, age_max: 70, gender: 'MALE', clothing: 'White shirt, blue dhoti', description: 'Elderly man found near the bus stand. Appears confused, speaks Tamil. Walks with a limp.', location_visibility: 'FOUND_LOCATION', location_label: 'Near Salem New Bus Stand', found_at: iso(86400000), last_seen_at: null, is_child: false, police_reference: null, additional_info: null, created_at: iso(86400000), updated_at: iso(86400000), closed_at: null },
    { _id: 'b0000000-0000-4000-8000-000000000005', id: 'b0000000-0000-4000-8000-000000000005', case_type: 'FOUND', status: 'ACTIVE', created_by: users[4].id, person_name: null, age_min: 60, age_max: 65, gender: 'FEMALE', clothing: 'Green saree', description: 'Elderly woman found near the market. Short stature, greying hair. Speaks Tamil.', location_visibility: 'FOUND_LOCATION', location_label: 'Near Salem Market', found_at: iso(86400000), last_seen_at: null, is_child: false, police_reference: null, additional_info: null, created_at: iso(86400000), updated_at: iso(86400000), closed_at: null },
    { _id: 'b0000000-0000-4000-8000-000000000006', id: 'b0000000-0000-4000-8000-000000000006', case_type: 'FOUND', status: 'ACTIVE', created_by: users[3].id, person_name: null, age_min: 30, age_max: 40, gender: 'MALE', clothing: 'Brown jacket, jeans', description: 'Man found sitting near the railway station. Appears disoriented but responsive.', location_visibility: 'FOUND_LOCATION', location_label: 'Near Salem Railway Station', found_at: iso(86400000), last_seen_at: null, is_child: false, police_reference: null, additional_info: null, created_at: iso(86400000), updated_at: iso(86400000), closed_at: null },
    { _id: 'b0000000-0000-4000-8000-000000000007', id: 'b0000000-0000-4000-8000-000000000007', case_type: 'FOUND', status: 'ACTIVE', created_by: users[4].id, person_name: null, age_min: 70, age_max: 80, gender: 'FEMALE', clothing: 'Pink salwar kameez', description: 'Elderly woman found near the hospital. Does not speak, appears to have difficulty hearing.', location_visibility: 'FOUND_LOCATION', location_label: 'Near Salem Hospital', found_at: iso(86400000), last_seen_at: null, is_child: false, police_reference: null, additional_info: null, created_at: iso(86400000), updated_at: iso(86400000), closed_at: null },
    { _id: 'b0000000-0000-4000-8000-000000000008', id: 'b0000000-0000-4000-8000-000000000008', case_type: 'FOUND', status: 'PENDING_REVIEW', created_by: users[1].id, person_name: null, age_min: 8, age_max: 10, gender: 'MALE', clothing: 'Red t-shirt, blue shorts', description: 'Young boy found near the school area. Not speaking, may have autism.', location_visibility: 'FOUND_LOCATION', location_label: 'Near Salem School Area', found_at: iso(86400000), last_seen_at: null, is_child: true, police_reference: null, additional_info: null, created_at: iso(86400000), updated_at: iso(86400000), closed_at: null },
  ];

  for (const c of cases) {
    await insertOne('cases', c as unknown as Doc);
  }

  const locations = [
    { case_id: 'b0000000-0000-4000-8000-000000000001', latitude: 11.6643, longitude: 78.1460, location_type: 'LAST_KNOWN' },
    { case_id: 'b0000000-0000-4000-8000-000000000002', latitude: 11.6520, longitude: 78.1520, location_type: 'LAST_KNOWN' },
    { case_id: 'b0000000-0000-4000-8000-000000000003', latitude: 11.6700, longitude: 78.1400, location_type: 'LAST_KNOWN' },
    { case_id: 'b0000000-0000-4000-8000-000000000004', latitude: 11.6650, longitude: 78.1470, location_type: 'FOUND_LOCATION' },
    { case_id: 'b0000000-0000-4000-8000-000000000005', latitude: 11.6530, longitude: 78.1530, location_type: 'FOUND_LOCATION' },
    { case_id: 'b0000000-0000-4000-8000-000000000006', latitude: 11.6600, longitude: 78.1380, location_type: 'FOUND_LOCATION' },
    { case_id: 'b0000000-0000-4000-8000-000000000007', latitude: 11.6680, longitude: 78.1450, location_type: 'FOUND_LOCATION' },
    { case_id: 'b0000000-0000-4000-8000-000000000008', latitude: 11.6710, longitude: 78.1410, location_type: 'FOUND_LOCATION' },
  ];

  for (const l of locations) {
    await insertOne('case_locations', { ...l, accuracy_m: null, created_at: iso(86400000) });
  }

  const matches = [
    { found_case_id: 'b0000000-0000-4000-8000-000000000004', missing_case_id: 'b0000000-0000-4000-8000-000000000001', status: 'POTENTIAL', distance_km: 0.3, overall_score: 87 },
    { found_case_id: 'b0000000-0000-4000-8000-000000000005', missing_case_id: 'b0000000-0000-4000-8000-000000000002', status: 'POTENTIAL', distance_km: 0.5, overall_score: 83 },
    { found_case_id: 'b0000000-0000-4000-8000-000000000008', missing_case_id: 'b0000000-0000-4000-8000-000000000003', status: 'POTENTIAL', distance_km: 0.2, overall_score: 88 },
  ];

  for (const m of matches) {
    await insertOne('case_matches', { ...m, age_similarity_score: 90, gender_match: true, description_similarity_score: 75, clothing_similarity_score: 80, time_proximity_score: 85, confirmed_by: null, rejected_by: null, created_at: iso(3600000), updated_at: iso(3600000) });
  }

  const notifs: Notification[] = [
    { id: '', user_id: users[0].id, type: 'POTENTIAL_MATCH', title: 'Potential match found', body: 'A found person near your search area may match your missing person report.', data: null, is_read: false, created_at: iso(3600000) },
    { id: '', user_id: users[1].id, type: 'POTENTIAL_MATCH', title: 'Potential match found', body: 'A found person near the market area may match your report.', data: null, is_read: false, created_at: iso(3600000) },
    { id: '', user_id: users[0].id, type: 'NEARBY_FOUND', title: 'New found person nearby', body: 'A new found person was reported near Salem Bus Stand.', data: null, is_read: true, created_at: iso(7200000) },
    { id: '', user_id: users[2].id, type: 'CASE_UPDATE', title: 'Your case has been approved', body: 'Your missing person report for Arjun is now active.', data: null, is_read: true, created_at: iso(10800000) },
    { id: '', user_id: users[3].id, type: 'NEARBY_FOUND', title: 'New found person nearby', body: 'A new found person was reported near Salem Railway Station.', data: null, is_read: false, created_at: iso(1800000) },
  ];

  for (const n of notifs) {
    await insertOne('notifications', { ...n, data: null });
  }

  const reports = [
    { case_id: 'b0000000-0000-4000-8000-000000000006', reported_by: users[0].id, reason: 'PRIVACY_CONCERN', description: 'The description contains too much identifying information about the location.', status: 'PENDING', resolved_by: null, resolved_at: null, created_at: iso(7200000), updated_at: iso(7200000) },
    { case_id: 'b0000000-0000-4000-8000-000000000007', reported_by: users[1].id, reason: 'INAPPROPRIATE_IMAGE', description: 'The photo may not be appropriate for public viewing.', status: 'PENDING', resolved_by: null, resolved_at: null, created_at: iso(3600000), updated_at: iso(3600000) },
  ];

  for (const r of reports) {
    await insertOne('reports', r);
  }

  const audits = [
    { id: '', actor_id: users[5].id, action: 'CASE_APPROVED', entity_type: 'case', entity_id: 'b0000000-0000-4000-8000-000000000001', details: null, ip_address: null, created_at: iso(86400000) },
    { id: '', actor_id: users[5].id, action: 'CASE_APPROVED', entity_type: 'case', entity_id: 'b0000000-0000-4000-8000-000000000002', details: null, ip_address: null, created_at: iso(86400000) },
    { id: '', actor_id: users[5].id, action: 'CASE_APPROVED', entity_type: 'case', entity_id: 'b0000000-0000-4000-8000-000000000003', details: null, ip_address: null, created_at: iso(86400000) },
    { id: '', actor_id: users[5].id, action: 'CASE_APPROVED', entity_type: 'case', entity_id: 'b0000000-0000-4000-8000-000000000004', details: null, ip_address: null, created_at: iso(86400000) },
    { id: '', actor_id: users[5].id, action: 'CASE_APPROVED', entity_type: 'case', entity_id: 'b0000000-0000-4000-8000-000000000005', details: null, ip_address: null, created_at: iso(86400000) },
    { id: '', actor_id: users[6].id, action: 'USER_CREATED_CASE', entity_type: 'case', entity_id: 'b0000000-0000-4000-8000-000000000006', details: null, ip_address: null, created_at: iso(86400000) },
  ];

  for (const a of audits) {
    await insertOne('audit_logs', a);
  }

  seeded = true;
}

// ============ Auth helpers ============

export async function authSignIn(email: string, password: string): Promise<{ profile: Profile | null; error: string | null }> {
  const doc = await findOne<Doc & Profile & { password_hash: string }>('profiles', { email, password_hash: password } as Partial<Doc & Profile & { password_hash: string }>);
  if (!doc) return { profile: null, error: 'Invalid email or password.' };
  const { _id, password_hash, ...profile } = doc;
  return { profile: profile as Profile, error: null };
}

export async function authSignUp(email: string, password: string, fullName: string): Promise<{ profile: Profile | null; error: string | null }> {
  const existing = await findOne<Doc>('profiles', { email });
  if (existing) return { profile: null, error: 'An account with this email already exists.' };
  const id = crypto.randomUUID();
  const nowiso = new Date().toISOString();
  const doc: Doc & Profile & { password_hash: string } = {
    _id: id, id, email, password_hash: password, full_name: fullName, phone: null, role: 'USER', status: 'ACTIVE',
    avatar_url: null, preferred_language: 'en', default_radius_km: 10, created_at: nowiso, updated_at: nowiso,
  } as Doc & Profile & { password_hash: string };
  await insertOne('profiles', doc);
  const { _id: _, password_hash: __, ...profile } = doc;
  return { profile: profile as Profile, error: null };
}

// ============ Photo blob storage ============

export async function savePhotoBlob(key: string, file: File): Promise<void> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
  await insertOne('photo_blobs', { _id: key, key, data: dataUrl });
}

export async function getPhotoBlob(key: string): Promise<string | null> {
  const doc = await findOne<Doc & { data: string }>('photo_blobs', { _id: key });
  return doc?.data ?? null;
}

// ============ Session ============

const SESSION_KEY = 'findme-session';

export function saveSession(profileId: string): void {
  localStorage.setItem(SESSION_KEY, profileId);
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getSessionUserId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const doc = await findOne<Doc & Profile>('profiles', { _id: id });
  if (!doc) return null;
  const { _id, password_hash, ...profile } = doc as Doc & Profile & { password_hash: string };
  return profile as Profile;
}

export async function updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
  const updated = await updateById<Doc & Profile>('profiles', id, updates as Partial<Doc & Profile>);
  if (!updated) return null;
  const { _id, password_hash, ...profile } = updated as Doc & Profile & { password_hash: string };
  return profile as Profile;
}

// ============ Exported collection helpers for services ============

export const mongo = {
  insertOne, insertMany, findOne, findMany, findAll, updateOne, updateById,
};

// ============ Geo distance (Haversine) ============

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Re-export types used by services
export type { NearbyCaseResult, AdminStats, CaseMatch, Notification, Conversation, Message, Report, AuditLog, Consent, CaseLocation, CasePhoto };
