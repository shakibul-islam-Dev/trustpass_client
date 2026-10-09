import { apiUrl } from "@/lib/core/api-url";

export interface ICreateProductData {
  business_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  stock?: number;
  images?: string[];
  status?: "active" | "draft";
}

export interface IApiProduct {
  id: string | number;
  business_id: string;
  category_id: string;
  name: string;
  description?: string | null;
  price: number | string;
  currency?: string;
  stock?: number | null;
  status?: string;
}


export const getProductsForBusiness = async (businessId: string): Promise<IApiProduct[]> => {
  const response = await fetch(apiUrl(`/api/v1/businesses/${businessId}/products`), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const resData = await response.json();

  if (!response.ok || !resData.success) {
    throw new Error(resData.message || resData.error || "Could not load products.");
  }

  return resData.data || [];
};


export const handleCreateProduct = async (productData: ICreateProductData) => {
  const response = await fetch(apiUrl("/api/v1/products"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(productData),
  });

  const resData = await response.json();

  if (!response.ok || !resData.success) {
    throw new Error(resData.message || resData.error || "Failed to create product.");
  }

  return resData;
};