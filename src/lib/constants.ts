import type { CaseStatus, Gender, ReportReason, RadiusOption } from '@/types';

export const RADIUS_OPTIONS: RadiusOption[] = [2, 5, 10, 25, 50];
export const DEFAULT_RADIUS: RadiusOption = 10;

export const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Pending Review',
  ACTIVE: 'Active',
  MATCHED: 'Matched',
  VERIFICATION: 'Verification',
  REUNITED: 'Reunited',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
  REMOVED: 'Removed',
};

export const CASE_STATUS_COLORS: Record<CaseStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-300',
  PENDING_REVIEW: 'bg-amber-50 text-amber-700 border-amber-300',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  MATCHED: 'bg-blue-50 text-blue-700 border-blue-300',
  VERIFICATION: 'bg-cyan-50 text-cyan-700 border-cyan-300',
  REUNITED: 'bg-green-50 text-green-700 border-green-300',
  CLOSED: 'bg-gray-100 text-gray-600 border-gray-300',
  REJECTED: 'bg-red-50 text-red-700 border-red-300',
  REMOVED: 'bg-stone-100 text-stone-600 border-stone-300',
};

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
  UNKNOWN: 'Unknown',
};

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'FAKE_CASE', label: 'Fake case' },
  { value: 'WRONG_PERSON', label: 'Wrong person' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'PRIVACY_CONCERN', label: 'Privacy concern' },
  { value: 'INAPPROPRIATE_IMAGE', label: 'Inappropriate image' },
  { value: 'SCAM', label: 'Scam' },
  { value: 'OTHER', label: 'Other' },
];

export const EMERGENCY_NOTICE =
  'If a person is in immediate danger or requires urgent assistance, contact the appropriate local emergency or police service.';

export const CONSENT_TEXT =
  'I understand that this information may be reviewed and that I should not submit unnecessary private information.';
