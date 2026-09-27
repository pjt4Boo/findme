import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { REPORT_REASONS } from '@/lib/constants';
import { createReport } from '@/services/api';
import type { ReportReason } from '@/types';

interface Props {
  caseId: string;
  open: boolean;
  onClose: () => void;
}

export function ReportModal({ caseId, open, onClose }: Props) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      setError('Please select a reason.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: err } = await createReport(caseId, reason, description);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setReason(null);
      setDescription('');
      onClose();
    }, 1500);
  };

  return (
    <Modal open={open} onClose={onClose} title="Report this case">
      {success ? (
        <div className="py-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
            <Flag className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-sm font-medium text-gray-900">Report submitted. Thank you.</p>
          <p className="text-xs text-gray-500 mt-1">Our team will review this report.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                    reason === r.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{r.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Please provide any additional context..."
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !reason}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
