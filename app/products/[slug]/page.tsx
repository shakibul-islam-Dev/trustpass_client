import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Shield, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductGallery } from "@/components/products/ProductGallery";
import { cn } from "@/lib/utils";
import { fetchProductBySlug } from "@/lib/products-api/create-products";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
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

const getSafeImage = (images?: string[] | null): string | null => {
  if (!Array.isArray(images)) return null;
  const valid = images.filter(
    (img) => typeof img === "string" && img.trim().length > 0
  );
  return valid[0] ?? null;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const isInStock = product.stock > 0;
  const primaryImage = getSafeImage(product.images);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/products" className="hover:text-primary transition">
            Products
          </Link>
          <span>/</span>
          <span className="truncate font-medium text-foreground">
            {product.name}
          </span>
        </nav>

        {/* Product Container */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="grid gap-8 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            {/* Gallery */}
            <ProductGallery
              images={product.images ?? []}
              productName={product.name}
              fallback={primaryImage ?? undefined}
            />

            {/* Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {product.name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Product ID: <span className="font-mono">{product.id}</span>
                </p>
              </div>

              {/* Price & Stock */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-3xl font-extrabold">
                  {formatPrice(product.price, product.currency)}
                </span>
                <Badge
                  variant={isInStock ? "default" : "destructive"}
                  className="gap-1"
                >
                  <Package className="h-3 w-3" />
                  {isInStock ? `${product.stock} in stock` : "Out of Stock"}
                </Badge>
                <Badge variant="outline">
                  {product.status.replace(/_/g, " ")}
                </Badge>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base whitespace-pre-line">
                  {product.description || "No description provided."}
                </p>
              </div>

              <Separator />

              {/* Trust badge */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Verified on TrustPass</p>
                    <p className="text-xs text-muted-foreground">
                      This product is listed by a verified business.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                {/* ✅ Real <Button> — no render, no asChild */}
                <Button className="flex-1 h-12" size="lg">
                  Contact Seller
                </Button>

                {/* ✅ Plain <Link> styled with buttonVariants — NO Button wrapper */}
                <Link
                  href={`/businesses/${product.businessId}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "flex-1 h-12 gap-1"
                  )}
                >
                  View Business
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          {/* ✅ Plain <Link> — NO Button wrapper */}
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