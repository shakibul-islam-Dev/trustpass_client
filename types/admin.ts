export type UserRole = 'CUSTOMER' | 'BUSINESS' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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
