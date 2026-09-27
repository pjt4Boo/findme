import { supabase, STORAGE_BUCKET } from '@/lib/supabase';
import type { Case, CasePhoto, CaseLocation, NearbyCaseResult, RadiusOption, CaseType } from '@/types';

export async function createCase(
  data: Omit<Case, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'closed_at' | 'status'>,
  location: { latitude: number; longitude: number; location_type: string; accuracy_m?: number },
  consentAgreed: boolean,
  photoFile?: File | null,
): Promise<{ case: Case | null; error: string | null }> {
  const { data: caseData, error } = await supabase
    .from('cases')
    .insert({
      ...data,
      status: 'PENDING_REVIEW',
    })
    .select()
    .single();

  if (error) return { case: null, error: error.message };

  const newCase = caseData as Case;

  // Insert location
  const { error: locError } = await supabase.from('case_locations').insert({
    case_id: newCase.id,
    latitude: location.latitude,
    longitude: location.longitude,
    location_type: location.location_type,
    accuracy_m: location.accuracy_m ?? null,
  });

  if (locError) return { case: null, error: locError.message };

  // Upload photo if provided
  if (photoFile) {
    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${newCase.id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, photoFile, { contentType: photoFile.type });

    if (uploadError) return { case: null, error: uploadError.message };

    await supabase.from('case_photos').insert({
      case_id: newCase.id,
      storage_key: fileName,
      file_type: photoFile.type,
      file_size: photoFile.size,
      is_primary: true,
    });
  }

  // Record consent
  await supabase.from('consents').insert({
    case_id: newCase.id,
    consent_type: 'CASE_SUBMISSION',
    consent_text: 'I understand that this information may be reviewed and that I should not submit unnecessary private information.',
    agreed: consentAgreed,
  });

  return { case: newCase, error: null };
}

export async function getCaseById(id: string): Promise<Case | null> {
  const { data, error } = await supabase.from('cases').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return data as Case;
}

export async function getCasePhotos(caseId: string): Promise<CasePhoto[]> {
  const { data } = await supabase
    .from('case_photos')
    .select('*')
    .eq('case_id', caseId)
    .is('deleted_at', null)
    .order('is_primary', { ascending: false });
  return (data ?? []) as CasePhoto[];
}

export async function getCaseLocations(caseId: string): Promise<CaseLocation[]> {
  const { data } = await supabase
    .from('case_locations')
    .select('*')
    .eq('case_id', caseId)
    .neq('location_type', 'EXACT_INTERNAL')
    .order('created_at', { ascending: false });
  return (data ?? []) as CaseLocation[];
}

export async function getPhotoUrl(storageKey: string): Promise<string | null> {
  const { data } = await supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storageKey);
  return data?.publicUrl ?? null;
}

export async function findNearbyCases(
  lat: number,
  lng: number,
  radiusKm: RadiusOption,
  caseType?: CaseType,
): Promise<NearbyCaseResult[]> {
  const { data, error } = await supabase.rpc('find_nearby_cases', {
    p_lat: lat,
    p_lng: lng,
    p_radius_km: radiusKm,
    p_case_type: caseType ?? null,
  });

  if (error || !data) return [];
  return data as NearbyCaseResult[];
}

export async function getMyCases(): Promise<Case[]> {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as Case[];
}

export async function updateCaseStatus(
  caseId: string,
  status: Case['status'],
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('cases').update({ status }).eq('id', caseId);
  return { error: error?.message ?? null };
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
