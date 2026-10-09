"use server";

import type {
  IBusinessFilters,
  IBusinessResponse,
  IBusinessesResponse,
} from "@/types/business";
import { apiUrl } from "@/lib/core/api-url";

const fetchBusinessApi = async <T extends { success: boolean }>(url: string): Promise<T> => {
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
    console.error("Business API GET Exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    } as unknown as T;
  }
};

export const getBusinesses = async (filters?: IBusinessFilters) => {
  const params = new URLSearchParams();

  if (filters?.page !== undefined) {
    params.append("page", filters.page.toString());
  }

  if (filters?.limit !== undefined) {
    params.append("limit", filters.limit.toString());
  }

  if (filters?.search) {
    params.append("search", filters.search);
  }

  if (filters?.categoryId) {
    params.append("categoryId", filters.categoryId);
  }

  if (filters?.businessType) {
    params.append("businessType", filters.businessType);
  }

  if (filters?.verificationStatus) {
    params.append("verificationStatus", filters.verificationStatus);
  }

  const queryString = params.toString();

  const url = queryString
    ? `/api/v1/businesses?${queryString}`
    : `/api/v1/businesses`;

  return fetchBusinessApi<IBusinessesResponse>(url);
};

export const getBusinessById = async (id: string) =>
  fetchBusinessApi<IBusinessResponse>(`/api/v1/businesses/${encodeURIComponent(id)}`);

export const getBusinessBySlug = async (slug: string) =>
  fetchBusinessApi<IBusinessResponse>(`/api/v1/businesses/slug/${encodeURIComponent(slug)}`);