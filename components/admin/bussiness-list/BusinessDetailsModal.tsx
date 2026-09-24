import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Package, Star, FileText } from "lucide-react";
import type { Business } from "@/types/admin";

interface BusinessDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business | null;
  onToggleFeatured: (businessId: string, isFeatured: boolean) => void;
  onApprove: (businessId: string) => void;
  onReject: (businessId: string) => void;
}

export const BusinessDetailsModal = ({
  isOpen,
  onClose,
  business,
  onToggleFeatured,
  onApprove,
  onReject,
}: BusinessDetailsModalProps) => {
  if (!business) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {business.name}
            {business.isFeatured && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            )}
          </DialogTitle>
          <DialogDescription>
            Business details and verification information.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Status Badges */}
          <div className="flex gap-2">
            <Badge variant={
              business.verificationStatus === 'VERIFIED' ? "default" :
              business.verificationStatus === 'REJECTED' ? "destructive" :
              "secondary"
            }>
              {business.verificationStatus}
            </Badge>
            <Badge variant={
              business.trustScore >= 80 ? "default" :
              business.trustScore >= 50 ? "secondary" :
              "destructive"
            }>
              Trust Score: {business.trustScore}
            </Badge>
            <Badge variant="outline">{business.category}</Badge>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground">Owner Email</p>
                <p className="font-medium">{business.ownerEmail}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{business.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">{business.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground">Trade License</p>
                <p className="font-medium">{business.tradeLicenseNo}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground">Products</p>
                <p className="font-medium">{business.productsCount}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground">Joined</p>
                <p className="font-medium">{business.createdAt}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 flex-wrap">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button
            variant="secondary"
            onClick={() => onToggleFeatured(business.id, business.isFeatured)}
          >
            {business.isFeatured ? "Remove Featured" : "Mark Featured"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => { onReject(business.id); onClose(); }}
            disabled={business.verificationStatus === 'REJECTED'}
          >
            Reject
          </Button>
          <Button
            onClick={() => { onApprove(business.id); onClose(); }}
            disabled={business.verificationStatus === 'VERIFIED'}
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};