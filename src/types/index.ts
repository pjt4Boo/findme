export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export type CaseType = 'FOUND' | 'MISSING';
export type CaseStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'MATCHED'
  | 'VERIFICATION'
  | 'REUNITED'
  | 'CLOSED'
  | 'REJECTED'
  | 'REMOVED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';
export type LocationType = 'EXACT_INTERNAL' | 'APPROXIMATE_PUBLIC' | 'LAST_KNOWN' | 'FOUND_LOCATION';
export type LocationVisibility = 'EXACT_INTERNAL' | 'APPROXIMATE_PUBLIC' | 'LAST_KNOWN' | 'FOUND_LOCATION';

export type MatchStatus = 'POTENTIAL' | 'CONFIRMED' | 'REJECTED';
export type NotificationType =
  | 'NEARBY_FOUND'
  | 'POTENTIAL_MATCH'
  | 'CASE_UPDATE'
  | 'CHAT_MESSAGE'
  | 'CASE_CLOSED'
  | 'ADMIN_MESSAGE';

export type ReportReason =
  | 'FAKE_CASE'
  | 'WRONG_PERSON'
  | 'HARASSMENT'
  | 'PRIVACY_CONCERN'
  | 'INAPPROPRIATE_IMAGE'
  | 'SCAM'
  | 'OTHER';

export type ReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';

export type AuditAction =
  | 'USER_CREATED_CASE'
  | 'CASE_APPROVED'
  | 'CASE_REJECTED'
  | 'CASE_HIDDEN'
  | 'CASE_REMOVED'
  | 'USER_SUSPENDED'
  | 'USER_RESTORED'
  | 'MATCH_CONFIRMED'
  | 'MATCH_REJECTED'
  | 'CASE_CLOSED';

export type RadiusOption = 2 | 5 | 10 | 25 | 50;
export type Language = 'en' | 'ta' | 'hi';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  avatar_url: string | null;
  preferred_language: Language;
  default_radius_km: RadiusOption;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  case_type: CaseType;
  status: CaseStatus;
  created_by: string;
  person_name: string | null;
  age_min: number | null;
  age_max: number | null;
  gender: Gender | null;
  clothing: string | null;
  description: string | null;
  location_visibility: LocationVisibility;
  location_label: string | null;
  found_at: string | null;
  last_seen_at: string | null;
  is_child: boolean;
  police_reference: string | null;
  additional_info: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface CaseLocation {
  id: string;
  case_id: string;
  latitude: number;
  longitude: number;
  accuracy_m: number | null;
  location_type: LocationType;
  created_at: string;
}

export interface CasePhoto {
  id: string;
  case_id: string;
  storage_key: string;
  file_type: string;
  file_size: number;
  is_primary: boolean;
  created_at: string;
  deleted_at: string | null;
}

export interface CaseMatch {
  id: string;
  found_case_id: string;
  missing_case_id: string;
  status: MatchStatus;
  distance_km: number | null;
  age_similarity_score: number | null;
  gender_match: boolean | null;
  description_similarity_score: number | null;
  clothing_similarity_score: number | null;
  time_proximity_score: number | null;
  overall_score: number;
  confirmed_by: string | null;
  rejected_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  case_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface Report {
  id: string;
  case_id: string | null;
  reported_by: string;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface Consent {
  id: string;
  user_id: string;
  case_id: string | null;
  consent_type: string;
  consent_text: string;
  agreed: boolean;
  created_at: string;
}

export interface NearbyCaseResult {
  id: string;
  case_type: CaseType;
  status: CaseStatus;
  person_name: string | null;
  age_min: number | null;
  age_max: number | null;
  gender: Gender | null;
  clothing: string | null;
  description: string | null;
  location_label: string | null;
  found_at: string | null;
  last_seen_at: string | null;
  is_child: boolean;
  created_at: string;
  distance_km: number;
  primary_photo_key: string | null;
}

export interface AdminStats {
  active_cases: number;
  pending_review: number;
  reported_cases: number;
  reunited_cases: number;
  active_users: number;
  suspended_users: number;
}
