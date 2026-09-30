import CategoryCard from './CategoryCard';
import categoriesData from '@/public/data/categories.json';

type Category = (typeof categoriesData)[number];

type CategoryGridProps = {
  categories: Category[];
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