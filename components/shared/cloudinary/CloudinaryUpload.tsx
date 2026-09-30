"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";

interface CloudinaryUploadProps {
  onUploadSuccess: (url: string) => void;
  disabled?: boolean;
}

export const CloudinaryUpload = ({
  onUploadSuccess,
  disabled = false,
}: CloudinaryUploadProps) => {
  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_SECURE_DISTRIBUTION}
      options={{
        maxFiles: 1,
        resourceType: "image",
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        maxFileSize: 5000000, // 5MB
        folder: "trustpass/reports",
      }}
      onSuccess={(result: any) => {
        const url = result?.info?.secure_url;
        if (url) {
          onUploadSuccess(url);
        }
      }}
    >
      {({ open, isLoading }) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => open()}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
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
      )}
    </CldUploadWidget>
  );
};