"use client";

import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { IProduct } from "@/lib/products-api/create-products";

interface ProductGridProps {
  products: IProduct[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function ProductGrid({ products }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Package className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          No products found
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Try adjusting your search or filters to find what you are looking for.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 "
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={item}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}