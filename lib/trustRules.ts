import type { TrustRule } from "@/types/admin";

export const TRUST_RULES: TrustRule[] = [
  {
    id: "rule_1",
    ruleName: "Email Verified",
    category: "Verification",
    weightPoints: 10,
    isActive: true,
    description: "Business owner has verified their email address.",
  },
  {
    id: "rule_2",
    ruleName: "Trade License Uploaded",
    category: "Verification",
    weightPoints: 25,
    isActive: true,
    description: "Valid trade license document has been uploaded and verified.",
  },
  {
    id: "rule_3",
    ruleName: "NID Verified",
    category: "Verification",
    weightPoints: 30,
    isActive: true,
    description: "National ID card has been verified successfully.",
  },
  {
    id: "rule_4",
    ruleName: "Complete Business Profile",
    category: "Business Info",
    weightPoints: 15,
    isActive: true,
    description: "Business has filled in all required profile information.",
  },
  {
    id: "rule_5",
    ruleName: "Positive Customer Reviews",
    category: "Customer Feedback",
    weightPoints: 20,
    isActive: true,
    description: "Received at least 5 positive reviews from customers.",
  },
  {
    id: "rule_6",
    ruleName: "Fake Report Confirmed",
    category: "Customer Feedback",
    weightPoints: -50,
    isActive: true,
    description: "A customer report has been confirmed as fraudulent behavior.",
  },
];