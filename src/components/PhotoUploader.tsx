import { useState, useRef, type ChangeEvent } from 'react';
import { X, ImagePlus } from 'lucide-react';
import { ACCEPTED_PHOTO_TYPES, MAX_PHOTO_SIZE } from '@/lib/constants';

interface Props {
  onPhotoSelected: (file: File | null) => void;
  currentPhoto?: string | null;
}

export function PhotoUploader({ onPhotoSelected, currentPhoto }: Props) {
  const [preview, setPreview] = useState<string | null>(currentPhoto ?? null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setError('Image must be 5MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onPhotoSelected(file);
  };

  const removePhoto = () => {
    setPreview(null);
    setError(null);
    onPhotoSelected(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Photo (Optional)</label>
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="h-32 w-32 rounded-lg object-cover border border-gray-200" />
          <button
            type="button"
            onClick={removePhoto}
            className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white shadow-md hover:bg-red-600 transition-colors"
            aria-label="Remove photo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <ImagePlus className="h-8 w-8" />
          <span className="text-xs">Upload Photo</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_PHOTO_TYPES.join(',')}
        onChange={handleFile}
        className="hidden"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
