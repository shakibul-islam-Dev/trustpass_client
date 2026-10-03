import CategoryCard from './CategoryCard';
import type { ICategory } from '@/types/categories';

type CategoryGridProps = {
  categories: ICategory[];
};

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}