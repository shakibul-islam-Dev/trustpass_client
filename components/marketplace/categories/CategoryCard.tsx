import Link from 'next/link';
import Image from 'next/image';
import type { ICategory } from '@/types/categories';

type CategoryCardProps = {
  category: ICategory;
};

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/businesses?categoryId=${encodeURIComponent(category.id)}`}
      className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-md"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-muted text-3xl transition group-hover:bg-primary/10">
            {category.iconUrl ? (
              <Image
                src={category.iconUrl}
                alt=""
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            ) : category.icon || '🏷️'}
          </span>
          {(category.businessCount ?? category.count) !== undefined && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
              {category.businessCount ?? category.count} listings
            </span>
          )}
        </div>
        <h3 className="mt-4 text-base font-semibold text-card-foreground transition group-hover:text-primary">
          {category.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
          {category.description || 'Explore businesses in this category.'}
        </p>
      </div>

      <div className="mt-4 flex items-center border-t border-border pt-3 text-xs font-medium text-muted-foreground transition group-hover:text-primary">
        <span>Explore category</span>
        <svg className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}