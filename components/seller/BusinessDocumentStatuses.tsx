import { BadgeCheck, Clock3, FileQuestion, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export type BusinessDocumentStatus = "APPROVED" | "PENDING" | "REJECTED" | "MISSING";

export interface BusinessDocumentStatusItem {
  id: string;
  name: string;
  status: BusinessDocumentStatus;
  updatedAt?: string;
  note?: string;
}

interface BusinessDocumentStatusesProps {
  documents: BusinessDocumentStatusItem[];
}

const statusPresentation: Record<
  BusinessDocumentStatus,
  { label: string; variant: "success" | "warning" | "danger" | "outline"; icon: typeof BadgeCheck }
> = {
  APPROVED: { label: "Approved", variant: "success", icon: BadgeCheck },
  PENDING: { label: "Under review", variant: "warning", icon: Clock3 },
  REJECTED: { label: "Action required", variant: "danger", icon: XCircle },
  MISSING: { label: "Not uploaded", variant: "outline", icon: FileQuestion },
};

export default function BusinessDocumentStatuses({ documents }: BusinessDocumentStatusesProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-8 text-center">
        <FileQuestion className="mx-auto size-6 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium text-foreground">No documents to show</p>
        <p className="mt-1 text-xs text-muted-foreground">Required business documents will appear here.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {documents.map((document) => {
        const presentation = statusPresentation[document.status];
        const Icon = presentation.icon;

        return (
          <li key={document.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-secondary text-muted-foreground">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{document.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {document.note ?? (document.updatedAt ? `Updated ${document.updatedAt}` : "Status provided by document data")}
                </p>
              </div>
            </div>
            <Badge variant={presentation.variant} className="w-fit shrink-0">{presentation.label}</Badge>
          </li>
        );
      })}
    </ul>
  );
}
