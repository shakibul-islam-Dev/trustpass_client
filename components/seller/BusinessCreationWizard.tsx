"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Check, MapPin, Paperclip } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCategories } from "@/lib/categories-api";
import type { ICategory } from "@/types/categories";
import BusinessDocumentManager from "./BusinessDocumentManager";
import CategorySelector from "./CategorySelector";

const steps = [
  { label: "Business", icon: Building2 },
  { label: "Category", icon: Check },
  { label: "Address", icon: MapPin },
  { label: "Documents", icon: Paperclip },
];

export interface BusinessDraft {
  name: string;
  email: string;
  phone: string;
  category: string;
  address: string;
  city: string;
  postalCode: string;
}

interface BusinessCreationWizardProps {
  onSubmit?: (business: BusinessDraft, documents: Record<string, File>) => void | Promise<void>;
}

export default function BusinessCreationWizard({ onSubmit }: BusinessCreationWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [draft, setDraft] = useState<BusinessDraft>({
    name: "",
    email: "",
    phone: "",
    category: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryReload, setCategoryReload] = useState(0);
  const [documents, setDocuments] = useState<Record<string, File>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
        console.error("Could not load business categories:", error);
        if (active) {
          setCategoryError(error instanceof Error ? error.message : "Could not load business categories.");
        }
      })
      .finally(() => {
        if (active) setIsLoadingCategories(false);
      });
    return () => {
      active = false;
    };
  }, [categoryReload]);

  const updateDraft = (field: keyof BusinessDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const canContinue =
    activeStep === 0
      ? Boolean(draft.name.trim() && draft.email.trim() && draft.phone.trim())
      : activeStep === 1
        ? Boolean(draft.category && categories.some((category) => category.id === draft.category))
        : activeStep === 2
          ? Boolean(draft.address.trim() && draft.city.trim())
          : Object.keys(documents).length === 3;

  const handleContinue = async () => {
    if (!canContinue) return;
    if (activeStep < steps.length - 1) {
      setActiveStep((step) => step + 1);
      return;
    }
    if (!onSubmit) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(draft, documents);
    } catch (error) {
      console.error("Business submission failed:", error);
      setSubmitError(error instanceof Error ? error.message : "Could not submit this business.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-3xl border-border/80 bg-surface shadow-surface">
      <CardHeader className="space-y-5">
        <div>
          <CardTitle className="text-xl">Create your business profile</CardTitle>
          <CardDescription className="mt-1">Add the details customers need to recognize and trust your business.</CardDescription>
        </div>
        <ol className="grid grid-cols-4 gap-2" aria-label="Business setup progress">
          {steps.map(({ label, icon: Icon }, index) => {
            const isComplete = index < activeStep;
            const isCurrent = index === activeStep;
            return (
              <li key={label} className="min-w-0">
                <div className={`flex size-9 items-center justify-center rounded-full border ${isComplete || isCurrent ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"}`}>
                  <Icon className="size-4" />
                </div>
                <p className={`mt-2 truncate text-xs font-medium ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>{label}</p>
              </li>
            );
          })}
        </ol>
        <div className="h-1 overflow-hidden rounded-full bg-surface-secondary">
          <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {activeStep === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="new-business-name">Business name</Label>
              <Input id="new-business-name" autoComplete="organization" placeholder="e.g. Northstar Home Goods" value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-business-email">Business email</Label>
              <Input id="new-business-email" type="email" autoComplete="email" placeholder="hello@example.com" value={draft.email} onChange={(event) => updateDraft("email", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-business-phone">Phone number</Label>
              <Input id="new-business-phone" type="tel" autoComplete="tel" placeholder="+880 1XXX-XXXXXX" value={draft.phone} onChange={(event) => updateDraft("phone", event.target.value)} />
            </div>
          </div>
        )}

        {activeStep === 1 && (
          <CategorySelector
            value={draft.category}
            onChange={(category) => updateDraft("category", category)}
            categories={categories}
            isLoading={isLoadingCategories}
            error={categoryError}
            onRetry={() => {
              setIsLoadingCategories(true);
              setCategoryError(null);
              setCategoryReload((current) => current + 1);
            }}
          />
        )}

        {activeStep === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="business-address">Street address</Label>
              <Input id="business-address" autoComplete="street-address" placeholder="House, road, area" value={draft.address} onChange={(event) => updateDraft("address", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-city">City</Label>
              <Input id="business-city" autoComplete="address-level2" placeholder="Dhaka" value={draft.city} onChange={(event) => updateDraft("city", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-postal-code">Postal code <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Input id="business-postal-code" autoComplete="postal-code" placeholder="1205" value={draft.postalCode} onChange={(event) => updateDraft("postalCode", event.target.value)} />
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="space-y-5">
            <BusinessDocumentManager onFilesChange={setDocuments} />
            <div className="rounded-lg border border-border bg-background/50 p-3 text-sm text-muted-foreground">
              Selected files are passed to your submit handler. Upload them securely before creating the business.
            </div>
            {Object.keys(documents).length < 3 && <p className="text-sm text-warning">Select all three required documents to continue.</p>}
          </div>
        )}

        <div className="flex flex-wrap justify-between gap-3 border-t border-border pt-5">
          <Button type="button" variant="outline" className="gap-2" disabled={activeStep === 0} onClick={() => setActiveStep((step) => Math.max(0, step - 1))}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Button type="button" className="gap-2" disabled={!canContinue || isSubmitting || (activeStep === steps.length - 1 && !onSubmit)} onClick={() => void handleContinue()}>
            {isSubmitting ? "Submitting…" : activeStep === steps.length - 1 ? "Submit business" : "Continue"}
            {activeStep !== steps.length - 1 && <ArrowRight className="size-4" />}
          </Button>
        </div>
        {activeStep === steps.length - 1 && !onSubmit && (
          <p className="text-right text-xs text-muted-foreground">Submission is disabled until an integration handler is provided.</p>
        )}
        {submitError && <p role="alert" className="text-right text-sm text-danger">{submitError}</p>}
      </CardContent>
    </Card>
  );
}
