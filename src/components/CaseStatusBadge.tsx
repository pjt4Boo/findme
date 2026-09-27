import type { CaseStatus } from '@/types';
import { CASE_STATUS_LABELS, CASE_STATUS_COLORS } from '@/lib/constants';

interface Props {
  status: CaseStatus;
  className?: string;
}

export function CaseStatusBadge({ status, className = '' }: Props) {
  const label = CASE_STATUS_LABELS[status] ?? status;
  const color = CASE_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700 border-gray-300';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${color} ${className}`}
    >
      {label}
    </span>
  );
}
