"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ImagePlus, PencilLine, Plus, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

/** Looks like a UUID — the server's categoryId column is a UUID. */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const toApiStatus = (status: ProductRecord["status"]): "ACTIVE" | "DRAFT" =>
  status === "Published" ? "ACTIVE" : "DRAFT";

const toInput = (draft: ProductRecord): ProductInput => ({
  name: draft.name.trim(),
  categoryId: UUID_PATTERN.test(draft.category.trim()) ? draft.category.trim() : undefined,
  price: Number(draft.price),
  description: draft.description.trim() || undefined,
  stock: draft.stock,
  status: toApiStatus(draft.status),
});

const toRecord = (product: ApiProductRecord): ProductRecord => ({
  id: product.id,
  name: product.name,
  categoryId: product.categoryId ?? "",
  category: product.categoryId ?? "",
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
}

export default function SellerProductManagement({
  businessId,
  products: incomingProducts,
  categories = [],
  isLoading = false,
  error,
  allowCreate = true,
  allowEdit = true,
  allowDelete = true,
  onSave,
  onDelete,
}: SellerProductManagementProps) {
  const [serverProducts, setServerProducts] = useState<ProductRecord[] | null>(null);
  const [loading, setLoading] = useState(isLoading);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Load from the server whenever there is a business to manage.
  useEffect(() => {
    if (!businessId) return;
    let active = true;

    setLoading(true);
    setLoadError(null);
    void getBusinessProducts(businessId)
      .then((result) => {
        if (!active) return;
        if (!result.ok || !result.data) {
          setLoadError(result.message);
          return;
        }
        setServerProducts(result.data.map(toRecord));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [businessId, reloadKey]);

  const [localProducts, setLocalProducts] = useState<ProductRecord[] | null>(null);
  const products =
    (businessId ? serverProducts : localProducts) ?? incomingProducts ?? emptyProducts;
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<ProductRecord>(emptyProduct);
  const [deleteTarget, setDeleteTarget] = useState<ProductRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const filteredProducts = useMemo(
    () => products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase())),
    [products, query],
  );

  const openCreate = () => {
    setDraft(emptyProduct);
    setEditorOpen(true);
  };

  const openEdit = (product: ProductRecord) => {
    setDraft(product);
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
          const result = await createProduct(businessId, toInput(draft));
          if (!result.ok) {
            setActionError(result.message);
            return;
          }
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