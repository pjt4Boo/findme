import { RADIUS_OPTIONS } from '@/lib/constants';
import type { RadiusOption } from '@/types';

interface Props {
  value: RadiusOption;
  onChange: (value: RadiusOption) => void;
}

export function RadiusSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Search Radius</label>
      <div className="flex flex-wrap gap-2">
        {RADIUS_OPTIONS.map((radius) => (
          <button
            key={radius}
            type="button"
            onClick={() => onChange(radius)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              value === radius
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {radius} km
          </button>
        ))}
      </div>
    </div>
  );
}
