"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { uploadProfilePhoto } from "@/lib/core/profile-api";

const MAX_SIZE_MB = 5;

interface ProfilePhotoPickerProps {
  name?: string;
  onSelect?: (file: File | null) => void;
}

export default function ProfilePhotoPicker({ name = "Your profile photo", onSelect }: ProfilePhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success">("idle");

  useEffect(() => {
    // Only revoke local object URLs; server-provided URLs must stay.
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSelect = async (file?: File) => {
    setError(null);
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file to continue.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be ${MAX_SIZE_MB}MB or smaller.`);
      return;
    }

    // Show the picked photo instantly; then upload it in the background.
    setPreviewUrl(URL.createObjectURL(file));
    onSelect?.(file);
    setStatus("uploading");

    const result = await uploadProfilePhoto(file);

    if (!result.ok) {
      setStatus("idle");
      setError(result.message);
      return;
    }

    // Replace the temp preview with the server-hosted photo.
    const uploadedUrl = result.data?.image;
    if (uploadedUrl) setPreviewUrl(uploadedUrl);
    setStatus("success");
  };

  const clearPhoto = () => {
    setPreviewUrl(null);
    setError(null);
    setStatus("idle");
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
        <input ref={inputRef} type="file" accept="image/*" className="sr-only" aria-label="Choose a profile photo" onChange={(event) => void handleSelect(event.target.files?.[0])} />
        <Button type="button" size="icon-sm" className="absolute right-0 bottom-0 rounded-full" aria-label="Choose a profile photo" disabled={status === "uploading"} onClick={() => inputRef.current?.click()}>
          <Camera className="size-4" />
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">JPG, PNG, or WEBP · Up to {MAX_SIZE_MB}MB</p>
      {status === "uploading" && <p role="status" className="text-center text-xs font-medium text-primary">Uploading photo…</p>}
      {status === "success" && !error && <p className="text-center text-xs font-medium text-success">Photo updated.</p>}
      {previewUrl && (
        <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" disabled={status === "uploading"} onClick={clearPhoto}>
          <X className="size-3.5" />
          Remove photo
        </Button>
      )}
      {error && <p role="alert" className="text-center text-xs text-danger">{error}</p>}
    </div>
  );
}