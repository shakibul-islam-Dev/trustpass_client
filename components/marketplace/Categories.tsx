'use client';
import categoriesData from '@/public/data/categories.json';
import CategoryGrid from './categories/CategoryGrid';
import CategorySectionHeader from './categories/CategorySectionHeader';
import type { Category } from './categories/types';

export type { Category } from './categories/types';

export default function Categories() {
  const categories: Category[] = categoriesData;

  return (
    <section className="bg-background py-12 text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CategorySectionHeader />
        <CategoryGrid categories={categories} />
      </div>
    </section>
  );
}