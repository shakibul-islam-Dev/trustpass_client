// ============================================================
// CUSTOMER TYPES
// ============================================================

// --- User / Auth (Optional - if separate from admin) ---
export type CustomerRole = "Customer";

// --- Customer Report ---
export type ReportCategory = "FRAUD" | "MISLEADING" | "NON_DELIVERY" | "OTHER";
export type ReportStatus = "PENDING" | "RESOLVED" | "REJECTED";
export type ReportPriority = "LOW" | "MEDIUM" | "HIGH";

export interface CustomerReport {
  id: string;
  businessId: string;
  businessName: string;
  customerId: string;
  customerName: string;
  category: ReportCategory;
  description: string;
  evidenceUrl?: string;
  status: ReportStatus;
  priority: ReportPriority;
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
}

// --- Report Submission Form Data ---
export interface ReportSubmissionData {
  businessId: string;
  businessName: string;
  category: ReportCategory;
  description: string;
  evidenceUrl?: string;
}

// --- Notification ---
export type NotificationType = "REPORT_UPDATE" | "SYSTEM" | "TRUST_SCORE" | "PAYMENT";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// --- Wishlist ---
export interface WishlistItem {
  id: string;
  businessId: string;
  businessName: string;
  category: string;
  location: string;
  trustScore: number;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  addedAt: string;
}

// --- Customer Dashboard Stats ---
export interface CustomerStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  rejectedReports: number;
  totalWishlist: number;
  unreadNotifications: number;
}

// --- Recent Activity (for Dashboard Home) ---
export interface RecentActivity {
  id: string;
  type: "REPORT" | "NOTIFICATION" | "WISHLIST";
  title: string;
  description: string;
  createdAt: string;
  status?: string;
}

// --- Business (Public View - for browsing) ---
export interface PublicBusiness {
  id: string;
  name: string;
  slug: string;
  category: string;
  location: string;
  trustScore: number;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  isFeatured: boolean;
  productsCount: number;
  logoUrl?: string;
  description?: string;
}