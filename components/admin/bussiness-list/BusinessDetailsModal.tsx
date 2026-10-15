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
  MapPin,
  Phone,
  Mail,
  Package,
  Star,
  Globe,
  // Instagram,
  Music2,
  Store,
  Building2,
  Calendar,
  Hash,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  fetchBusinessWithDetails,
  type IBusinessResponse,
} from "@/lib/admin_api/get-businesses";

interface BusinessDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: IBusinessResponse | null;
}

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

const formatAddress = (addr?: IBusinessResponse["address"]) => {
  if (!addr) return null;
  const parts = [
    addr.addressLine,
    addr.city,
    addr.district,
    addr.division,
    addr.postalCode,
    addr.country,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
};

const ensureUrl = (url?: string | null) =>
  !url ? "" : url.startsWith("http") ? url : `https://${url}`;

export const BusinessDetailsModal = ({
  isOpen,
  onClose,
  business,
}: BusinessDetailsModalProps) => {
  const [copied, setCopied] = useState(false);
  const [fullBusiness, setFullBusiness] = useState<IBusinessResponse | null>(
    business
  );
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // 🔑 Load full details when modal opens
  useEffect(() => {
    if (!isOpen || !business) {
      setFullBusiness(business);
      return;
    }

    let cancelled = false;
    setFullBusiness(business); // show list data first
    setIsLoadingDetails(true);

    (async () => {
      try {
        console.log("📥 Loading full details for:", business.id);
        const detailed = await fetchBusinessWithDetails(business);
        if (!cancelled) {
          console.log("✅ Full details merged:", detailed);
          setFullBusiness(detailed);
        }
      } catch (err) {
        console.error("❌ Details load error:", err);
      } finally {
        if (!cancelled) setIsLoadingDetails(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, business]);

  if (!business || !fullBusiness) return null;

  const b = fullBusiness;

  const statusLabel = (b.verificationStatus || "PENDING").replace(/_/g, " ");
  const fullAddress = formatAddress(b.address);

  const handleLogoClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!b.logoUrl) return;
    try {
      await navigator.clipboard.writeText(b.logoUrl);
      setCopied(true);
      toast.success("Logo URL copied!");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button
                type="button"
                onClick={handleLogoClick}
                disabled={!b.logoUrl}
                title={b.logoUrl ? "Click to copy logo URL" : "No logo"}
                className={`size-14 rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0 transition ${
                  b.logoUrl
                    ? "cursor-pointer hover:ring-2 hover:ring-primary/40"
                    : "cursor-default"
                }`}
              >
                {b.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.logoUrl}
                    alt={b.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Store className="h-6 w-6 text-muted-foreground" />
                )}
                {b.logoUrl && (
                  <span className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    {copied ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : (
                      <Copy className="h-4 w-4 text-white" />
                    )}
                  </span>
                )}
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <DialogTitle className="flex items-center gap-2">
                <span className="truncate">{b.name}</span>
                {b.isFeatured && (
                  <Star className="h-4 w-4 text-warning fill-warning shrink-0" />
                )}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5 truncate flex items-center gap-2">
                {b.slug ? `@${b.slug}` : "Business details"}
                {isLoadingDetails && (
                  <span className="inline-flex items-center gap-1 text-primary">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    loading details...
                  </span>
                )}
              </p>
            </div>
          </div>
          <DialogDescription className="sr-only">
            Business details and verification information.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-5">
          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant={getStatusVariant(b.verificationStatus as string)}>
              {statusLabel}
            </Badge>
            <Badge
              variant={
                // `trustScoreUpdatedAt` is null until the API calculates a
                // score — never treat "not scored yet" as a failing score.
                b.trustScoreUpdatedAt == null
                  ? "outline"
                  : b.trustScore >= 80
                    ? "default"
                    : b.trustScore >= 50
                      ? "secondary"
                      : "destructive"
              }
            >
              Trust Score: {b.trustScoreUpdatedAt == null ? "—" : b.trustScore}
            </Badge>
            {b.businessType && (
              <Badge variant="outline" className="gap-1">
                <Building2 className="h-3 w-3" />
                {b.businessType}
              </Badge>
            )}
          </div>

          {/* Description */}
          {b.description ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Description
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {b.description}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No description provided.
            </p>
          )}

          <Separator />

          {/* Contact */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">
              Contact Information
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium break-all">
                    {b.contactEmail || b.ownerEmail || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{b.contactPhone || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Address */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Address</p>
            {fullAddress ? (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="font-medium">{fullAddress}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No address provided.
              </p>
            )}
          </div>

          <Separator />

          {/* Social */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">
              Online Presence
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-muted-foreground">Website</p>
                  {b.websiteUrl ? (
                    <a
                      href={ensureUrl(b.websiteUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline break-all inline-flex items-center gap-1"
                    >
                      {b.websiteUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-muted-foreground italic">Not provided</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                {/* <Instagram className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /> */}
                <div className="min-w-0">
                  <p className="text-muted-foreground">Instagram</p>
                  {b.instaUrl ? (
                    <a
                      href={ensureUrl(b.instaUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline break-all inline-flex items-center gap-1"
                    >
                      {b.instaUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-muted-foreground italic">Not provided</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Music2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-muted-foreground">TikTok</p>
                  {b.tiktokUrl ? (
                    <a
                      href={ensureUrl(b.tiktokUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline break-all inline-flex items-center gap-1"
                    >
                      {b.tiktokUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-muted-foreground italic">Not provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Stats */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">
              Business Stats
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Package className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-muted-foreground">Products</p>
                  <p className="font-medium">{b.productsCount}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {b.createdAt
                      ? new Date(b.createdAt).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Hash className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-muted-foreground">Business ID</p>
                  <p className="font-medium font-mono text-xs break-all">
                    {b.id}
                  </p>
                </div>
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