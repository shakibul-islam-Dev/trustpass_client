"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiUrl } from "@/lib/core/api-url";

interface FileUploadProps {
  onUploadSuccess: (url: string) => void;
  disabled?: boolean;
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

export const FileUpload = ({
  onUploadSuccess,
  disabled = false,
}: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles file selection and validates it.
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP images are allowed.");
      resetInput();
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File size must be less than ${MAX_SIZE_MB}MB.`);
      resetInput();
      return;
    }

    setSelectedFileName(file.name);
    await uploadFile(file);
  };

  /**
   * Uploads the file to the backend API.
   *
   * 🚧 TODO: Replace the endpoint and response parsing below
   * once the backend endpoint is finalized.
   */
  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      // Build multipart form data
      const formData = new FormData();
      formData.append("file", file); // ✅ change field name if backend expects "image"

      // 🚧 TODO: Replace with actual backend endpoint
      // Relative path — next.config.ts rewrites /api/* to the API server, so
      // the session cookie (which the upload endpoint needs) rides along as a
      // normal first-party cookie. See lib/core/api-url.ts.
      const res = await fetch(apiUrl("/api/v1/upload"), {
        method: "POST",
        credentials: "include",
        body: formData,
        // Note: Do NOT set Content-Type manually;
        // the browser will set it with the correct boundary.
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }

      const data = await res.json();

      // 🚧 TODO: Adjust based on actual backend response
      const url = data?.url || data?.secure_url || data?.data?.url;

      if (!url) {
        throw new Error("No URL returned from server");
      }

      onUploadSuccess(url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      resetInput();
    }
  };

  /**
   * Resets the file input and state.
   */
  const resetInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSelectedFileName(null);
  };

  return (
    <div className="flex items-center gap-2 min-w-0">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* Upload Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          fileInputRef.current?.click();
        }}
        disabled={disabled || isUploading}
        className="shrink-0"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </>
        )}
      </Button>

      {/* Show selected file name while uploading */}
      {selectedFileName && isUploading && (
        <span className="text-xs text-muted-foreground truncate">
          {selectedFileName}
        </span>
      )}
    </div>
  );
};