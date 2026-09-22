import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink } from "lucide-react";
import type { CustomerReport } from "@/types/admin";

interface ReportDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: CustomerReport | null;
  onResolve: (reportId: string) => void;
  onReject: (reportId: string) => void;
}

export const ReportDetailsModal = ({
  isOpen,
  onClose,
  report,
  onResolve,
  onReject,
}: ReportDetailsModalProps) => {
  if (!report) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Report Details</DialogTitle>
          <DialogDescription>
            Review the report submitted against <strong>{report.businessName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Report Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Customer</p>
              <p className="font-medium">{report.customerName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Category</p>
              <Badge variant="outline">{report.category.replace("_", " ")}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Priority</p>
              <Badge variant={
                report.priority === 'HIGH' ? "destructive" :
                report.priority === 'MEDIUM' ? "secondary" :
                "outline"
              }>
                {report.priority}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant={
                report.status === 'RESOLVED' ? "default" :
                report.status === 'REJECTED' ? "destructive" :
                "secondary"
              }>
                {report.status}
              </Badge>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">{report.createdAt}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Description:</p>
            <p className="text-sm p-3 border rounded-md bg-muted/30">
              {report.description}
            </p>
          </div>

          {/* Evidence (if any) */}
          {report.evidenceUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Evidence:</p>
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm">Attached Evidence</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(report.evidenceUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button
            variant="destructive"
            onClick={() => { onReject(report.id); onClose(); }}
            disabled={report.status === 'REJECTED'}
          >
            Reject
          </Button>
          <Button
            onClick={() => { onResolve(report.id); onClose(); }}
            disabled={report.status === 'RESOLVED'}
          >
            Mark Resolved
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};