"use client";

import { useMemo, useState } from "react";
import { ImagePlus, PencilLine, Plus, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

interface SellerProductManagementProps {
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
  const [localProducts, setLocalProducts] = useState<ProductRecord[] | null>(null);
  const products = localProducts ?? incomingProducts ?? emptyProducts;
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<ProductRecord>(emptyProduct);
  const [deleteTarget, setDeleteTarget] = useState<ProductRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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

  const saveDraft = async () => {
    if (!draft.name.trim() || !draft.categoryId || !draft.price.trim()) return;
    setIsSaving(true);
    setActionError(null);
    try {
      const { id, ...productInput } = draft;
      if (onSave) {
        await onSave(productInput, id || undefined);
      } else if (id) {
        setLocalProducts((current) => (current ?? incomingProducts ?? []).map((product) => product.id === id ? draft : product));
      } else {
        setLocalProducts((current) => [{ ...draft, id: `local-${Date.now()}` }, ...(current ?? incomingProducts ?? [])]);
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
      try {
        if (onDelete) {
          await onDelete(deleteTarget.id);
        } else {
          setLocalProducts((current) => (current ?? incomingProducts ?? []).filter((product) => product.id !== deleteTarget.id));
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
              <CardDescription>Manage your catalog and availability.</CardDescription>
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
          {error && <p role="alert" className="mb-3 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{error}</p>}
          {actionError && <p role="alert" className="mb-3 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{actionError}</p>}
          {isLoading ? (
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
                  <p className="mt-1 text-sm text-muted-foreground">{product.category} · {product.stock} in stock</p>
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
          {!onSave && !onDelete && <p className="mt-4 text-xs text-muted-foreground">Local preview mode. Connect product handlers to save changes to your account.</p>}
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
            <DialogDescription>{deleteTarget?.name} will be removed from this local preview. This action cannot be undone.</DialogDescription>
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
