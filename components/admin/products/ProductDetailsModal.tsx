"use client";

import { useState } from "react";
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
  Package,
  Hash,
  Tag,
  Copy,
  Check,
  Calendar,
  DollarSign,
  Layers,
  FileText,
  ImageOff,
  Store,
  User,
  Mail,
  Trash2,
} from "lucide-react";
import type { IProductResponse } from "@/lib/admin_api/get-products";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: IProductResponse | null;
  onDelete: (product: IProductResponse) => void;
}

const getStatusVariant = (status: string | undefined) => {
  switch (String(status || "ACTIVE").toUpperCase()) {
    case "ACTIVE":
      return "default";
    case "DRAFT":
      return "outline";
    case "INACTIVE":
      return "secondary";
    case "OUT_OF_STOCK":
    case "SUSPENDED":
      return "destructive";
    default:
      return "outline";
  }
};

const formatPrice = (price: number, currency: string = "BDT") => {
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString()}`;
  }
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
      className="group inline-flex items-start gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition break-all text-left"
      title="Click to copy"
    >
      <span className="break-all">{id}</span>
      {copied ? (
        <Check className="h-3 w-3 text-success shrink-0 mt-0.5" />
      ) : (
        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition shrink-0 mt-0.5" />
      )}
    </button>
  );
};

export const ProductDetailsModal = ({
  isOpen,
  onClose,
  product,
  onDelete,
}: ProductDetailsModalProps) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const images = product.images ?? [];
  const activeImage = images[activeImageIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {/* 🆕 Header with business logo */}
          <div className="flex items-start gap-3">
            {/* Business Logo */}
            <div className="relative size-12 rounded-lg bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
              {product.businessLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.businessLogo}
                  alt={product.businessName || "Business"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-4 w-4 shrink-0" />
                <span className="truncate">{product.name}</span>
              </DialogTitle>
              {product.businessName && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  by <span className="font-medium">{product.businessName}</span>
                  {product.businessSlug && (
                    <span className="text-muted-foreground">
                      {" "}
                      · @{product.businessSlug}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
          <DialogDescription className="sr-only">
            Product details and information.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-5">
          {/* Status + price badges */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant={getStatusVariant(product.status)}>
              {String(product.status || "ACTIVE").replace(/_/g, " ")}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <DollarSign className="h-3 w-3" />
              {formatPrice(product.price, product.currency)}
            </Badge>
            <Badge
              variant={product.stock > 0 ? "outline" : "destructive"}
              className="gap-1"
            >
              <Layers className="h-3 w-3" />
              Stock: {product.stock}
            </Badge>
          </div>

          {/* Image Gallery */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">
              Product Image{images.length > 1 ? "s" : ""}
            </p>

            {images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 bg-muted/40 border border-border rounded-md text-muted-foreground gap-2">
                <ImageOff className="h-8 w-8" />
                <p className="text-xs">No images uploaded</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative w-full h-64 bg-muted/40 border border-border rounded-md overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative size-16 rounded-md border overflow-hidden shrink-0 transition ${
                          idx === activeImageIndex
                            ? "border-primary ring-2 ring-primary/40"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          {product.description ? (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Description
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No description provided.
            </p>
          )}

          {/* Business Info */}
          {product.businessName && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  Business Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Store className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-muted-foreground">Business Name</p>
                      <p className="font-medium">{product.businessName}</p>
                      {product.businessSlug && (
                        <p className="text-xs text-muted-foreground">
                          @{product.businessSlug}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Business ID — copyable */}
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <Hash className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 w-full">
                      <p className="text-muted-foreground">Business ID</p>
                      <CopyableId
                        id={product.businessId}
                        label="Business ID"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Owner Info */}
          {product.ownerName && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  Owner Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">{product.ownerName}</p>
                    </div>
                  </div>

                  {product.ownerEmail && (
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium break-all">
                          {product.ownerEmail}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 🆕 Owner ID — copyable */}
                  {product.ownerId && (
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 w-full">
                        <p className="text-muted-foreground">User ID</p>
                        <CopyableId
                          id={product.ownerId}
                          label="User ID"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-muted-foreground">Slug</p>
                <p className="font-medium break-all">{product.slug || "-"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">
                  {product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>

            {product.updatedAt && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-muted-foreground">Updated</p>
                  <p className="font-medium">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Internal IDs */}
          <details className="group">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground select-none">
              Show internal IDs
            </summary>
            <div className="mt-3 space-y-2 text-xs font-mono bg-muted/40 p-3 rounded-md border border-border">
              <div className="flex items-start gap-2">
                <Hash className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 w-full">
                  <p className="text-muted-foreground">Product ID</p>
                  <CopyableId id={product.id} label="Product ID" />
                </div>
              </div>

              {product.categoryId && (
                <div className="flex items-start gap-2">
                  <Tag className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 w-full">
                    <p className="text-muted-foreground">Category ID</p>
                    <CopyableId
                      id={product.categoryId}
                      label="Category ID"
                    />
                  </div>
                </div>
              )}
            </div>
          </details>
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button variant="outline" onClick={onClose} className="min-w-24">
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onDelete(product);
              onClose();
            }}
            className="min-w-24"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};