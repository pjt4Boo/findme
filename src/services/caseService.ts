import { mongo, savePhotoBlob, getPhotoBlob, haversineKm, getSessionUserId } from '@/lib/supabase';
import type { Case, CasePhoto, CaseLocation, NearbyCaseResult, RadiusOption, CaseType } from '@/types';
import type { Doc as DocType } from '@/lib/db';

type CaseDoc = DocType & Case;
type PhotoDoc = DocType & CasePhoto;
type LocationDoc = DocType & CaseLocation;

export async function createCase(
  data: Omit<Case, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'closed_at' | 'status'>,
  location: { latitude: number; longitude: number; location_type: string; accuracy_m?: number },
  consentAgreed: boolean,
  photoFile?: File | null,
): Promise<{ case: Case | null; error: string | null }> {
  const userId = getSessionUserId();
  if (!userId) return { case: null, error: 'You must be signed in.' };
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const caseDoc: CaseDoc = {
    ...data,
    _id: id, id, status: 'PENDING_REVIEW', created_by: userId,
    created_at: now, updated_at: now, closed_at: null,
  };
  await mongo.insertOne('cases', caseDoc);

  await mongo.insertOne<LocationDoc>('case_locations', {
    _id: crypto.randomUUID(), id: crypto.randomUUID(),
    case_id: id, latitude: location.latitude, longitude: location.longitude,
    location_type: location.location_type as CaseLocation['location_type'], accuracy_m: location.accuracy_m ?? null,
    created_at: now,
  });

  if (photoFile) {
    const storageKey = `${id}/${Date.now()}.${photoFile.name.split('.').pop()}`;
    await savePhotoBlob(storageKey, photoFile);
    await mongo.insertOne<PhotoDoc>('case_photos', {
      _id: crypto.randomUUID(), id: crypto.randomUUID(),
      case_id: id, storage_key: storageKey, file_type: photoFile.type,
      file_size: photoFile.size, is_primary: true, created_at: now, deleted_at: null,
    });
  }

  await mongo.insertOne<DocType & { user_id: string; case_id: string; consent_type: string; consent_text: string; agreed: boolean }>('consents', {
    _id: crypto.randomUUID(), user_id: userId, case_id: id,
    consent_type: 'CASE_SUBMISSION',
    consent_text: 'I understand that this information may be reviewed and that I should not submit unnecessary private information.',
    agreed: consentAgreed, created_at: now,
  });

  const { _id, ...result } = caseDoc;
  void _id;
  return { case: result as Case, error: null };
}

export async function getCaseById(id: string): Promise<Case | null> {
  const doc = await mongo.findOne<CaseDoc>('cases', { _id: id });
  if (!doc) return null;
  const { _id, ...result } = doc;
  void _id;
  return result as Case;
}

export async function getCasePhotos(caseId: string): Promise<CasePhoto[]> {
  const docs = await mongo.findMany<PhotoDoc>('case_photos', { case_id: caseId });
  return docs
    .filter((d) => !d.deleted_at)
    .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
    .map((d) => {
      const { _id, ...photo } = d;
      void _id;
      return photo as CasePhoto;
    });
}

export async function getCaseLocations(caseId: string): Promise<CaseLocation[]> {
  const docs = await mongo.findMany<LocationDoc>('case_locations', { case_id: caseId });
  return docs
    .filter((d) => d.location_type !== 'EXACT_INTERNAL')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((d) => {
      const { _id, ...location } = d;
      void _id;
      return location as CaseLocation;
    });
}

export async function getPhotoUrl(storageKey: string): Promise<string | null> {
  return getPhotoBlob(storageKey);
}

export async function findNearbyCases(
  lat: number,
  lng: number,
  radiusKm: RadiusOption,
  caseType?: CaseType,
): Promise<NearbyCaseResult[]> {
  const allCases = await mongo.findAll<CaseDoc>('cases');
  const allLocations = await mongo.findAll<LocationDoc>('case_locations');
  const allPhotos = await mongo.findAll<PhotoDoc>('case_photos');

  const locByCase = new Map<string, LocationDoc>();
  for (const loc of allLocations) {
    if (!locByCase.has(loc.case_id)) locByCase.set(loc.case_id, loc);
  }

  const photoByCase = new Map<string, string>();
  for (const p of allPhotos) {
    if (p.is_primary && !p.deleted_at && !photoByCase.has(p.case_id)) {
      photoByCase.set(p.case_id, p.storage_key);
    }
  }

  const results: NearbyCaseResult[] = [];
  for (const c of allCases) {
    if (c.status !== 'ACTIVE') continue;
    if (caseType && c.case_type !== caseType) continue;
    const loc = locByCase.get(c.id);
    if (!loc) continue;
    const dist = haversineKm(lat, lng, loc.latitude, loc.longitude);
    if (dist > radiusKm) continue;
    const {
      _id,
      created_by,
      location_visibility,
      updated_at,
      closed_at,
      police_reference,
      additional_info,
      is_child,
      ...rest
    } = c;
    void _id;
    void created_by;
    void location_visibility;
    void updated_at;
    void closed_at;
    void police_reference;
    void additional_info;
    void is_child;
    results.push({
      ...rest,
      is_child: c.is_child,
      distance_km: dist,
      primary_photo_key: photoByCase.get(c.id) ?? null,
    });
  }

  return results.sort((a, b) => a.distance_km - b.distance_km);
}

export async function getMyCases(): Promise<Case[]> {
  const userId = getSessionUserId();
  if (!userId) return [];
  const docs = await mongo.findMany<CaseDoc>('cases', { created_by: userId });
  return docs
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((d) => {
      const { _id, ...caseData } = d;
      void _id;
      return caseData as Case;
    });
}

export async function updateCaseStatus(
  caseId: string,
  status: Case['status'],
): Promise<{ error: string | null }> {
  await mongo.updateById<CaseDoc>('cases', caseId, { status } as Partial<CaseDoc>);
  return { error: null };
}

export async function getPrimaryPhotoForCase(caseId: string): Promise<string | null> {
  const photos = await getCasePhotos(caseId);
  const primary = photos.find((p) => p.is_primary) ?? photos[0];
  if (!primary) return null;
  return getPhotoUrl(primary.storage_key);
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `Approximately ${Math.round(km * 1000)} m away`;
  }
  return `Approximately ${km.toFixed(1)} km away`;
}

export function formatAgeRange(min: number | null, max: number | null): string {
  if (min == null && max == null) return 'Unknown age';
  if (min != null && max != null && min !== max) return `${min}–${max} years`;
  if (min != null) return `${min} years`;
  if (max != null) return `${max} years`;
  return 'Unknown age';
}
