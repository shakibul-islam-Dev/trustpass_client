"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, Loader2, Save, X } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getProduct, updateProduct, type ProductImage, type ProductRecord } from "@/lib/core/product-api";
import { getCategories } from "@/lib/categories-api";
import type { ICategory } from "@/types/categories";

/** The exact values the server's updateProductSchema accepts. */
const CURRENCIES = ["BDT", "USD", "INR", "GBP", "EUR"] as const;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB — matches the server's multer limit
const MAX_IMAGES = 10; // server caps a product at 10 images total

interface ProductUpdateComponentProps {
  /** The product being edited. Fetched from GET /api/v1/products/:id. */
  productId: string;
  /** Optional — pass to avoid an extra categories request. */
  categories?: ICategory[];
  onSaved?: (updated: ProductRecord) => void;
  onCancel?: () => void;
}

export default function ProductUpdateComponent({
  productId,
  categories: initialCategories,
  onSaved,
  onCancel,
}: ProductUpdateComponentProps) {
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [categories, setCategories] = useState<ICategory[]>(initialCategories ?? []);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Scalar fields — mirrors the server's updateProductSchema.
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>("BDT");
  const [description, setDescription] = useState("");

  // Image management.
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [removedPublicIds, setRemovedPublicIds] = useState<Set<string>>(new Set());
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImageUrls, setNewImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Clean up object URLs created for new-image previews.
  useEffect(() => {
    return () => newImageUrls.forEach((url) => URL.revokeObjectURL(url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const productResult = await getProduct(productId);
        if (active && (!productResult.ok || !productResult.data)) {
          setLoadError(productResult.message);
          setIsLoading(false);
          return;
        }
        if (!active) return;

        const loaded = productResult.data!;
        setProduct(loaded);
        setName(loaded.name);
        setCategoryId(loaded.categoryId ?? "");
        setPrice(loaded.price !== null && loaded.price !== undefined ? String(loaded.price) : "");
        setStock(loaded.stock !== null && loaded.stock !== undefined ? String(loaded.stock) : "");
        setCurrency((CURRENCIES as readonly string[]).includes(loaded.currency) ? (loaded.currency as (typeof CURRENCIES)[number]) : "BDT");
        setDescription(loaded.description ?? "");
        setExistingImages(loaded.images ?? []);
        setRemovedPublicIds(new Set());
        setNewImages([]);
        setNewImageUrls([]);

        if (initialCategories && initialCategories.length > 0) {
          setCategories(initialCategories);
        } else {
          const categoryResult = await getCategories();
          if (active && categoryResult.success && categoryResult.data) {
            setCategories(categoryResult.data);
          }
        }
      } catch (loadErr) {
        console.error("Could not load product:", loadErr);
        if (active) setLoadError(loadErr instanceof Error ? loadErr.message : "Could not load this product.");
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [productId, initialCategories]);

  const retainedImages = useCallback(
    () => existingImages.filter((image) => !removedPublicIds.has(image.publicId)),
    [existingImages, removedPublicIds],
  );

  const toggleRemoveExisting = (publicId: string) => {
    setRemovedPublicIds((current) => {
      const next = new Set(current);
      if (next.has(publicId)) next.delete(publicId);
      else next.add(publicId);
      return next;
    });
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

    const room = MAX_IMAGES - retainedImages().length;
    if (newImages.length + valid.length > room) {
      validationError = `A product can have at most ${MAX_IMAGES} images. Remove some first.`;
      valid.length = Math.max(0, room - newImages.length);
    }

    if (validationError) setError(validationError);

    setNewImages((current) => [...current, ...valid]);
    setNewImageUrls((current) => [...current, ...valid.map((file) => URL.createObjectURL(file))]);
    event.target.value = "";
  };

  const handleRemoveNewImage = (index: number) => {
    URL.revokeObjectURL(newImageUrls[index]);
    setNewImages((current) => current.filter((_, i) => i !== index));
    setNewImageUrls((current) => current.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) return;

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError("Product name must be at least 2 characters.");
      return;
    }

    const parsedPrice = Number(price);
    if (price.trim() === "" || Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Please enter a valid price (0 or more).");
      return;
    }

    let parsedStock: number | undefined;
    if (stock.trim() !== "") {
      parsedStock = Number(stock);
      if (!Number.isInteger(parsedStock) || parsedStock < 0) {
        setError("Stock must be a whole number of 0 or more.");
        return;
      }
    }

    const kept = retainedImages();
    if (kept.length + newImages.length > MAX_IMAGES) {
      setError(`A product can have at most ${MAX_IMAGES} images.`);
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    const result = await updateProduct(
      product.id,
      {
        name: trimmedName,
        categoryId: categoryId || undefined,
        description: description.trim() || undefined,
        price: parsedPrice,
        currency,
        stock: parsedStock,
      },
      {
        retainImagePublicIds: removedPublicIds.size > 0 ? kept.map((image) => image.publicId) : undefined,
        newImages: newImages.length > 0 ? newImages : undefined,
      },
    );

    setIsSaving(false);

    if (!result.ok || !result.data) {
      setError(result.message);
      setMessage(null);
      return;
    }

    setProduct(result.data);
    setExistingImages(result.data.images ?? []);
    setRemovedPublicIds(new Set());
    setNewImages([]);
    newImageUrls.forEach((url) => URL.revokeObjectURL(url));
    setNewImageUrls([]);
    setMessage("Product updated on the server.");
    onSaved?.(result.data);
  };

  if (isLoading) {
    return (
      <div className="space-y-4" role="status">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <Card className="border-border/80 bg-surface shadow-surface">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertDescription>
              {loadError ?? "Could not load this product. It may have been deleted."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const visibleExisting = existingImages.filter((image) => !removedPublicIds.has(image.publicId));

  return (
    <Card className="border-border/80 bg-surface shadow-surface">
      <CardHeader>
        <CardTitle>Update product</CardTitle>
        <CardDescription>
          Changes are saved to the server (fields follow the product API).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4 shadow-surface">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert className="mb-4 border-success/30 bg-success-soft text-success shadow-surface">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="update-name">Name *</Label>
              <Input
                id="update-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={255}
                placeholder="e.g. Handmade jute bag"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-category">Category</Label>
              <select
                id="update-category"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="h-10 w-full rounded-field border border-border bg-background px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
              >
                <option value="">Uncategorized</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-currency">Currency</Label>
              <select
                id="update-currency"
                value={currency}
                onChange={(event) => setCurrency(event.target.value as (typeof CURRENCIES)[number])}
                className="h-10 w-full rounded-field border border-border bg-background px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
              >
                {CURRENCIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-price">Price *</Label>
              <Input
                id="update-price"
                type="number"
                min="0"
                step="any"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-stock">Stock quantity</Label>
              <Input
                id="update-stock"
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="update-description">Description</Label>
              <Textarea
                id="update-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={10000}
                rows={4}
                placeholder="Describe this product…"
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">Images</p>
                <p className="text-xs text-muted-foreground">
                  Up to {MAX_IMAGES} images · PNG, JPG, WEBP · max 5 MB each
                </p>
              </div>
              <Badge variant="outline">
                {visibleExisting.length} kept + {newImages.length} new
              </Badge>
            </div>

            {(existingImages.length > 0 || newImages.length > 0) && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {existingImages.map((image) => {
                  const isRemoved = removedPublicIds.has(image.publicId);
                  return (
                    <div
                      key={image.publicId}
                      className={`relative aspect-square overflow-hidden rounded-xl border ${
                        isRemoved ? "border-danger/60 opacity-40" : "border-border"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.url} alt={product.name} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => toggleRemoveExisting(image.publicId)}
                        className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-danger"
                        aria-label={isRemoved ? `Keep ${product.name} image` : `Remove ${product.name} image`}
                      >
                        <X className="size-3.5" />
                      </button>
                      {isRemoved && (
                        <span className="absolute bottom-1.5 left-1.5 rounded bg-danger/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          Will be removed
                        </span>
                      )}
                    </div>
                  );
                })}

                {newImages.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="relative aspect-square overflow-hidden rounded-xl border border-border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={newImageUrls[index]} alt={file.name} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-danger"
                      aria-label="Remove new image"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              id="update-product-images"
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              multiple
              className="sr-only"
              onChange={handleAddImages}
            />
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="size-4" />
              Add images
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSaving} className="gap-2">
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}