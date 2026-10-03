import type { ICategory } from '@/types/categories';
import CategoryGrid from './categories/CategoryGrid';
import CategorySectionHeader from './categories/CategorySectionHeader';

type CategoriesProps = {
  categories: ICategory[];
  error?: string;
};

export default function Categories({ categories, error }: CategoriesProps) {

  return (
    <section className="bg-background py-12 text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CategorySectionHeader />
        {categories.length > 0 ? (
          <CategoryGrid categories={categories} />
        ) : (
          <p className="rounded-md border border-border px-4 py-6 text-sm text-muted-foreground">
            {error || 'No categories are available yet.'}
          </p>
        )}
      </div>
    </section>
  );
}