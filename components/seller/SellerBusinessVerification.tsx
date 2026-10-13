"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  deleteBusinessDocument,
  getBusinessDocuments,
  getMyBusinesses,
  submitBusinessVerification,
  uploadBusinessDocument,
  type BusinessDocument,
  type BusinessDocumentType,
} from "@/lib/core/business-api";
import type { IBusiness } from "@/types/business";
import { requiredBusinessDocuments } from "./BusinessDocumentManager";
import SellerPageHeader from "./SellerPageHeader";
import SellerStatusBadge from "./SellerStatusBadge";

/**
 * Wizard document ids -> backend document types (mirrors `BusinessCreationForm`).
 */
const REQUIRED_DOC_TYPES: Record<string, BusinessDocumentType> = {
  "trade-license": "TRADE_LICENSE",
  nid: "NID",
  tin: "TIN_CERTIFICATE",
};

const REQUIRED_TYPES = Object.values(REQUIRED_DOC_TYPES);

/** Friendly labels for the document types the backend can return. */
const DOC_TYPE_LABELS: Record<string, string> = {
  TRADE_LICENSE: "Trade license",
  NID: "Owner NID",
  TIN_CERTIFICATE: "TIN certificate",
  VAT_CERTIFICATE: "VAT certificate",
  BANK_STATEMENT: "Bank statement",
  UTILITY_BILL: "Utility bill",
  OTHER: "Other document",
};

const humanizeDocType = (type: string) =>
  DOC_TYPE_LABELS[type] ?? type.replace(/_/g, " ").toLowerCase();

const ALLOWED_DOC_MIME = ["application/pdf", "image/jpeg", "image/png"];
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB — same limit as BusinessDocumentManager

/** Backend document types are immutable once approved, so we treat them as locked. */
const isLocked = (doc: BusinessDocument | null) => doc?.status === "APPROVED";

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};

type Tone = "success" | "error" | "info";
interface Message {
  tone: Tone;
  text: string;
}

interface SellerBusinessVerificationProps {
  /** Optional `?id=` from the URL; preselects one of the seller's businesses. */
  initialBusinessId?: string;
}

/**
 * Seller-facing verification manager.
 *
 * - Reads the seller's businesses from `GET /api/v1/businesses/me`.
 * - Reads existing documents from `GET /api/v1/businesses/:id/documents`.
 * - Uploads via `POST /api/v1/businesses/:id/documents` (new row, not a replace).
 * - Removes a non-approved document via `DELETE /api/v1/documents/:id`.
 * - Submits the business for review via `POST /api/v1/businesses/:id/verify`.
 *
 * The backend has no single "replace document" call; replacing means deleting the
 * old row (only possible while it is not APPROVED) and uploading the corrected
 * file. Every result shown here comes from the API — nothing is simulated.
 */
