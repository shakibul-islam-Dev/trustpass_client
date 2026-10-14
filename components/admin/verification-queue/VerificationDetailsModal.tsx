"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  ExternalLink,
  Loader2,
  Building2,
  Calendar,
  Hash,
  User,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Clock,
} from "lucide-react";
import {
  fetchBusinessDocuments,
  type IVerificationResponse,
  type IVerificationDocument,
} from "@/lib/admin_api/get-verifications";
import { reviewDocument } from "@/lib/admin_action/documents_action";

interface VerificationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: IVerificationResponse | null;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

const getStatusVariant = (status: string | undefined) => {
  switch (String(status || "PENDING").toUpperCase()) {
    case "APPROVED":
      return "default";
    case "REJECTED":
    case "SUSPENDED":
      return "destructive";
    default:
      return "secondary";
  }
};

const getRuleKey = (documentType: string): string => {
  const map: Record<string, string> = {
    TRADE_LICENSE: "trade_license_01",
    NID: "nid",
    TIN_CERTIFICATE: "tin_certificate",
    VAT_CERTIFICATE: "vat_certificate",
    BANK_STATEMENT: "bank_statement",
    PASSPORT: "passport",
    UTILITY_BILL: "utility_bill",
  };
  return map[documentType.toUpperCase()] || "other";
};

