export type UserRole = "CUSTOMER" | "SELLER" | "MODERATOR" | "ADMIN"
// export type UserStatus = "Active" | "Banned" | "Pending";

/**
 * Business-level verification status, i.e. `Business.verificationStatus`.
 *
 * Mirrors the backend Prisma enum `VerificationStatus`
 * (`prisma/schema/enums.prisma`). This describes the *business*, not a
 * verification request — see `BusinessVerificationStatus` for that.
 */
export type VerificationStatus =
  | "UNVERIFIED"
  | "PENDING"
  | "VERIFIED"
  | "REJECTED"
  | "SUSPENDED";

/**
 * Status of a `BusinessVerification` row — the record the admin and moderator
 * verification queues read from `GET /api/v1/verifications`.
 *
 * Mirrors the backend Prisma enum `BusinessVerificationStatus`. Note that
 * approving a request sets the *business* status to `VERIFIED` (not
 * `APPROVED`), while the request row itself becomes `APPROVED`.
 */
export type BusinessVerificationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";


export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
   status?: string;
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



/** Document types accepted by the backend (`DocumentType` enum). */
export type BusinessDocumentType =
  | "TRADE_LICENSE"
  | "NID"
  | "TIN_CERTIFICATE"
  | "VAT_CERTIFICATE"
  | "BANK_STATEMENT"
  | "UTILITY_BILL"
  | "OTHER";

/** Document review status (`DocumentStatus` enum). */
export type BusinessDocumentStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface VerificationDocument {
  id: string;
  documentType: BusinessDocumentType;
  fileUrl: string;
  status?: BusinessDocumentStatus;
  rejectionReason?: string | null;
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
  status: BusinessVerificationStatus;
  submittedAt: string;
  documents: VerificationDocument[];
}

//-------------------------------------------------------------------------