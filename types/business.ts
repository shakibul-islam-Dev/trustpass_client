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

export interface IBusinessReportReporter {
  id: string;
  name: string;
  email: string;
}

export interface IBusinessReport {
  id: string;
  reason: string;
  description: string;
  status: "PENDING" | "INVESTIGATING" | "RESOLVED" | "REJECTED" | string;
  evidenceUrls?: string[];
  reporter?: IBusinessReportReporter;
  createdAt: string;
}

export interface IBusiness {
  id: string;
  ownerId?: string;
  name: string;
  slug?: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  categoryId?: string | null; // categoryId যোগ করা হলো
  businessType: TBusinessType;
  verificationStatus: TVerificationStatus | string;
  trustScore: number;
  trustScoreUpdatedAt: string | null;
  isFeatured: boolean;
  contactPhone?: string | null;
  contactEmail?: string | null;
  websiteUrl?: string | null;
  instaUrl?: string | null;
  tiktokUrl?: string | null;
  address?: IBusinessAddress; // IBusinessAddress দিয়ে ফিক্স করা হলো (যাতে id থাকে)
  reports?: IBusinessReport[];
  createdAt?: string; // createdAt যোগ করা হলো
  updatedAt?: string; // updatedAt যোগ করা হলো
}


export interface IProductImage {
  url: string;
  publicId?: string;
}

export interface IProduct {
  id: string;
  businessId?: string;
  categoryId?: string;
  name: string;
  slug?: string;
  description?: string | null;
  price: number;
  currency: string;
  stock: number;
  images: IProductImage[];
  status: string;
  createdAt?: string;
  updatedAt?: string;
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