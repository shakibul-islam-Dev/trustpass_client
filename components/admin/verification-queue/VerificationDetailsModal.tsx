"use client";

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
import { FileText, ExternalLink } from "lucide-react";
import type { IVerificationResponse } from "@/lib/admin_api/get-verifications";

interface VerificationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: IVerificationResponse | null;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export const VerificationDetailsModal = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
}: VerificationDetailsModalProps) => {
  if (!request) return null;

  const trustScore = request.trustScore ?? 0;
  const documents = request.documents ?? [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verification Details</DialogTitle>
          <DialogDescription>
            Review the documents submitted for{" "}
            <strong>{request.businessName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Business Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Owner</p>
              <p className="font-medium">{request.ownerName || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Trade License</p>
              <p className="font-medium">{request.tradeLicenseNo || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-medium">{request.category || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Trust Score</p>
              <Badge variant={trustScore >= 80 ? "default" : "secondary"}>
                {trustScore}
              </Badge>
            </div>
          </div>

          {/* Documents List */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Uploaded Documents:
            </p>
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No documents uploaded.
              </p>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-md bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {(doc.documentType || "UNKNOWN").replace(/_/g, " ")}
                      </span>
                      {doc.uploadedAt && (
                        <span className="text-xs text-muted-foreground">
                          Uploaded: {doc.uploadedAt}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(doc.fileUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="min-w-24 px-4"
          >
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onReject(request.id);
              onClose();
            }}
            disabled={request.status === "REJECTED"}
            className="min-w-24 px-4"
          >
            Reject
          </Button>
          <Button
            onClick={() => {
              onApprove(request.id);
              onClose();
            }}
            disabled={request.status === "APPROVED"}
            className="min-w-24 px-4"
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};