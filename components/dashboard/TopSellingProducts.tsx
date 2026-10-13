"use client";

import Image from "next/image";
import { BarChart3, MoreHorizontal, Star } from "lucide-react";

export interface TopProduct {
  id: string;
  name: string;
  rating?: number;
  price?: number;
  image?: string;
  /** Units sold — present when real order data is available. */
  unitsSold?: number;
  /** Formatted revenue string, e.g. "৳12,000". */
  revenue?: string;
  /** Stock status label, e.g. "In stock". */
  stockStatus?: string;
}

interface TopSellingProductsProps {
  /** Real products. When empty the card shows a labelled empty state. */
  products?: TopProduct[];
  title?: string;
  pendingMessage?: string;
}

const TopSellingProducts = ({
  products = [],
  title = "Top Selling Products",
  pendingMessage,
}: TopSellingProductsProps) => {
  return (
    <div className="flex h-full w-full flex-col bg-surface rounded-2xl p-6 shadow-surface border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <button
          type="button"
          aria-label="Product list options"
          className="text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-surface-secondary text-muted-foreground">
            <BarChart3 className="w-5 h-5" />
          </span>
          <p className="mt-3 text-sm font-medium text-foreground">No sales data yet</p>
          <p className="mt-1 max-w-[15rem] text-xs leading-5 text-muted-foreground">
            {pendingMessage ??
              "Your best-selling products will rank here once orders are available."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`flex items-center gap-4 py-4 ${
                index === 0 ? "pt-0" : ""
              } ${index === products.length - 1 ? "pb-0" : ""}`}
            >
              {/* Image Container with light blue-gray background */}
              <div className="relative w-20 h-20 bg-primary-soft rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <BarChart3 className="w-7 h-7 text-primary/60" />
                )}
              </div>

              {/* Product Details */}
              <div className="flex flex-col gap-1 min-w-0">
                <h1 className="font-semibold text-foreground text-base leading-snug truncate">
                  {product.name}
                </h1>

                {typeof product.rating === "number" && (
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (product.rating ?? 0)
                            ? "text-warning fill-warning"
                            : "text-muted fill-muted"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {typeof product.price === "number" && (
                  <p className="font-bold text-foreground text-base mt-0.5">
                    ${product.price}
                  </p>
                )}

                {product.revenue && (
                  <p className="font-bold text-foreground text-base mt-0.5">
                    {product.revenue}
                  </p>
                )}

                {product.stockStatus && (
                  <p className="text-xs text-muted-foreground">{product.stockStatus}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopSellingProducts;
