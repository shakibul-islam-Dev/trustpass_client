"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import type { TrustRule, TTrustRuleStatus } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrustRuleModal } from "./TrustRuleModal";
import { TrustRuleTable } from "./TrustRuleTable";
import { fetchTrustRules } from "@/lib/admin_api/get-trust-rules";
import { createTrustRule, deleteTrustRule, updateTrustRule } from "@/lib/admin_action/trust-rules_action";


interface TrustRulesClientProps {
  initialRules: TrustRule[];
}

export const TrustRulesClient = ({ initialRules }: TrustRulesClientProps) => {
  // --- States ---
  const [rules, setRules] = useState<TrustRule[]>(initialRules);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TrustRule | null>(null);

  // --- Reload ---
  const reloadRules = async () => {
    try {
      const data = await fetchTrustRules();
      setRules(data);
    } catch (error) {
      console.error("Failed to reload rules:", error);
      toast.error("Failed to reload trust rules.");
    }
  };

  // --- Handlers ---

  /**
   * Handles saving a rule (Add or Edit).
   */
  const handleSaveRule = async (data: {
    ruleKey: string;
    label: string;
    points: number;
    status: TTrustRuleStatus;
    isActive?: boolean;
  }) => {
    try {
      let result;
      if (editingRule) {
        // Edit — only send updatable fields
        result = await updateTrustRule(editingRule.id, {
          label: data.label,
          points: data.points,
          status: data.status,
          isActive: data.isActive,
        });
      } else {
        // Create
        result = await createTrustRule({
          ruleKey: data.ruleKey,
          label: data.label,
          points: data.points,
          status: data.status,
          isActive: data.isActive,
        });
      }

      if (result?.error || result?.success === false) {
        toast.error(editingRule ? "Failed to update rule." : "Failed to create rule.");
        return;
      }

      toast.success(editingRule ? "Rule updated successfully!" : "Rule created successfully!");
      await reloadRules();
    } catch (error) {
      console.error("Save rule error:", error);
      toast.error("Something went wrong.");
    }
  };

  /**
   * Handles deleting a rule.
   */
  const handleDelete = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;

    try {
      const result = await deleteTrustRule(ruleId);
      if (result?.error || result?.success === false) {
        toast.error("Failed to delete rule.");
        return;
      }
      toast.success("Rule deleted successfully!");
      await reloadRules();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong.");
    }
  };

  /**
   * Handles toggling the active status of a rule.
   */
  const handleToggleActive = async (ruleId: string, currentStatus: boolean) => {
    try {
      const result = await updateTrustRule(ruleId, { isActive: !currentStatus });
      if (result?.error || result?.success === false) {
        toast.error("Failed to update status.");
        return;
      }
      toast.success(currentStatus ? "Rule deactivated." : "Rule activated.");
      await reloadRules();
    } catch (error) {
      console.error("Toggle error:", error);
      toast.error("Something went wrong.");
    }
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
        rule.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.ruleKey.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || rule.status === statusFilter;

      const matchesActive =
        activeFilter === "all" ||
        (activeFilter === "active" && rule.isActive) ||
        (activeFilter === "inactive" && !rule.isActive);

      return matchesSearch && matchesStatus && matchesActive;
    });
  }, [rules, searchTerm, statusFilter, activeFilter]);

  return (
    <>
      {/* Top Actions */}
      <div className="flex items-center justify-end">
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Rule
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by key or label..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v ?? "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="VERIFICATION">Verification</SelectItem>
            <SelectItem value="ACTIVITY">Activity</SelectItem>
            <SelectItem value="REPORT">Report</SelectItem>
          </SelectContent>
        </Select>

        {/* Active Filter */}
        <Select
          value={activeFilter}
          onValueChange={(v) => setActiveFilter(v ?? "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Active" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
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

      {/* Modal */}
      <TrustRuleModal
        key={editingRule?.id ?? "new"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rule={editingRule}
        onSave={handleSaveRule}
      />
    </>
  );
};