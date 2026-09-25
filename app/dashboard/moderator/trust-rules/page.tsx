"use client";

import { useState, useMemo } from "react";
import type { TrustRule } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, RefreshCw, Scale } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrustRuleModal } from "@/components/admin/trust-rules/TrustRuleModal";
import { TrustRuleTable } from "@/components/admin/trust-rules/TrustRuleTable";
import { ScoreBreakdownModal } from "@/components/moderator/ScoreBreakdownModal";

// Dummy Data
const DUMMY_RULES: TrustRule[] = [
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

export default function ModeratorTrustRules() {
  const [rules, setRules] = useState<TrustRule[]>(DUMMY_RULES);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Rule Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TrustRule | null>(null);

  // Score Breakdown & Recalculate Modal State
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  const handleSaveRule = (rule: TrustRule) => {
    setRules(prev => {
      const exists = prev.some(r => r.id === rule.id);
      if (exists) {
        return prev.map(r => r.id === rule.id ? rule : r);
      } else {
        return [...prev, rule];
      }
    });
  };

  const handleDelete = (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    setRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const handleToggleActive = (ruleId: string, currentStatus: boolean) => {
    setRules(prev =>
      prev.map(r => r.id === ruleId ? { ...r, isActive: !currentStatus } : r)
    );
  };

  const openAddModal = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const openEditModal = (rule: TrustRule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const matchesSearch =
        rule.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === "all" || rule.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && rule.isActive) ||
        (statusFilter === "inactive" && !rule.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [rules, searchTerm, categoryFilter, statusFilter]);

  const categories = useMemo(() => {
    return Array.from(new Set(rules.map(r => r.category)));
  }, [rules]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary mb-1.5">
            <Scale className="h-3 w-3" /> Moderator Trust Scoring
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Trust Rules & Scoring Engine</h1>
          <p className="text-muted-foreground mt-1">
            Audit score weighting rules and test recalculation breakdown.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Recalculate Trigger Button */}
          <Button
            onClick={() => setIsBreakdownOpen(true)}
            variant="outline"
            className="gap-2 border-primary/40 hover:bg-primary/10 hover:text-primary"
          >
            <RefreshCw className="h-4 w-4 text-primary" />
            Recalculate & Score Breakdown
          </Button>

          <Button onClick={openAddModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rules..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value ?? "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reusable Trust Rule Table */}
      <TrustRuleTable
        rules={filteredRules}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      {/* Reusable Add/Edit Modal */}
      <TrustRuleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rule={editingRule}
        onSave={handleSaveRule}
      />

      {/* Score Breakdown & Recalculate Modal */}
      <ScoreBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        businessName="Tech Solutions Ltd."
        initialScore={85}
      />
    </div>
  );
}
