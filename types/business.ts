export type TVerificationStatus =
  | "UNVERIFIED"
  | "PENDING"
  | "VERIFIED"
  | "REJECTED"
  | "SUSPENDED";

export type TBusinessType =
  | "INDIVIDUAL"
  | "COMPANY"
  | "NGO"
  | "GOVERNMENT"
  | "OTHER";

export interface IBusinessAddress {
  id?: string;
  addressLine: string;
  city: string;
  district: string;
  division: string;
  postalCode: string;
  country: string;
}

export interface IBusiness {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  categoryId: string | null;
  businessType: TBusinessType;
  websiteUrl: string | null;
  instaUrl: string | null;
  tiktokUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  verificationStatus: TVerificationStatus;
  trustScore: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  address: IBusinessAddress | null;
}

export interface IBusinessesResponse {
  success: boolean;
  statusCode?: number;
  message?: string;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data?: IBusiness[];
}

export interface IBusinessResponse {
  success: boolean;
  statusCode?: number;
  message?: string;
  error?: string;
  data?: IBusiness;
}

export interface IBusinessFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  businessType?: TBusinessType;
  verificationStatus?: TVerificationStatus;
}