const CopyableId = ({ id, label }: { id: string; label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      toast.success(`${label} copied!`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition break-all text-left"
      title="Click to copy"
    >
      <span>{id}</span>
      {copied ? (
        <Check className="h-3 w-3 text-green-500 shrink-0" />
      ) : (
        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition shrink-0" />
      )}
    </button>
  );
};

export const VerificationDetailsModal = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
}: VerificationDetailsModalProps) => {
  const [documents, setDocuments] = useState<IVerificationDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [reviewingDocId, setReviewingDocId] = useState<string | null>(null);
  const [isRequestActioning, setIsRequestActioning] = useState(false);

  useEffect(() => {
    if (!isOpen || !request) return;

    if (request.documents && request.documents.length > 0) {
      setDocuments(request.documents);
      return;
    }

    if (request.businessId) {
      setIsLoadingDocs(true);
      fetchBusinessDocuments(request.businessId)
        .then(setDocuments)
        .finally(() => setIsLoadingDocs(false));
    }
  }, [isOpen, request]);

  if (!request) return null;

  const handleReviewDoc = async (
    doc: IVerificationDocument,
    status: "APPROVED" | "REJECTED"
  ) => {
    setReviewingDocId(doc.id);
    try {
      const result = await reviewDocument(doc.id, {
        ruleKey: getRuleKey(String(doc.documentType)),
        status,
      });

      if (result?.error) {
        toast.error(result.message || "Failed to review document.");
        return;
      }

      toast.success(
        `Document ${status === "APPROVED" ? "approved" : "rejected"}.`
      );

      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, status } : d))
      );
    } catch (err) {
      console.error("Review doc error:", err);
      toast.error("Something went wrong.");
    } finally {
      setReviewingDocId(null);
    }
  };

  const handleRequestApprove = async () => {
    setIsRequestActioning(true);
    try {
      await onApprove(request.id);
    } finally {
      setIsRequestActioning(false);
    }
  };

  const handleRequestReject = async () => {
    setIsRequestActioning(true);
    try {
      await onReject(request.id);
    } finally {
      setIsRequestActioning(false);
    }
  };

  const trustScore = request.trustScore ?? 0;
  const approvedCount = documents.filter(
    (d) => String(d.status).toUpperCase() === "APPROVED"
  ).length;
  const rejectedCount = documents.filter(
    (d) => String(d.status).toUpperCase() === "REJECTED"
  ).length;
  const pendingCount = documents.length - approvedCount - rejectedCount;

  const hasDocuments = documents.length > 0;

  const isRequestApproved = String(request.status).toUpperCase() === "APPROVED";
  const isRequestRejected = String(request.status).toUpperCase() === "REJECTED";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Verification Details
          </DialogTitle>
          <DialogDescription>
            Review documents for{" "}
            <strong>{request.businessName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-5">
          {/* Status — Docs badge শুধু documents থাকলে */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant={getStatusVariant(request.status)}>
              {String(request.status || "PENDING").replace(/_/g, " ")}
            </Badge>
            <Badge
              variant={
                trustScore >= 80
                  ? "default"
                  : trustScore >= 50
                  ? "secondary"
                  : "destructive"
              }
            >
              Trust: {trustScore}
            </Badge>
            {hasDocuments && (
              <Badge variant="outline">
                Docs: {approvedCount}/{documents.length} approved
              </Badge>
            )}
          </div>

          {/* Business Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-muted-foreground">Business</p>
                <p className="font-medium">{request.businessName || "-"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground">Submitted</p>
                <p className="font-medium">
                  {request.submittedAt
                    ? new Date(request.submittedAt).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>

            {request.businessSlug && (
              <div className="flex items-start gap-2">
                <Hash className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-muted-foreground">Slug</p>
                  <p className="font-medium">@{request.businessSlug}</p>
                </div>
              </div>
            )}

            {request.ownerId && (
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 w-full">
                  <p className="text-muted-foreground">Owner ID</p>
                  <CopyableId id={request.ownerId} label="Owner ID" />
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 sm:col-span-2">
              <Hash className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 w-full">
                <p className="text-muted-foreground">Business ID</p>
                <CopyableId id={request.businessId} label="Business ID" />
              </div>
            </div>
          </div>

          {/* ✅ Documents section — shudhu documents thakle */}
          {hasDocuments && (
            <>
              <Separator />

              {/* Document summary */}
              <div className="flex gap-2 flex-wrap text-xs">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {approvedCount} Approved
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <XCircle className="h-3 w-3 text-destructive" />
                  {rejectedCount} Rejected
                </Badge>
                {pendingCount > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {pendingCount} Pending
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground flex items-center justify-between">
                  <span>Documents ({documents.length})</span>
                  {isLoadingDocs && (
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  )}
                </p>

                {isLoadingDocs ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-16 bg-muted animate-pulse rounded-md"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => {
                      const isReviewing = reviewingDocId === doc.id;
                      const docStatus = String(
                        doc.status || "PENDING"
                      ).toUpperCase();
                      const isApproved = docStatus === "APPROVED";
                      const isRejected = docStatus === "REJECTED";

                      return (
                        <div
                          key={doc.id}
                          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-md transition ${
                            isApproved
                              ? "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
                              : isRejected
                              ? "bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900"
                              : "bg-muted/30 border-border"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <FileText className="h-4 w-4 text-primary shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {(doc.documentType || "UNKNOWN").replace(
                                  /_/g,
                                  " "
                                )}
                              </p>
                              <Badge
                                variant={getStatusVariant(doc.status)}
                                className="text-xs mt-1"
                              >
                                {docStatus.replace(/_/g, " ")}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(doc.fileUrl, "_blank")}
                              disabled={!doc.fileUrl || doc.fileUrl === "#"}
                            >
                              <ExternalLink className="h-3.5 w-3.5 mr-1" />
                              View
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReviewDoc(doc, "APPROVED")}
                              disabled={
                                isReviewing || isApproved || isRequestApproved
                              }
                              title={
                                isApproved
                                  ? "Already approved"
                                  : isRequestApproved
                                  ? "Request already approved"
                                  : "Approve document"
                              }
                              className={
                                isApproved
                                  ? "opacity-40 cursor-not-allowed text-green-600"
                                  : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                              }
                            >
                              {isReviewing ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReviewDoc(doc, "REJECTED")}
                              disabled={
                                isReviewing || isRejected || isRequestRejected
                              }
                              title={
                                isRejected
                                  ? "Already rejected"
                                  : isRequestRejected
                                  ? "Request already rejected"
                                  : "Reject document"
                              }
                              className={
                                isRejected
                                  ? "opacity-40 cursor-not-allowed text-destructive"
                                  : "text-destructive hover:text-destructive hover:bg-destructive/10"
                              }
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ✅ No documents banner */}
          {!hasDocuments && !isLoadingDocs && (
            <div className="text-xs p-3 rounded-md border bg-muted/40 text-muted-foreground flex items-start gap-2">
              <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>
                No documents were uploaded for this verification request.
              </span>
            </div>
          )}

          {/* Processed banner */}
          {(isRequestApproved || isRequestRejected) && (
            <div
              className={`text-xs p-3 rounded-md border flex items-start gap-2 ${
                isRequestApproved
                  ? "bg-green-50 border-green-200 text-green-900 dark:bg-green-950/30 dark:border-green-900 dark:text-green-100"
                  : "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/30 dark:border-red-900 dark:text-red-100"
              }`}
            >
              {isRequestApproved ? (
                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              )}
              <span>
                This verification request has already been{" "}
                <strong>{isRequestApproved ? "approved" : "rejected"}</strong>.
                {hasDocuments && " Documents cannot be modified."}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button variant="outline" onClick={onClose} className="min-w-24">
            Close
          </Button>

          <Button
            variant="destructive"
            onClick={handleRequestReject}
            disabled={
              isRequestRejected || isRequestApproved || isRequestActioning
            }
            title={
              isRequestRejected
                ? "Already rejected"
                : isRequestApproved
                ? "Already approved"
                : "Reject this verification request"
            }
            className={`min-w-32 ${
              isRequestRejected || isRequestApproved
                ? "opacity-40 cursor-not-allowed"
                : ""
            }`}
          >
            {isRequestActioning ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : isRequestRejected ? (
              <XCircle className="h-4 w-4 mr-1" />
            ) : null}
            {isRequestRejected ? "Rejected" : "Reject Request"}
          </Button>

          <Button
            onClick={handleRequestApprove}
            disabled={
              isRequestApproved || isRequestRejected || isRequestActioning
            }
            title={
              isRequestApproved
                ? "Already approved"
                : isRequestRejected
                ? "Already rejected"
                : "Approve this verification request"
            }
            className={`min-w-32 ${
              isRequestApproved || isRequestRejected
                ? "opacity-40 cursor-not-allowed"
                : ""
            }`}
          >
            {isRequestActioning ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : isRequestApproved ? (
              <CheckCircle2 className="h-4 w-4 mr-1" />
            ) : null}
            {isRequestApproved ? "Approved" : "Approve Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};