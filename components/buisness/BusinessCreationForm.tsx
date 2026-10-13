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

/** Wizard document ids -> server document types. */
const WIZARD_DOCUMENT_TYPES: Record<string, BusinessDocumentType> = {
  "trade-license": "TRADE_LICENSE",
  nid: "NID",
  tin: "TIN_CERTIFICATE",
};

/**
 * Standalone business creation flow used by the settings page.
 *
 * Creates the business, then uploads every document the wizard collected, and
 * finally shows a success panel that links to the new business or the
 * dashboard. Errors are thrown so the wizard can surface them inline.
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

    // Upload every document the wizard collected, right after creation.
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
      <div className="mx-auto w-full max-w-3xl space-y-4 rounded-2xl border border-border bg-surface p-8 text-center shadow-surface">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="size-7" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Business created
          </h1>
          <p className="text-sm text-muted-foreground">
            {created.name} is ready
            {uploadedDocuments > 0
              ? `, with ${uploadedDocuments} document${
                  uploadedDocuments === 1 ? "" : "s"
                } uploaded`
              : ""}
            .
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href={`/dashboard/seller/settings/buisnessform?id=${created.id}`}
            className={buttonVariants({ className: "gap-2" })}
          >
            Manage this business
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/dashboard/seller"
            className={buttonVariants({ variant: "outline" })}
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <BusinessCreationWizard onSubmit={handleSubmit} />;
}
