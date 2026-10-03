import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getCategoryById } from '@/lib/categories-api';

type CategoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;
  const response = await getCategoryById(id);

  if (!response.success || !response.data) {
    notFound();
  }

  const category = response.data;
  const listingCount = category.businessCount ?? category.count;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          Back to home
        </Link>
        <section className="mt-6 rounded-lg border border-border bg-card p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-3xl">
              {category.iconUrl ? (
                <Image
                  src={category.iconUrl}
                  alt=""
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : category.icon || '🏷️'}
            </span>
            <div>
              <h1 className="text-2xl font-bold">{category.name}</h1>
              {category.description && (
                <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
              )}
            </div>
          </div>

          <dl className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase text-muted-foreground">Category ID</dt>
              <dd className="mt-1 break-all text-sm">{category.id}</dd>
            </div>
            {category.slug && (
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">Slug</dt>
                <dd className="mt-1 text-sm">{category.slug}</dd>
              </div>
            )}
            {listingCount !== undefined && (
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">Listings</dt>
                <dd className="mt-1 text-sm">{listingCount}</dd>
              </div>
            )}
            {category.createdAt && (
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">Created</dt>
                <dd className="mt-1 text-sm">{new Date(category.createdAt).toLocaleDateString()}</dd>
              </div>
            )}
            {category.updatedAt && (
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">Last updated</dt>
                <dd className="mt-1 text-sm">{new Date(category.updatedAt).toLocaleDateString()}</dd>
              </div>
            )}
          </dl>

          <Link
            href={`/businesses?categoryId=${encodeURIComponent(category.id)}`}
            className="mt-8 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Browse businesses
          </Link>
        </section>
      </div>
    </main>
  );
}