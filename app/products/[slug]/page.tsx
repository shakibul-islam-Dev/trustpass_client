// File: app/products/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { cache } from "react";
import { ArrowLeft } from "lucide-react";
import { fetchAllProducts } from "@/lib/admin_api/get-products";
import { getBusinessById } from "@/lib/business-api/all-business";
import { createPageMetadata } from "@/lib/page-metadata";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

const getProducts = cache(() =>
  fetchAllProducts({ page: 1, limit: 100 })
);

const getProductBySlug = cache(async (slug: string) => {
  const target = slug.toLowerCase().trim();
  const products = await getProducts();
  return products.find(
    (product) =>
      product.slug?.toLowerCase() === target ||
      product.id.toLowerCase() === target
  );
});

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      ...createPageMetadata(
        "Product Not Found",
        "This TrustPass product is unavailable or may have been removed."
      ),
      robots: { index: false, follow: false },
    };
  }

  const description =
    product.description?.trim() ||
    `View ${product.name}, listed by a business on TrustPass.`;
  const canonicalSlug = product.slug || product.id;

  return {
    ...createPageMetadata(product.name, description),
    alternates: {
      canonical: `/products/${encodeURIComponent(canonicalSlug)}`,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return (
      <main className="min-h-screen bg-background px-4 py-20 text-center font-sans text-foreground">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
          <span className="text-4xl" aria-hidden="true">📦</span>
          <h1 className="mt-4 text-2xl font-bold">Product Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The product you are looking for does not exist or may have been removed.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            ← Back to Product Catalog
          </Link>
        </div>
      </main>
    );
  }

  const businessResponse = await getBusinessById(product.businessId);
  const business = businessResponse.success ? businessResponse.data : undefined;
  const galleryImages = product.images ?? [];
  const isInStock = product.stock > 0;
  const businessPath = business
    ? `/businesses/${encodeURIComponent(business.slug || business.id)}`
    : "/businesses";

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/products" className="transition hover:text-primary">
            Products
          </Link>
          <span>/</span>
          <span className="truncate font-medium text-foreground">
            {product.name}
          </span>
        </div>

        {/* Product Card */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="grid gap-8 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            {/* Gallery Images */}
            <div className="space-y-4">
              <div className="flex h-80 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/30 sm:h-96">
                {galleryImages[0] ? (
                  <Image
                    src={galleryImages[0]}
                    alt={product.name}
                    width={800}
                    height={800}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">No product image</span>
                )}
              </div>
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {galleryImages.slice(1).map((imageUrl, index) => (
                    <div
                      key={`${imageUrl}-${index}`}
                      className="overflow-hidden rounded-xl border border-border bg-muted/20"
                    >
                      <Image
                        src={imageUrl}
                        alt={`${product.name} thumbnail ${index + 2}`}
                        width={200}
                        height={200}
                        className="h-20 w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta & Actions */}
            <div className="space-y-6">
              <div>
                {business && (
                  <Link
                    href={businessPath}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
                  >
                    <span>Sold by {business.name}</span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                )}
                <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  {product.name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Product ID: <span className="font-mono">{product.id}</span>
                </p>
              </div>

              {/* Price & Stock */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-3xl font-extrabold">
                  ${Number(product.price).toFixed(2)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {product.currency}
                  </span>
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isInStock
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-rose-500/10 text-rose-600"
                  }`}
                >
                  {isInStock ? `In Stock (${product.stock} units)` : "Out of Stock"}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {product.status}
                </span>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {product.description || "No description available."}
                </p>
              </div>

              {/* Business Info Card */}
              {business && (
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {business.logoUrl ? (
                        <Image
                          src={business.logoUrl}
                          alt={business.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full border border-border object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                          {business.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold">{business.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {business.businessType} · Verified Vendor
                        </p>
                      </div>
                    </div>
                    <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      {business.trustScore} Trust
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  Contact Seller
                </button>
                {business && (
                  <Link
                    href={businessPath}
                    className="flex-1 rounded-xl border border-border bg-card px-6 py-3 text-center text-sm font-semibold text-foreground transition hover:bg-muted"
                  >
                    View Business Profile
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <Link
            href="/products"
            className={cn(buttonVariants({ variant: "ghost" }), "gap-2")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </div>
      </div>
    </main>
  );
}