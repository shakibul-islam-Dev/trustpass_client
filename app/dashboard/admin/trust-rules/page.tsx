"use client";

import { useState, useMemo } from "react";
import type { TrustRule } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrustRuleModal } from "@/components/admin/trust-rules/TrustRuleModal";
import { TrustRuleTable } from "@/components/admin/trust-rules/TrustRuleTable";
import { TRUST_RULES } from "@/lib/trustRules";

const TrustRulesPage = () => {
  // --- States ---
  const [rules, setRules] = useState<TrustRule[]>(TRUST_RULES);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TrustRule | null>(null);

  // --- Handlers (API calls will go here later) ---

  /**
   * Handles saving a rule (either Add or Edit).
   * TODO: Replace with API Calls:
   *  - POST /admin/trust-rules (for add)
   *  - PATCH /admin/trust-rules/:id (for edit)
   */
  const handleSaveRule = (rule: TrustRule) => {
    setRules(prev => {
      const exists = prev.some(r => r.id === rule.id);
      if (exists) {
        // Edit
        return prev.map(r => r.id === rule.id ? rule : r);
      } else {
        // Add
        return [...prev, rule];
      }
    });
    console.log(`API Call: Save rule`, rule);
  };

  /**
   * Handles deleting a rule.
   * TODO: Replace with API Call (DELETE /admin/trust-rules/:id)
   */
  const handleDelete = (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    setRules(prev => prev.filter(r => r.id !== ruleId));
    console.log(`API Call: Delete rule ${ruleId}`);
  };

  /**
   * Handles toggling the active status of a rule.
   * TODO: Replace with API Call (PATCH /admin/trust-rules/:id/toggle)
   */
  const handleToggleActive = (ruleId: string, currentStatus: boolean) => {
    setRules(prev =>
      prev.map(r => r.id === ruleId ? { ...r, isActive: !currentStatus } : r)
    );
    console.log(`API Call: Toggle rule ${ruleId} to ${!currentStatus}`);
  };

  /**
   * Opens the modal for Add mode.
   */
  const openAddModal = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  /**
   * Opens the modal for Edit mode.
   */
  const openEditModal = (rule: TrustRule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  // --- Filtering Logic ---
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

  // Get unique categories for filter
  const categories = useMemo(() => {
    return Array.from(new Set(rules.map(r => r.category)));
  }, [rules]);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trust Rules Management</h1>
          <p className="text-muted-foreground mt-1">
            Define rules that determine business trust scores.
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Rule
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rules..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
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

        {/* Status Filter */}
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

      {/* Table */}
      <TrustRuleTable
        rules={filteredRules}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      {/* Add/Edit Modal */}
      <TrustRuleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rule={editingRule}
        onSave={handleSaveRule}
      />
    </div>
  );
};

export default TrustRulesPage;