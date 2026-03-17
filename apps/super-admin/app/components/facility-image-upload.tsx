import { useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';

import { Label } from '@front/cn/components/label';
import { ImageCropModal } from './image-crop-modal';

interface FacilityImageUploadProps {
  label: string;
  description?: string;
  aspectRatio: number;
  previewClassName: string;
  value: File | null;
  onChange: (file: File) => void;
}

export function FacilityImageUpload({
  label,
  description,
  aspectRatio,
  previewClassName,
  value,
  onChange,
}: FacilityImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRawImageSrc(URL.createObjectURL(file));
    // Reset input so the same file can be re-selected
    e.target.value = '';
  }

  function handleCropConfirm(croppedFile: File) {
    setPreview(URL.createObjectURL(croppedFile));
    setRawImageSrc(null);
    onChange(croppedFile);
  }

  function handleCropClose() {
    setRawImageSrc(null);
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="block cursor-pointer overflow-hidden rounded-lg border border-border hover:border-primary transition-colors"
        >
          <img
            src={preview}
            alt="Preview"
            className={previewClassName}
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
        >
          <ImagePlus className="h-4 w-4" />
          Seleccionar imagen
        </button>
      )}

      {rawImageSrc && (
        <ImageCropModal
          open
          imageSrc={rawImageSrc}
          aspectRatio={aspectRatio}
          onConfirm={handleCropConfirm}
          onClose={handleCropClose}
        />
      )}
    </div>
  );
}
