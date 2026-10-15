"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ImageOff, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { IProduct } from "@/lib/products-api/create-products";


interface ProductCardProps {
  product: IProduct;
}

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

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "default";
    case "OUT_OF_STOCK":
    case "INACTIVE":
      return "destructive";
    default:
      return "secondary";
  }
};

const getSafeImage = (images?: string[] | null): string | null => {
  if (!Array.isArray(images)) return null;
  const first = images.find(
    (img) => typeof img === "string" && img.trim().length > 0
  );
  return first && first.trim().length > 0 ? first : null;
};

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = getSafeImage(product.images);
  const isInStock = product.stock > 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group h-full"
    >
      <Link
        href={`/products/${product.slug || product.id}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg hover:shadow-primary/5"
      >
        {/* ✅ Image — explore business er moto choto (16:9) */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted/40">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageOff className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-2 right-2">
            <Badge variant={getStatusVariant(product.status)} className="text-xs">
              {product.status.replace(/_/g, " ")}
            </Badge>
          </div>

          {/* Out of stock */}
          {!isInStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
              <span className="rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-destructive-foreground">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content — choto padding */}
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <h3 className="line-clamp-1 text-sm font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {product.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {product.description}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <span className="text-base font-bold text-foreground">
              {formatPrice(product.price, product.currency)}
            </span>

            {isInStock && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Package className="h-3 w-3" />
                {product.stock}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}