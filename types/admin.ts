export type UserRole = 'Customer' | 'Business Owner' | 'Admin';
export type UserStatus = "Active" | "Banned" | "Pending";
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  avatar?: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  phone: string;
  location: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  trustScore: number;
  productsCount: number;
  tradeLicenseNo: string;
  createdAt: string;
}

export interface TrustRule {
  id: string;
  ruleName: string;
  category: string;
  weightPoints: number;
  isActive: boolean;
  description: string;
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

export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

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