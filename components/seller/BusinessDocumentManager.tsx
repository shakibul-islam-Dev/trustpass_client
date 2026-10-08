"use client";

import { useRef, useState } from "react";
import { FileCheck2, FileText, Trash2, UploadCloud } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const requiredBusinessDocuments = [
  { id: "trade-license", label: "Trade license", description: "Valid business registration document" },
  { id: "nid", label: "Owner NID", description: "National identity document" },
  { id: "tin", label: "TIN certificate", description: "Tax identification document" },
];

interface BusinessDocumentManagerProps {
  onFilesChange?: (files: Record<string, File>) => void;
  onFileSelect?: (documentId: string, file: File | null) => void | Promise<void>;
  maxSizeMb?: number;
}

export default function BusinessDocumentManager({
  onFilesChange,
  onFileSelect,
  maxSizeMb = 10,
}: BusinessDocumentManagerProps) {
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const selectFile = async (documentId: string, file?: File) => {
    setErrors((current) => ({ ...current, [documentId]: "" }));
    if (file) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        setErrors((current) => ({ ...current, [documentId]: "Choose a PDF, JPG, or PNG file." }));
        if (inputs.current[documentId]) inputs.current[documentId]!.value = "";
        return;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        setErrors((current) => ({ ...current, [documentId]: `File must be ${maxSizeMb}MB or smaller.` }));
        if (inputs.current[documentId]) inputs.current[documentId]!.value = "";
        return;
      }
      const next = { ...files, [documentId]: file };
      setFiles(next);
      onFilesChange?.(Object.fromEntries(Object.entries(next).filter((entry): entry is [string, File] => Boolean(entry[1]))));
      if (onFileSelect) {
        setUploadingId(documentId);
        try {
          await onFileSelect(documentId, file);
        } catch (error) {
          console.error(`Document upload failed for ${documentId}:`, error);
          setErrors((current) => ({ ...current, [documentId]: error instanceof Error ? error.message : "Could not upload this document." }));
        } finally {
          setUploadingId(null);
        }
      }
    } else {
      const next = { ...files };
      delete next[documentId];
      setFiles(next);
      onFilesChange?.(Object.fromEntries(Object.entries(next).filter((entry): entry is [string, File] => Boolean(entry[1]))));
      if (onFileSelect) {
        try {
          await onFileSelect(documentId, null);
        } catch (error) {
          console.error(`Document removal failed for ${documentId}:`, error);
          setErrors((current) => ({ ...current, [documentId]: error instanceof Error ? error.message : "Could not remove this document." }));
        }
      }
    }
    const input = inputs.current[documentId];
    if (input) input.value = "";
  };

  return (
    <section className="space-y-4" aria-labelledby="business-documents-heading">
      <div>
        <h3 id="business-documents-heading" className="text-base font-semibold text-foreground">Business documents</h3>
        <p className="mt-1 text-sm text-muted-foreground">PDF, JPG, or PNG files up to 10MB each.</p>
      </div>

      <div className="space-y-3">
        {requiredBusinessDocuments.map(({ id, label, description }) => {
          const file = files[id];

          return (
            <div key={id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {file ? <FileCheck2 className="size-5" /> : <FileText className="size-5" />}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="truncate text-xs text-muted-foreground">{file?.name ?? description}</p>
                  {errors[id] && <p role="alert" className="mt-1 text-xs text-danger">{errors[id]}</p>}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {uploadingId === id ? (
                  <Badge variant="warning">Uploading…</Badge>
                ) : file ? (
                  <>
                    <Badge variant="success">Selected</Badge>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove ${label}`} onClick={() => void selectFile(id)} disabled={uploadingId === id}>
                      <Trash2 className="size-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <input
                      ref={(node) => { inputs.current[id] = node; }}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      className="sr-only"
                      aria-label={`Choose ${label}`}
                      onChange={(event) => void selectFile(id, event.target.files?.[0])}
                    />
                    <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => inputs.current[id]?.click()}>
                      <UploadCloud className="size-4" />
                      Choose file
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
