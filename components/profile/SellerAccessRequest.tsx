"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Building2, CheckCircle2, ShieldCheck } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCategories } from "@/lib/categories-api";
import type { ApiRole } from "@/lib/core/roles";
import type { ICategory } from "@/types/categories";

export interface SellerAccessRequestPayload {
  businessName: string;
  categoryId: string;
  businessDescription: string;
  contactPhone: string;
}

interface SellerAccessRequestProps {
  currentRole: ApiRole;
  requestStatus?: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  onSubmit?: (payload: SellerAccessRequestPayload) => void | Promise<void>;
}

const requestStatusCopy = {
  PENDING: {
    title: "Seller access request pending",
    description: "Your request is with the TrustPass review team. Your account role remains unchanged until it is approved.",
    variant: "warning" as const,
  },
  APPROVED: {
    title: "Seller access approved",
    description: "Your account has seller access. Refresh your session if the seller dashboard is not visible yet.",
    variant: "success" as const,
  },
  REJECTED: {
    title: "Seller access request declined",
    description: "You can review your business details and submit a new request when ready.",
    variant: "danger" as const,
  },
};

export default function SellerAccessRequest({
  currentRole,
  requestStatus = "NONE",
  onSubmit,
}: SellerAccessRequestProps) {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryReload, setCategoryReload] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ status: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let active = true;
    void getCategories()
      .then((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || response.message || "Could not load business categories.");
        }
        if (active) {
          setCategories(response.data);
          setCategoryError(null);
        }
      })
      .catch((error: unknown) => {
        console.error("Could not load seller request categories:", error);
        if (active) setCategoryError(error instanceof Error ? error.message : "Could not load categories.");
      })
      .finally(() => {
        if (active) setIsLoadingCategories(false);
      });
    return () => {
      active = false;
    };
  }, [categoryReload]);

  const isSeller = currentRole === "SELLER";
  const isPrivileged = currentRole === "ADMIN" || currentRole === "MODERATOR";
  const canSubmit =
    Boolean(onSubmit) &&
    !isLoadingCategories &&
    !categoryError &&
    businessName.trim().length >= 2 &&
    categories.some((category) => category.id === categoryId) &&
    businessDescription.trim().length >= 20 &&
    contactPhone.trim().length >= 7 &&
    confirmed &&
    !isSubmitting;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    if (!onSubmit || !canSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        businessName: businessName.trim(),
        categoryId,
        businessDescription: businessDescription.trim(),
        contactPhone: contactPhone.trim(),
      });
      setFeedback({
        status: "success",
        message: "Your seller access request was submitted. Your account role changes only after approval.",
      });
    } catch (error) {
      console.error("Seller access request failed:", error);
      setFeedback({
        status: "error",
        message: error instanceof Error ? error.message : "Could not submit your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <Card className="border-border/80 bg-surface shadow-surface">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {isSeller ? <BadgeCheck className="size-6" /> : <BriefcaseBusiness className="size-6" />}
            </div>
            <div>
              <CardTitle>{isSeller ? "Seller account" : "Become a TrustPass seller"}</CardTitle>
              <CardDescription className="mt-1">
                {isSeller
                  ? "Your account already has seller access."
                  : "Request seller access by sharing a few details about your business."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/50 p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-surface-secondary text-muted-foreground">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">Current account role</p>
                <p className="text-xs text-muted-foreground">Role is controlled by TrustPass account services.</p>
              </div>
            </div>
            <Badge variant={isSeller ? "success" : "outline"}>{currentRole}</Badge>
          </div>

          {requestStatus !== "NONE" && (
            <Alert className={
              requestStatus === "APPROVED"
                ? "border-success/30 bg-success/5 text-success"
                : requestStatus === "REJECTED"
                  ? "border-danger/30 bg-danger/5 text-danger"
                  : "border-warning/30 bg-warning/5 text-warning"
            }>
              {requestStatus === "APPROVED" ? <CheckCircle2 /> : <ShieldCheck />}
              <AlertTitle>{requestStatusCopy[requestStatus].title}</AlertTitle>
              <AlertDescription>{requestStatusCopy[requestStatus].description}</AlertDescription>
            </Alert>
          )}

          {isPrivileged && (
            <Alert variant="default">
              <ShieldCheck />
              <AlertTitle>Administrative account</AlertTitle>
              <AlertDescription>Seller access requests are intended for customer accounts. Your current role already has elevated dashboard access.</AlertDescription>
            </Alert>
          )}

          {!isSeller && !isPrivileged && requestStatus !== "PENDING" && requestStatus !== "APPROVED" && (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="seller-business-name">Business name</Label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="seller-business-name" autoComplete="organization" className="pl-10" value={businessName} onChange={(event) => setBusinessName(event.target.value)} required minLength={2} maxLength={120} />
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="seller-business-category">Business category</Label>
                  <select
                    id="seller-business-category"
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    disabled={isLoadingCategories || Boolean(categoryError)}
                    required
                    className="h-11 w-full rounded-field border border-border bg-background px-3.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60"
                  >
                    <option value="">{isLoadingCategories ? "Loading categories…" : "Select a category"}</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                  {categoryError && (
                    <div className="flex items-center justify-between gap-3">
                      <p role="alert" className="text-xs text-danger">{categoryError}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCategoryError(null);
                          setIsLoadingCategories(true);
                          setCategoryReload((current) => current + 1);
                        }}
                      >
                        Retry
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="seller-business-phone">Business contact phone</Label>
                  <Input id="seller-business-phone" type="tel" autoComplete="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} required minLength={7} maxLength={24} />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="seller-business-description">What does your business do?</Label>
                  <Textarea id="seller-business-description" value={businessDescription} onChange={(event) => setBusinessDescription(event.target.value)} required minLength={20} maxLength={1000} className="min-h-28" />
                  <p className="text-xs text-muted-foreground">At least 20 characters. {businessDescription.length}/1000</p>
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background/40 p-3 text-sm text-muted-foreground">
                <input type="checkbox" className="mt-0.5 size-4 accent-primary" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
                <span>I confirm these business details are accurate and understand that submitting a request does not change my account role until approved.</span>
              </label>

              {feedback && (
                <Alert variant={feedback.status === "error" ? "destructive" : "default"} className={feedback.status === "success" ? "border-success/30 bg-success/5 text-success" : ""}>
                  {feedback.status === "success" ? <CheckCircle2 /> : <ShieldCheck />}
                  <AlertTitle>{feedback.status === "success" ? "Request submitted" : "Request not submitted"}</AlertTitle>
                  <AlertDescription>{feedback.message}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full gap-2 sm:w-auto" disabled={!canSubmit}>
                {isSubmitting ? "Submitting request…" : "Request seller access"}
                {!isSubmitting && <ArrowRight className="size-4" />}
              </Button>

              {!onSubmit && <p className="text-xs text-muted-foreground">Seller role changes are disabled until the backend request handler is connected.</p>}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
