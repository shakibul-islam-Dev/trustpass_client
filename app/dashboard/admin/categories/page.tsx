import { CategoryClient } from "@/components/admin/category-management/CategoryClient";
import { fetchCategories } from "@/lib/admin_api/getcategories";

export const dynamic = "force-dynamic";

/**
 * Server Component — Fetches initial data on the server.
 * Passes data to Client Component for interactivity.
 */
export default async function CategoriesPage() {
  const categories = await fetchCategories({ page: 1, limit: 100 });

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Categories Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage business and product categories.
        </p>
      </div>

      {/* Client Component - handles all interactive parts */}
      <CategoryClient initialCategories={categories} />
    </div>
  );
}