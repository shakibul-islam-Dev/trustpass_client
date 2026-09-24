import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink, Clock, CheckCircle, XCircle } from "lucide-react";
import type { CustomerReport } from "@/types/customer";

interface ReportDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: CustomerReport | null;
}

export const CustomerReportDetailsModal = ({
  isOpen,
  onClose,
  report,
}: ReportDetailsModalProps) => {
  if (!report) return null;

  // Status icon helper
  const getStatusIcon = () => {
    switch (report.status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'RESOLVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Report Details
          </DialogTitle>
          <DialogDescription>
            Report against <strong>{report.businessName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Status Banner */}
          <div className={`p-3 rounded-md border flex items-center gap-2 ${
            report.status === 'RESOLVED' ? 'bg-green-500/10 border-green-500/20' :
            report.status === 'REJECTED' ? 'bg-destructive/10 border-destructive/20' :
            'bg-yellow-500/10 border-yellow-500/20'
          }`}>
            {getStatusIcon()}
            <div>
              <p className="text-sm font-medium">Status: {report.status}</p>
              <p className="text-xs text-muted-foreground">
                {report.status === 'PENDING' && "Your report is being reviewed by our moderators."}
                {report.status === 'RESOLVED' && "This report has been reviewed and action has been taken."}
                {report.status === 'REJECTED' && "This report was reviewed but no action was taken."}
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Business</p>
              <p className="font-medium">{report.businessName}</p>
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
              <p className="text-muted-foreground">Submitted On</p>
              <p className="font-medium">{report.createdAt}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Your Description:</p>
            <p className="text-sm p-3 border rounded-md bg-muted/30">
              {report.description}
            </p>
          </div>

          {/* Evidence */}
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

          {/* Admin Note */}
          {report.adminNote && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Admin Response:</p>
              <div className="p-3 border rounded-md bg-primary/5 border-primary/20">
                <p className="text-sm">{report.adminNote}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};