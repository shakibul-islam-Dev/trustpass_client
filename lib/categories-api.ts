import type { ICategoriesResponse, ICategoryResponse } from "@/types/categories";
import { apiUrl } from "@/lib/core/api-url";

const fetchCategoryApi = async <T extends { success: boolean }>(url: string): Promise<T> => {
	try {
		const response = await fetch(apiUrl(url), {
			method: "GET",
			cache: "no-store",
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return {
				success: false,
				statusCode: response.status,
				error: errorData.message || `HTTP error! status: ${response.status}`,
			} as unknown as T;
		}

		return (await response.json()) as T;
	} catch (error) {
		console.error("Category API GET Exception:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		} as unknown as T;
	}
};

export const getCategories = () =>
	fetchCategoryApi<ICategoriesResponse>("/api/v1/categories");

export const getCategoryById = (id: string) =>
	fetchCategoryApi<ICategoryResponse>(`/api/v1/categories/${encodeURIComponent(id)}`);
