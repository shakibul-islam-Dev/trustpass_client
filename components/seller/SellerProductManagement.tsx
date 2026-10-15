"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { AlertCircle, Eye, ImagePlus, PencilLine, Plus, Search, Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  createProduct,
  deleteProduct,
  getBusinessProducts,
  updateProduct,
  type ProductInput,
  type ProductRecord as ApiProductRecord,
} from "@/lib/core/product-api";

export interface ProductRecord {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  price: string;
  stock: number;
  status: "Published" | "Draft";
  description: string;
}

const emptyProduct: ProductRecord = {
  id: "",
  name: "",
  category: "",
  categoryId: "",
  price: "",
  stock: 0,
  status: "Draft",
  description: "",
};
const emptyProducts: ProductRecord[] = [];
const emptyCategories: { id: string; name: string }[] = [];

/** Image rules — kept identical to ProductUpdateComponent so create and edit match. */
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB — matches the server's multer limit
const MAX_IMAGES = 10; // server caps a product at 10 images total

/** Looks like a UUID — the server's categoryId column is a UUID. */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const toApiStatus = (status: ProductRecord["status"]): "ACTIVE" | "DRAFT" =>
  status === "Published" ? "ACTIVE" : "DRAFT";

const toInput = (draft: ProductRecord): ProductInput => ({
  name: draft.name.trim(),
  categoryId: UUID_PATTERN.test(draft.categoryId.trim()) ? draft.categoryId.trim() : undefined,
  price: Number(draft.price),
  description: draft.description.trim() || undefined,
  stock: draft.stock,
  status: toApiStatus(draft.status),
});

const toRecord = (
  product: ApiProductRecord,
  categories: { id: string; name: string }[],
): ProductRecord => ({
  id: product.id,
  name: product.name,
  categoryId: product.categoryId ?? "",
  category:
    categories.find((item) => item.id === product.categoryId)?.name ??
    product.categoryId ??
    "",
  price: String(product.price),
  stock: product.stock,
  status: product.status === "ACTIVE" ? "Published" : product.status === "DRAFT" ? "Draft" : "Draft",
  description: product.description ?? "",
});

interface SellerProductManagementProps {
  /** When provided, products are loaded from and saved to the server. */
  businessId?: string;
  products?: ProductRecord[];
  categories?: { id: string; name: string }[];
  isLoading?: boolean;
  error?: string | null;
  allowCreate?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  onSave?: (product: Omit<ProductRecord, "id">, id?: string) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  /**
   * Called with the currently displayed products whenever they change.
   * Pass a stable setter (e.g. `setProducts`) so a parent can show stats.
   */
  onProductsChange?: (products: ProductRecord[]) => void;
  /** When set, each product row also links to its detail page. */
  detailHref?: (product: ProductRecord) => string;
}

