export interface ICategory {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  iconUrl?: string | null;
  isActive?: boolean;
  count?: number;
  businessCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICategoriesResponse {
  success: boolean;
  statusCode?: number;
  message?: string;
  error?: string;
  data?: ICategory[];
}

export interface ICategoryResponse {
  success: boolean;
  statusCode?: number;
  message?: string;
  error?: string;
  data?: ICategory;
}