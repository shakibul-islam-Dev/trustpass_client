"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ProfilePhotoPickerProps {
  name?: string;
  onSelect?: (file: File | null) => void;
}

export default function ProfilePhotoPicker({ name = "Your profile photo", onSelect }: ProfilePhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSelect = (file?: File) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file to continue.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5MB or smaller.");
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    onSelect?.(file);
  };

  const clearPhoto = () => {
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    onSelect?.(null);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-secondary text-muted-foreground">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={name} className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-8" />
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="sr-only" aria-label="Choose a profile photo" onChange={(event) => handleSelect(event.target.files?.[0])} />
        <Button type="button" size="icon-sm" className="absolute right-0 bottom-0 rounded-full" aria-label="Choose a profile photo" onClick={() => inputRef.current?.click()}>
          <Camera className="size-4" />
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">JPG, PNG, or WEBP · Up to 5MB</p>
      {previewUrl && <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={clearPhoto}><X className="size-3.5" />Remove photo</Button>}
      {error && <p role="alert" className="text-center text-xs text-danger">{error}</p>}
      <p className="text-center text-xs text-muted-foreground">Preview only; upload is not connected.</p>
    </div>
  );
}
