import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Crosshair } from 'lucide-react';

interface Props {
  onLocationSelected: (lat: number, lng: number, label: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialLabel?: string;
}

export function LocationPicker({ onLocationSelected, initialLat, initialLng, initialLabel }: Props) {
  const [lat, setLat] = useState<number | null>(initialLat ?? null);
  const [lng, setLng] = useState<number | null>(initialLng ?? null);
  const [label, setLabel] = useState(initialLabel ?? '');
  const labelRef = useRef<HTMLInputElement>(null);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLat(11.6643);
      setLng(78.1460);
      setLabel('Salem area');
      onLocationSelected(11.6643, 78.1460, 'Salem area');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        setLabel('Current location area');
        onLocationSelected(latitude, longitude, 'Current location area');
      },
      () => {
        setLat(11.6643);
        setLng(78.1460);
        setLabel('Salem area');
        onLocationSelected(11.6643, 78.1460, 'Salem area');
      },
    );
  }, [onLocationSelected]);

  useEffect(() => {
    if (lat === null && lng === null) {
      getLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLabelChange = (value: string) => {
    setLabel(value);
    if (lat && lng) {
      onLocationSelected(lat, lng, value);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Approximate Location Label
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Enter a general area name (e.g., "Near Salem Bus Stand"). Do not enter exact addresses.
        </p>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={labelRef}
            type="text"
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="e.g., Near Salem New Bus Stand"
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={getLocation}
          className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <Crosshair className="h-4 w-4" />
          Use my location
        </button>
        {lat && lng && (
          <span className="text-xs text-gray-500">
            Location set (approximate area)
          </span>
        )}
      </div>

      {/* Simple visual map placeholder */}
      <div className="relative h-48 rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-green-50 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {lat && lng ? (
            <div className="flex flex-col items-center gap-1">
              <div className="relative">
                <MapPin className="h-10 w-10 text-blue-600" />
                <div className="absolute -inset-4 rounded-full border-2 border-blue-300 border-dashed animate-pulse" />
              </div>
              <p className="text-xs text-gray-600 font-medium">{label || 'Selected area'}</p>
              <p className="text-xs text-gray-400">Approximate location (privacy-protected)</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Click "Use my location" or enter a label</p>
          )}
        </div>
        {/* Grid lines for map feel */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute left-1/4 top-0 bottom-0 border-l border-gray-300" />
          <div className="absolute left-1/2 top-0 bottom-0 border-l border-gray-300" />
          <div className="absolute left-3/4 top-0 bottom-0 border-l border-gray-300" />
          <div className="absolute top-1/4 left-0 right-0 border-t border-gray-300" />
          <div className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
          <div className="absolute top-3/4 left-0 right-0 border-t border-gray-300" />
        </div>
      </div>
    </div>
  );
}
