"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import type {
  IReportResponse,
  TReportStatus,
} from "@/lib/admin_api/get-reports";

interface ReportsDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: IReportResponse | null;
  onStatusUpdate: (reportId: string, status: TReportStatus) => void;
}

export const ReportDetailsModal = ({
  isOpen,
  onClose,
  report,
  onStatusUpdate,
}: ReportsDetailsModalProps) => {
  if (!report) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Details</DialogTitle>
          <DialogDescription>
            Report against <strong>{report.businessName || "Unknown"}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Customer</p>
              <p className="font-medium">{report.customerName || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Reason</p>
              <Badge variant="outline">
                {report.reason.replace(/_/g, " ")}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge>{report.status}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">
                {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {report.title && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Title:</p>
              <p className="text-sm p-3 border rounded-md bg-muted/30">
                {report.title}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Description:
            </p>
            <p className="text-sm p-3 border rounded-md bg-muted/30">
              {report.description}
            </p>
          </div>

          {report.evidenceUrls && report.evidenceUrls.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Evidence:
              </p>
              {report.evidenceUrls.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-md bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm">Evidence #{index + 1}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}

          {report.adminNote && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Admin Note:
              </p>
              <p className="text-sm p-3 border rounded-md bg-primary/5 border-primary/20">
                {report.adminNote}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 flex-wrap">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          {report.status === "PENDING" && (
            <>
              <Button
                variant="destructive"
                onClick={() => {
                  onStatusUpdate(report.id, "REJECTED");
                  onClose();
                }}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button
                onClick={() => {
                  onStatusUpdate(report.id, "RESOLVED");
                  onClose();
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Resolved
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};