export default function SellerBusinessVerification({
  initialBusinessId,
}: SellerBusinessVerificationProps) {
  const [businesses, setBusinesses] = useState<IBusiness[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const business = useMemo(
    () => businesses.find((item) => item.id === selectedId) ?? null,
    [businesses, selectedId],
  );

  // --- Load the seller's businesses once -------------------------------------
  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);

      const result = await getMyBusinesses();
      if (!active) return;

      if (!result.ok || !result.data) {
        setLoadError(result.message);
        setIsLoading(false);
        return;
      }

      setBusinesses(result.data);
      const preferred =
        (initialBusinessId &&
          result.data.find((item) => item.id === initialBusinessId)?.id) ||
        result.data[0]?.id ||
        "";
      setSelectedId(preferred);
      setIsLoading(false);
    };

    void load();
    return () => {
      active = false;
    };
  }, [initialBusinessId]);

  // --- Load documents whenever the selected business changes -----------------
  const loadDocuments = useCallback(async (businessId: string) => {
    if (!businessId) {
      setDocuments([]);
      return;
    }
    setIsLoadingDocs(true);
    const result = await getBusinessDocuments(businessId);
    if (result.ok && result.data) {
      setDocuments(result.data);
    } else {
      setDocuments([]);
      setMessage({ tone: "error", text: result.message });
    }
    setIsLoadingDocs(false);
  }, []);

  useEffect(() => {
    void loadDocuments(selectedId);
  }, [selectedId, loadDocuments]);

  const handleFileSelect = async (
    documentType: BusinessDocumentType,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selectedId) return;

    setMessage(null);

    if (!ALLOWED_DOC_MIME.includes(file.type)) {
      setMessage({
        tone: "error",
        text: `"${file.name}" is not supported. Upload a PDF, JPG, or PNG file.`,
      });
      return;
    }
    if (file.size > MAX_DOC_SIZE) {
      setMessage({ tone: "error", text: `"${file.name}" is larger than 10MB.` });
      return;
    }

    setUploadingType(documentType);
    try {
      const result = await uploadBusinessDocument(selectedId, documentType, file);
      if (!result.ok) {
        // Surface the real server message (e.g. duplicate-file 409).
        setMessage({ tone: "error", text: result.message });
        return;
      }
      setMessage({
        tone: "success",
        text: `${humanizeDocType(documentType)} uploaded. It will show as Pending until a moderator reviews it.`,
      });
      await loadDocuments(selectedId);
    } finally {
      setUploadingType(null);
    }
  };

  const handleRemove = async (doc: BusinessDocument) => {
    setMessage(null);
    setDeletingId(doc.id);
    try {
      const result = await deleteBusinessDocument(doc.id);
      if (!result.ok) {
        setMessage({ tone: "error", text: result.message });
        return;
      }
      setMessage({
        tone: "success",
        text: `${humanizeDocType(doc.documentType)} removed. You can upload a corrected file.`,
      });
      await loadDocuments(selectedId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedId) return;
    setMessage(null);
    setIsSubmitting(true);
    try {
      const result = await submitBusinessVerification(selectedId);
      if (!result.ok || !result.data) {
        setMessage({ tone: "error", text: result.message });
        return;
      }
      setMessage({
        tone: "success",
        text: "Submitted for review. A moderator will check your documents shortly.",
      });
      // Reflect the backend result: submit moves the business to PENDING.
      setBusinesses((prev) =>
        prev.map((item) =>
          item.id === selectedId
            ? { ...item, verificationStatus: "PENDING" }
            : item,
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const latestOfType = (type: BusinessDocumentType) =>
    documents.find((doc) => doc.documentType === type) ?? null;

  const approvedCount = documents.filter((doc) => doc.status === "APPROVED").length;
  const otherDocuments = documents.filter(
    (doc) => !REQUIRED_TYPES.includes(doc.documentType),
  );

  const status = business?.verificationStatus;
  const isUnderReview = status === "PENDING";
  const isVerified = status === "VERIFIED";
  const canSubmit = Boolean(business) && !isUnderReview && !isVerified;

  // ---------------------------------------------------------------------------
  // Loading / error / empty states
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <SellerPageHeader
          icon={ShieldCheck}
          title="Business verification"
          description="Upload your business documents and submit them for review."
          backHref="/dashboard/seller/settings"
          backLabel="Settings"
        />
        <Card className="border-border/80 bg-surface shadow-surface">
          <CardContent className="space-y-5 py-8" role="status">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <SellerPageHeader
          icon={ShieldCheck}
          title="Business verification"
          description="Upload your business documents and submit them for review."
          backHref="/dashboard/seller/settings"
          backLabel="Settings"
        />
        <Alert variant="destructive">
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <SellerPageHeader
          icon={ShieldCheck}
          title="Business verification"
          description="Upload your business documents and submit them for review."
          backHref="/dashboard/seller/settings"
          backLabel="Settings"
        />
        <Card className="border-border/80 bg-surface shadow-surface">
          <CardHeader>
            <CardTitle>No business yet</CardTitle>
            <CardDescription>
              Create a business before you can verify it. Verification documents
              belong to a business, so you need one first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/seller/settings/buisnessform"
              className={buttonVariants({ className: "gap-2" })}
            >
              Create a business
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <SellerPageHeader
        icon={ShieldCheck}
        title="Business verification"
        description="Upload your business documents and submit them for review. A moderator approves documents and the business."
        backHref="/dashboard/seller/settings"
        backLabel="Settings"
      />

      {/* Business picker + current status */}
      <Card className="border-border/80 bg-surface shadow-surface">
        <CardContent className="space-y-4 pt-6">
          {businesses.length > 1 && (
            <div className="space-y-2">
              <label
                htmlFor="verification-business"
                className="text-sm font-medium text-foreground"
              >
                Business
              </label>
              <select
                id="verification-business"
                value={selectedId}
                onChange={(event) => {
                  setMessage(null);
                  setSelectedId(event.target.value);
                }}
                className="h-10 w-full max-w-md rounded-field border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                {businesses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {business && (
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {business.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isVerified
                    ? "This business is verified."
                    : isUnderReview
                      ? "Your submission is under review."
                      : status === "REJECTED"
                        ? "Your last submission was rejected. Correct your documents and submit again."
                        : "Not submitted yet."}
                </p>
              </div>
              <SellerStatusBadge status={business.verificationStatus} />
            </div>
          )}

          {message && (
            <Alert
              variant={message.tone === "error" ? "destructive" : "default"}
              className={
                message.tone === "success"
                  ? "border-success/30 bg-success-soft text-success"
                  : undefined
              }
            >
              <AlertDescription
                className={message.tone === "success" ? "text-success" : undefined}
              >
                {message.text}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card className="border-border/80 bg-surface shadow-surface">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              PDF, JPG, or PNG up to 10MB. Approved documents are locked and can
              only be changed by an administrator.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isLoadingDocs}
            onClick={() => void loadDocuments(selectedId)}
          >
            {isLoadingDocs ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Refresh
          </Button>
        </CardHeader>

        <CardContent className="space-y-3">
          {requiredBusinessDocuments.map((item) => {
            const documentType = REQUIRED_DOC_TYPES[item.id];
            if (!documentType) return null;
            const doc = latestOfType(documentType);
            const locked = isLocked(doc);
            const uploading = uploadingType === documentType;

            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-background/50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </span>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {item.label}
                      </p>
                      {doc ? (
                        <SellerStatusBadge status={doc.status ?? "PENDING"} />
                      ) : (
                        <Badge variant="outline">Not uploaded</Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {doc
                        ? `Uploaded ${formatDate(doc.uploadedAt)}`
                        : item.description}
                    </p>
                    {doc?.status === "REJECTED" && doc.rejectionReason && (
                      <p className="text-xs text-danger">
                        Reason: {doc.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {doc && (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                        className: "gap-1.5",
                      })}
                    >
                      <ExternalLink className="size-4" />
                      View
                    </a>
                  )}

                  {uploading ? (
                    <Badge variant="warning">Uploading…</Badge>
                  ) : locked ? (
                    <Badge variant="success">Approved</Badge>
                  ) : (
                    <>
                      <input
                        ref={(node) => {
                          fileInputs.current[documentType] = node;
                        }}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                        className="sr-only"
                        aria-label={`Choose ${item.label}`}
                        onChange={(event) =>
                          void handleFileSelect(documentType, event)
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={uploadingType !== null}
                        onClick={() => fileInputs.current[documentType]?.click()}
                      >
                        <UploadCloud className="size-4" />
                        {doc ? "Replace" : "Upload"}
                      </Button>

                      {doc && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-danger"
                          disabled={deletingId === doc.id}
                          onClick={() => void handleRemove(doc)}
                        >
                          {deletingId === doc.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                          Remove
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {otherDocuments.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium text-muted-foreground">
                Other documents
              </p>
              {otherDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/50 p-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm text-foreground">
                      {humanizeDocType(doc.documentType)}
                    </span>
                    <SellerStatusBadge status={doc.status ?? "PENDING"} />
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({
                      variant: "ghost",
                      size: "sm",
                      className: "gap-1.5",
                    })}
                  >
                    <ExternalLink className="size-4" />
                    View
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <Card className="border-border/80 bg-surface shadow-surface">
        <CardHeader>
          <CardTitle>Submit for review</CardTitle>
          <CardDescription>
            At least one <strong>approved</strong> document is required before you
            can submit. The backend checks this and returns an error if it is not
            met.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {approvedCount > 0
              ? `${approvedCount} approved document${approvedCount === 1 ? "" : "s"} ready.`
              : "No approved documents yet. Upload the required documents and wait for approval."}
          </p>
          <Button
            type="button"
            className="gap-2"
            disabled={!canSubmit || isSubmitting}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {isVerified
              ? "Already verified"
              : isUnderReview
                ? "Under review"
                : "Submit for review"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
