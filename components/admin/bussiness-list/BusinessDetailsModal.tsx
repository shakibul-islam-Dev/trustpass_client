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
import { MapPin, Phone, Mail, Package, Star, FileText } from "lucide-react";
import type { Business } from "@/types/admin";

interface BusinessDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business | null;
}

// Map verification status to Badge variant
// Backend can return PENDING | UNDER_REVIEW | APPROVED | REJECTED | SUSPENDED | VERIFIED.
// The frontend type narrows to PENDING | VERIFIED | REJECTED, so we normalize.
const getStatusVariant = (status: string | undefined) => {
  switch (String(status || "PENDING").toUpperCase()) {
    case "VERIFIED":
    case "APPROVED":
      return "default";
    case "REJECTED":
    case "SUSPENDED":
      return "destructive";
    default:
      return "secondary";
  }
};

export const BusinessDetailsModal = ({
  isOpen,
  onClose,
  business,
}: BusinessDetailsModalProps) => {
  if (!business) return null;

  const statusLabel = (business.verificationStatus || "PENDING").replace(
    /_/g,
    " "
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
          <div className="flex gap-2 flex-wrap">
            <Badge variant={getStatusVariant(business.verificationStatus as string)}>
              {String(business.verificationStatus || "PENDING").replace(/_/g, " ")}
            </Badge>
            <Badge
              variant={
                business.trustScore >= 80
                  ? "default"
                  : business.trustScore >= 50
                    ? "secondary"
                    : "destructive"
              }
            >
              Trust Score: {business.trustScore}
            </Badge>
            <Badge variant="outline">{business.category}</Badge>
          </div>

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

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};