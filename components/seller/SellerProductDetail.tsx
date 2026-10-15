"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CalendarDays, ImagePlus, PackageX, PencilLine, Tag, Trash2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getMyBusinesses } from "@/lib/core/business-api";
import { getCategories } from "@/lib/categories-api";
import { deleteProduct, getProduct, productImageUrls, type ProductRecord } from "@/lib/core/product-api";
import type { IBusiness } from "@/types/business";
import type { ICategory } from "@/types/categories";
import SellerEmptyState from "./SellerEmptyState";
import SellerPageHeader from "./SellerPageHeader";
import SellerStatusBadge from "./SellerStatusBadge";
import ProductUpdateComponent from "./ProductUpdateComponent";

const formatCurrency = (value: number) => `৳${value.toLocaleString("en-US")}`;

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

/** One product's full detail view, reachable from the catalog list. */
export default function SellerProductDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [business, setBusiness] = useState<IBusiness | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editor + delete dialog state.
  const [editorOpen, setEditorOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      setActionError(null);
      setActionMessage(null);

      try {
        const [businessResult, categoryResult] = await Promise.all([
          getMyBusinesses(),
          getCategories(),
        ]);

        if (!active) return;
        setCategories(categoryResult.success && categoryResult.data ? categoryResult.data : []);

        // GET /api/v1/products/:id — the server exposes a single-product call.
        const productResult = await getProduct(productId);
        if (!active) return;

        if (!productResult.ok || !productResult.data) {
          throw new Error(productResult.message);
        }

        const foundProduct = productResult.data;
        setProduct(foundProduct);
        setBusiness(
          businessResult.ok && businessResult.data
            ? (businessResult.data.find((item) => item.id === foundProduct.businessId) ?? null)
            : null,
        );
      } catch (loadError) {
        console.error("Could not load product:", loadError);
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Could not load this product.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [productId]);

  const openEdit = () => {
    if (!product) return;
    setActionError(null);
    setActionMessage(null);
    setEditorOpen(true);
  };

  const removeProduct = async () => {
    if (!product) return;
    setIsDeleting(true);
    setActionError(null);
    setActionMessage(null);

    try {
      const result = await deleteProduct(product.id);
      if (!result.ok) {
        setActionError(result.message);
        setConfirmDelete(false);
        return;
      }
      router.push("/dashboard/seller/products");
    } catch (deleteError) {
      console.error("Could not delete product:", deleteError);
      setActionError(
        deleteError instanceof Error ? deleteError.message : "Could not delete this product.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6" role="status">
        <div className="h-36 w-full animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="h-80 w-full animate-pulse rounded-2xl bg-muted" />
          <div className="h-80 w-full animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <SellerEmptyState
          icon={PackageX}
          title="Product not found"
          description={error ?? "This product is no longer in your catalog."}
          action={
            <Button onClick={() => router.push("/dashboard/seller/products")}>
              Back to my products
            </Button>
          }
        />
      </div>
    );
  }

  const statusLabel =
    product.status === "INACTIVE" || product.status === "DELETED"
      ? "Unavailable"
      : "Published";
  const primaryImage = productImageUrls(product.images)[0] ?? null;
  const categoryName =
    categories.find((item) => item.id === product.categoryId)?.name ??
    product.categoryId ??
    "Uncategorized";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <SellerPageHeader
        icon={Tag}
        title={product.name}
        badge={statusLabel}
        description="View and edit this product in your catalog."
        backHref="/dashboard/seller/products"
        backLabel="Back to products"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2" onClick={openEdit}>
              <PencilLine className="size-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-danger hover:border-danger/40"
              onClick={() => {
                setActionError(null);
                setActionMessage(null);
                setConfirmDelete(true);
              }}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </>
        }
      />

      {(actionError || actionMessage) && (
        <Alert
          variant={actionError ? "destructive" : "default"}
          className={
            actionMessage
              ? "border-success/30 bg-success-soft text-success shadow-surface"
              : "shadow-surface"
          }
        >
          <AlertDescription>{actionError ?? actionMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/80 bg-surface shadow-surface">
          <CardHeader>
            <CardTitle>Product details</CardTitle>
            <CardDescription>How this product looks to customers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {primaryImage ? (
              <div className="relative size-24 overflow-hidden rounded-2xl border border-border bg-surface-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={primaryImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex size-24 items-center justify-center rounded-2xl bg-surface-secondary text-muted-foreground">
                <ImagePlus className="size-10" />
              </div>
            )}

            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Description
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground">
                {product.description?.trim() || "No description added yet."}
              </p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Category
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{categoryName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Business
                </dt>
                <dd className="mt-1 truncate text-sm font-medium text-foreground">
                  {business?.name ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Added
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  {formatDate(product.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Last updated
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  {formatDate(product.updatedAt)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-surface shadow-surface">
          <CardHeader>
            <CardTitle>Pricing & inventory</CardTitle>
            <CardDescription>Sales numbers for this product.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Price
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-foreground">
                {formatCurrency(product.price)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-background/40 p-4">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  In stock
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                  {product.stock}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background/40 p-4">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Inventory value
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                  {formatCurrency(product.price * product.stock)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-4">
              <span className="text-sm font-medium text-foreground">Status</span>
              <SellerStatusBadge status={statusLabel} />
            </div>

            {product.stock === 0 && (
              <p className="rounded-xl border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
                This product is out of stock. Restock it so customers can buy it again.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit dialog — the full form matching the server's PATCH /api/v1/products/:id. */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit product</DialogTitle>
            <DialogDescription>
              Update the name, category, price, inventory, status, and photos for this product.
            </DialogDescription>
          </DialogHeader>
          <ProductUpdateComponent
            productId={product.id}
            categories={categories}
            onSaved={(updated) => {
              setProduct(updated);
              setEditorOpen(false);
            }}
            onCancel={() => setEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this product?</DialogTitle>
            <DialogDescription>
              {product.name} will be removed from your catalog on the server. This can&apos;t be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              disabled={isDeleting}
            >
              Keep product
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void removeProduct()}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}