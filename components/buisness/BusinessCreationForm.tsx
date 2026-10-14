"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import BusinessCreationWizard, {
  type BusinessDraft,
} from "@/components/seller/BusinessCreationWizard";
import { requiredBusinessDocuments } from "@/components/seller/BusinessDocumentManager";
import {
  createBusiness,
  uploadBusinessDocument,
  type BusinessDocumentType,
} from "@/lib/core/business-api";
import type { IBusiness } from "@/types/business";

/** Wizard document IDs mapped to server document types. */
const WIZARD_DOCUMENT_TYPES: Record<string, BusinessDocumentType> = {
  "trade-license": "TRADE_LICENSE",
  nid: "NID",
  tin: "TIN_CERTIFICATE",
};

/**
 * Standalone business creation flow used by the settings page.
 * Creates the business, uploads collected documents, and displays a success state.
 */
export default function BusinessCreationForm() {
  const [created, setCreated] = useState<IBusiness | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState(0);

  const handleSubmit = async (
    draft: BusinessDraft,
    files: Record<string, File>,
  ) => {
    const createdResult = await createBusiness({
      name: draft.name.trim(),
      categoryId: draft.category,
      contactEmail: draft.email.trim(),
      contactPhone: draft.phone.trim(),
      websiteUrl: draft.websiteUrl.trim() || undefined,
      instaUrl: draft.instaUrl.trim() || undefined,
      tiktokUrl: draft.tiktokUrl.trim() || undefined,
      address: {
        addressLine: draft.address.trim(),
        city: draft.city.trim(),
        district: draft.district.trim(),
        division: draft.division,
        postalCode: draft.postalCode.trim() || "0000",
        country: "BANGLADESH",
      },
    });

    if (!createdResult.ok || !createdResult.data) {
      throw new Error(createdResult.message);
    }
    const business = createdResult.data;

    let uploaded = 0;
    for (const item of requiredBusinessDocuments) {
      const file = files[item.id];
      const documentType = WIZARD_DOCUMENT_TYPES[item.id];
      if (!file || !documentType) continue;
      
      const uploadResult = await uploadBusinessDocument(
        business.id,
        documentType,
        file,
      );
      if (!uploadResult.ok) {
        throw new Error(`${item.label} upload failed: ${uploadResult.message}`);
      }
      uploaded += 1;
    }

    setUploadedDocuments(uploaded);
    setCreated(business);
  };

  if (created) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-6 rounded-3xl border border-border bg-surface p-8 text-center shadow-lg transition-all md:p-12">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-success-soft text-success shadow-sm">
          <CheckCircle2 className="size-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Business successfully created!
          </h1>
          <p className="text-base text-muted-foreground">
            <strong className="text-foreground">{created.name}</strong> is ready to go
            {uploadedDocuments > 0
              ? ` with ${uploadedDocuments} document${
                  uploadedDocuments === 1 ? "" : "s"
                } uploaded securely`
              : ""}
            .
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href={`/dashboard/seller/settings/buisnessform?id=${created.id}`}
            className={buttonVariants({ className: "w-full sm:w-auto gap-2" })}
          >
            Manage business
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/dashboard/seller"
            className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
          >
            Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <BusinessCreationWizard onSubmit={handleSubmit} />
    </div>
  );
}