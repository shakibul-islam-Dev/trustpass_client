export type UserRole = "CUSTOMER" | "SELLER" | "MODERATOR" | "ADMIN"
// export type UserStatus = "Active" | "Banned" | "Pending";
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";


export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // status: UserStatus;
  createdAt: string;
  avatar?: string;
}

//------------------ business page -----------
export interface Business {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  category: string;
  phone: string;
  location: string;
  verificationStatus: VerificationStatus;
  trustScore: number;
  productsCount: number;
  tradeLicenseNo: string;
  isFeatured: boolean;
  createdAt: string;
}

// src/types/admin.ts
// Trustrules
// src/types/admin.ts

export type TTrustRuleStatus = "ACTIVE" | "INACTIVE";

export interface TrustRule {
  id: string;
  ruleKey: string;
  label: string;
  points: number;
  isActive: boolean;
  status: TTrustRuleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerReport {
  id: string;
  businessName: string;
  customerName: string;
  category: 'FRAUD' | 'MISLEADING' | 'NON_DELIVERY' | 'OTHER';
  description: string;
  evidenceUrl?: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

//-------------------- verification Queue page -----------



export interface VerificationDocument {
  id: string;
  documentType: "TRADE_LICENSE" | "NID" | "TIN" | "OTHER";
  fileUrl: string;
  uploadedAt: string;
}

export interface VerificationRequest {
  id: string;
  businessId: string;
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  category: string;
  phone: string;
  location: string;
  tradeLicenseNo: string;
  trustScore: number;
  status: VerificationStatus;
  submittedAt: string;
  documents: VerificationDocument[];
}

//-------------------------------------------------------------------------