export default function SellerProductManagement({
  businessId,
  products: incomingProducts,
  categories = emptyCategories,
  isLoading = false,
  error,
  allowCreate = true,
  allowEdit = true,
  allowDelete = true,
  onSave,
  onDelete,
  onProductsChange,
  detailHref,
}: SellerProductManagementProps) {
  const [serverProducts, setServerProducts] = useState<ProductRecord[] | null>(null);
  const [loading, setLoading] = useState(isLoading);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Keep the latest categories in a ref and only reload when their CONTENT
  // changes. Depending on the array itself is unsafe: parents commonly pass a
  // fresh `categories.map(...)` on every render, which would re-run the fetch
  // on each render and make the list flicker between data and "Loading…".
  const categoriesRef = useRef(categories);
  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);
  const categoriesSignature = useMemo(
    () => categories.map((category) => `${category.id}:${category.name}`).join("|"),
    [categories],
  );

  // Load from the server whenever there is a business to manage.
  useEffect(() => {
    if (!businessId) return;
    let active = true;

    // Reset the loading state before the fetch. Done in a microtask so the
    // setState calls don't run synchronously inside the effect.
    void Promise.resolve().then(() => {
      if (!active) return;
      setLoading(true);
      setLoadError(null);
    });

    void getBusinessProducts(businessId)
      .then((result) => {
        if (!active) return;
        if (!result.ok || !result.data) {
          setLoadError(result.message);
          return;
        }
        setServerProducts(result.data.map((product) => toRecord(product, categoriesRef.current)));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [businessId, reloadKey, categoriesSignature]);

  const [localProducts, setLocalProducts] = useState<ProductRecord[] | null>(null);
  const products =
    (businessId ? serverProducts : localProducts) ?? incomingProducts ?? emptyProducts;

  // Let a parent page show stats without fetching the products a second time.
  useEffect(() => {
    onProductsChange?.(products);
  }, [products, onProductsChange]);
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<ProductRecord>(emptyProduct);
  const [deleteTarget, setDeleteTarget] = useState<ProductRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Images picked while creating a product. Full image management (add/remove
  // existing images) lives on the product detail page.
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImageUrls, setNewImageUrls] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Revoke the preview object URLs when the component unmounts.
  useEffect(() => {
    return () => newImageUrls.forEach((url) => URL.revokeObjectURL(url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearNewImages = () => {
    newImageUrls.forEach((url) => URL.revokeObjectURL(url));
    setNewImages([]);
    setNewImageUrls([]);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleAddImages = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files ?? []);
    const valid: File[] = [];
    let validationError: string | null = null;

    for (const file of incoming) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        validationError = `"${file.name}" isn't a supported image type. Use PNG, JPG, or WEBP.`;
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        validationError = `"${file.name}" is larger than 5 MB.`;
        continue;
      }
      valid.push(file);
    }

    const room = MAX_IMAGES - newImages.length;
    if (valid.length > room) {
      validationError = `A product can have at most ${MAX_IMAGES} images.`;
      valid.length = Math.max(0, room);
    }

    setActionError(validationError);
    setNewImages((current) => [...current, ...valid]);
    setNewImageUrls((current) => [...current, ...valid.map((file) => URL.createObjectURL(file))]);
    event.target.value = "";
  };

  const handleRemoveNewImage = (index: number) => {
    URL.revokeObjectURL(newImageUrls[index]);
    setNewImages((current) => current.filter((_, i) => i !== index));
    setNewImageUrls((current) => current.filter((_, i) => i !== index));
  };

  const filteredProducts = useMemo(
    () => products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase())),
    [products, query],
  );

  const openCreate = () => {
    setDraft(emptyProduct);
    clearNewImages();
    setActionError(null);
    setActionMessage(null);
    setEditorOpen(true);
  };

  const openEdit = (product: ProductRecord) => {
    setDraft(product);
    clearNewImages();
    setActionError(null);
    setActionMessage(null);
    setEditorOpen(true);
  };

  const reload = () => setReloadKey((key) => key + 1);

  const saveDraft = async () => {
    if (!draft.name.trim() || !draft.categoryId || !draft.price.trim()) return;
    setIsSaving(true);
    setActionError(null);
    setActionMessage(null);
    try {
      if (businessId) {
        if (draft.id) {
          const result = await updateProduct(draft.id, toInput(draft));
          if (!result.ok) {
            setActionError(result.message);
            return;
          }
        } else {
          const result = await createProduct(
            businessId,
            toInput(draft),
            newImages.length > 0 ? newImages : undefined,
          );
          if (!result.ok) {
            setActionError(result.message);
            return;
          }
          clearNewImages();
        }
        setActionMessage(draft.id ? "Product updated." : "Product added.");
        reload();
      } else if (onSave) {
        const { id, ...productInput } = draft;
        await onSave(productInput, id || undefined);
        setActionMessage("Product saved.");
      } else if (draft.id) {
        setLocalProducts((current) => (current ?? incomingProducts ?? []).map((product) => product.id === draft.id ? { ...draft, id: draft.id } : product));
        setActionMessage("Product updated (local preview).");
      } else {
        setLocalProducts((current) => [{ ...draft, id: `local-${Date.now()}` }, ...(current ?? incomingProducts ?? [])]);
        setActionMessage("Product added (local preview).");
      }
      setEditorOpen(false);
    } catch (error) {
      console.error("Could not save product:", error);
      setActionError(error instanceof Error ? error.message : "Could not save this product.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      setIsDeleting(true);
      setActionError(null);
      setActionMessage(null);
      try {
        if (businessId) {
          const result = await deleteProduct(deleteTarget.id);
          if (!result.ok) {
            setActionError(result.message);
            return;
          }
          setActionMessage("Product deleted.");
          reload();
        } else if (onDelete) {
          await onDelete(deleteTarget.id);
          setActionMessage("Product deleted.");
        } else {
          setLocalProducts((current) => (current ?? incomingProducts ?? []).filter((product) => product.id !== deleteTarget.id));
          setActionMessage("Product deleted (local preview).");
        }
        setDeleteTarget(null);
      } catch (error) {
        console.error("Could not delete product:", error);
        setActionError(error instanceof Error ? error.message : "Could not delete this product.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <>
      <Card className="border-border/80 bg-surface shadow-surface">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                {businessId
                  ? "Manage your catalog. Changes are saved to the server."
                  : "Manage your catalog and availability."}
              </CardDescription>
            </div>
            <Button type="button" className="gap-2" onClick={openCreate} disabled={!allowCreate}>
              <Plus className="size-4" />
              Add product
            </Button>
          </div>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="h-10 pl-10" />
          </div>
        </CardHeader>

        <CardContent>
          {(error || loadError) && (
            <div role="alert" className="mb-3 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
              {error ?? loadError}
            </div>
          )}
          {actionError && (
            <Alert variant="destructive" className="mb-3 shadow-surface">
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}
          {actionMessage && (
            <Alert className="mb-3 border-success/30 bg-success-soft text-success shadow-surface">
              <AlertDescription>{actionMessage}</AlertDescription>
            </Alert>
          )}
          {businessId && !businessId.trim() && (
            <Alert className="mb-3 border-warning/30 bg-warning/5 text-warning shadow-surface">
              <AlertCircle className="size-4" />
              <AlertDescription>A business must be selected to manage products.</AlertDescription>
            </Alert>
          )}
          {isLoading || loading ? (
            <div role="status" className="rounded-xl border border-border bg-background/40 px-4 py-10 text-center text-sm text-muted-foreground">Loading products…</div>
          ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <article key={product.id} className="flex flex-col gap-4 rounded-xl border border-border bg-background/40 p-4 sm:flex-row sm:items-center">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-surface-secondary text-muted-foreground">
                  <ImagePlus className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-foreground">{product.name}</h3>
                    <Badge variant={product.status === "Published" ? "success" : "outline"}>{product.status}</Badge>
                    {product.stock === 0 && <Badge variant="warning">Out of stock</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{product.category || "Uncategorized"} · {product.stock} in stock</p>
                </div>
                <p className="font-semibold tabular-nums text-foreground">{product.price}</p>
                <div className="flex gap-2">
                  {detailHref && (
                    <Link
                      href={detailHref(product)}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      <Eye className="size-4" />
                      Details
                    </Link>
                  )}
                  {allowEdit && (
                    <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => openEdit(product)}>
                      <PencilLine className="size-4" />
                      Edit
                    </Button>
                  )}
                  {allowDelete && (
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete ${product.name}`} onClick={() => setDeleteTarget(product)}>
                      <Trash2 className="size-4 text-danger" />
                    </Button>
                  )}
                </div>
              </article>
            ))}
            {filteredProducts.length === 0 && (
              <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                {products.length ? "No products match your search." : "No products yet. Add a product to start your catalog."}
              </div>
            )}
          </div>
          )}
          {!businessId && !onSave && !onDelete && <p className="mt-4 text-xs text-muted-foreground">Local preview mode. Connect a business to save changes to your account.</p>}
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{draft.id ? "Edit product" : "Add product"}</DialogTitle>
            <DialogDescription>Enter a clear name, category, price, and inventory count.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="product-name">Product name</Label>
              <Input id="product-name" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-category">Category</Label>
              <select
                id="product-category"
                value={draft.categoryId}
                onChange={(event) => {
                  const category = categories.find((item) => item.id === event.target.value);
                  setDraft((current) => ({
                    ...current,
                    categoryId: category?.id ?? "",
                    category: category?.name ?? "",
                  }));
                }}
                className="h-10 w-full rounded-field border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-price">Price</Label>
              <Input id="product-price" value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-stock">Stock quantity</Label>
              <Input id="product-stock" type="number" min="0" value={draft.stock} onChange={(event) => setDraft((current) => ({ ...current, stock: Math.max(0, Number(event.target.value)) }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="product-description">Description</Label>
              <Textarea id="product-description" value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
            </div>
            {!draft.id && businessId && (
              <div className="space-y-3 sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Label>Product images</Label>
                    <p className="text-xs text-muted-foreground">
                      Optional · up to {MAX_IMAGES} images · PNG, JPG, WEBP · max 5 MB each
                    </p>
                  </div>
                  {newImages.length > 0 && <Badge variant="outline">{newImages.length} selected</Badge>}
                </div>

                {newImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                    {newImages.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="relative aspect-square overflow-hidden rounded-xl border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={newImageUrls[index]} alt={file.name} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-danger"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  ref={imageInputRef}
                  id="create-product-images"
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  multiple
                  className="sr-only"
                  onChange={handleAddImages}
                />
                <Button type="button" variant="outline" className="gap-2" onClick={() => imageInputRef.current?.click()}>
                  <ImagePlus className="size-4" />
                  Add images
                </Button>
                <p className="text-xs text-muted-foreground">
                  Images are uploaded when you save. You can add or remove them later from the product page.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditorOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button type="button" disabled={isSaving || !draft.name.trim() || !draft.categoryId || !draft.price.trim()} onClick={() => void saveDraft()}>{isSaving ? "Saving…" : "Save product"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this product?</DialogTitle>
            <DialogDescription>{deleteTarget?.name} will be removed {businessId ? "from your catalog on the server" : "from this local preview"}.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Keep product</Button>
            <Button type="button" variant="destructive" onClick={() => void confirmDelete()} disabled={isDeleting}>{isDeleting ? "Deleting…" : "Delete product"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}