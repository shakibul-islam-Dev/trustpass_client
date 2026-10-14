"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Building2,
  CheckCircle2,
  Globe,
  ImagePlus,
  Loader2,
  MapPin,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCategories } from "@/lib/categories-api";
import type { ICategory } from "@/types/categories";
import { validateSocialLinks } from "@/lib/core/url";
import {
  getBusinessById,
  updateBusiness,
  updateBusinessAddress,
  type AddressPayload,
  type BusinessImageFiles,
} from "@/lib/core/business-api";
import type { IBusiness } from "@/types/business";

const DIVISIONS = [
  "DHAKA",
  "CHITTAGONG",
  "RAJSHAHI",
  "KHULNA",
  "BARISAL",
  "SYLHET",
  "RANGPUR",
  "MYMENSINGH",
] as const;

const COUNTRIES = ["BANGLADESH", "INDIA", "USA", "UK", "OTHER"] as const;

const BUSINESS_TYPES: { value: IBusiness["businessType"]; label: string }[] = [
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "COMPANY", label: "Company" },
  { value: "NGO", label: "NGO" },
  { value: "GOVERNMENT", label: "Government" },
  { value: "OTHER", label: "Other" },
];

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB — matches the server's multer limit

interface BuisnessUpdateFormProps {
  /** The business to load and edit. */
  businessId: string;
  /** Optional — pass to avoid an extra categories request. */
  categories?: ICategory[];
  /** Called after a successful save with the refreshed business. */
  onSaved?: (business: IBusiness) => void;
}

type ImageSlot = "logo" | "cover";

export default function BuisnessUpdateForm({
  businessId,
  categories: initialCategories,
  onSaved,
}: BuisnessUpdateFormProps) {
  const [business, setBusiness] = useState<IBusiness | null>(null);
  const [categories, setCategories] = useState<ICategory[]>(initialCategories ?? []);

  // Basic info
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState<IBusiness["businessType"]>("INDIVIDUAL");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");

  // Contact & links
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instaUrl, setInstaUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");

  // Address
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [division, setDivision] = useState<string>("DHAKA");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState<string>("BANGLADESH");

  // Logo / cover
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  // Revoke object URLs when the form unmounts or a new file replaces an old one.
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setMessage(null);

      const result = await getBusinessById(businessId);
      if (active && (!result.ok || !result.data)) {
        setMessage({ tone: "error", text: result.message });
        setIsLoading(false);
        return;
      }
      if (!active) return;

      const loaded = result.data!;
      setBusiness(loaded);
      setName(loaded.name);
      setBusinessType(loaded.businessType);
      setCategoryId(loaded.categoryId ?? "");
      setDescription(loaded.description ?? "");
      setContactEmail(loaded.contactEmail ?? "");
      setContactPhone(loaded.contactPhone ?? "");
      setWebsiteUrl(loaded.websiteUrl ?? "");
      setInstaUrl(loaded.instaUrl ?? "");
      setTiktokUrl(loaded.tiktokUrl ?? "");
      setAddressLine(loaded.address?.addressLine ?? "");
      setCity(loaded.address?.city ?? "");
      setDistrict(loaded.address?.district ?? "");
      setDivision(loaded.address?.division ?? "DHAKA");
      setPostalCode(loaded.address?.postalCode ?? "");
      setCountry(loaded.address?.country ?? "BANGLADESH");
      setLogoFile(null);
      setCoverFile(null);
      setLogoPreview(null);
      setCoverPreview(null);

      if (initialCategories && initialCategories.length > 0) {
        setCategories(initialCategories);
      } else {
        const categoryResult = await getCategories();
        if (active && categoryResult.success && categoryResult.data) {
          setCategories(categoryResult.data);
        }
      }
      if (active) setIsLoading(false);
    };

    void load();
    return () => {
      active = false;
    };
  }, [businessId, initialCategories]);

  const handleImageSelect = (slot: ImageSlot, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setMessage({ tone: "error", text: `"${file.name}" isn't a supported image type. Use PNG, JPG, or WEBP.` });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setMessage({ tone: "error", text: `"${file.name}" is larger than 5 MB.` });
      return;
    }

    const preview = URL.createObjectURL(file);
    if (slot === "logo") {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      setLogoFile(file);
      setLogoPreview(preview);
    } else {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setCoverFile(file);
      setCoverPreview(preview);
    }
    setMessage(null);
  };

  const clearImage = (slot: ImageSlot) => {
    if (slot === "logo") {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      setLogoFile(null);
      setLogoPreview(null);
      if (logoInputRef.current) logoInputRef.current.value = "";
    } else {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setCoverFile(null);
      setCoverPreview(null);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const validateAddress = (): string | null => {
    if (addressLine.trim().length < 3) return "Street address must be at least 3 characters.";
    if (city.trim().length < 2) return "City must be at least 2 characters.";
    if (district.trim().length < 2) return "District must be at least 2 characters.";
    if (postalCode.trim().length < 3) return "Postal code must be at least 3 characters.";
    return null;
  };

  /**
   * The server's updateBusinessSchema validates these fields as URLs, so catch
   * obvious mistakes before submitting. Empty values are allowed (a blank field
   * clears the link).
   */
  const validateLinks = (): string | null =>
    validateSocialLinks([
      { label: "Website", value: websiteUrl },
      { label: "Instagram", value: instaUrl },
      { label: "TikTok", value: tiktokUrl },
    ]);

  const handleSave = async () => {
    setMessage(null);

    if (name.trim().length < 2) {
      setMessage({ tone: "error", text: "Business name must be at least 2 characters." });
      return;
    }

    const addressError = validateAddress();
    if (addressError) {
      setMessage({ tone: "error", text: addressError });
      return;
    }

    const socialError = validateLinks();
    if (socialError) {
      setMessage({ tone: "error", text: socialError });
      return;
    }

    setIsSaving(true);
    try {
      const files: BusinessImageFiles | undefined =
        logoFile || coverFile ? { logo: logoFile ?? undefined, cover: coverFile ?? undefined } : undefined;

      const updateResult = await updateBusiness(
        businessId,
        {
          name: name.trim(),
          description: description.trim(),
          categoryId: categoryId || undefined,
          businessType,
          websiteUrl: websiteUrl.trim() || undefined,
          instaUrl: instaUrl.trim() || undefined,
          tiktokUrl: tiktokUrl.trim() || undefined,
          contactEmail: contactEmail.trim() || undefined,
          contactPhone: contactPhone.trim() || undefined,
        },
        files,
      );
      if (!updateResult.ok || !updateResult.data) {
        setMessage({ tone: "error", text: updateResult.message });
        return;
      }
      const saved = updateResult.data;

      const address: AddressPayload = {
        addressLine: addressLine.trim(),
        city: city.trim(),
        district: district.trim(),
        division,
        postalCode: postalCode.trim(),
        country,
      };

      // The address endpoint returns the address record, not the business —
      // merge it into the saved business object.
      const addressResult = await updateBusinessAddress(businessId, address);
      let merged: IBusiness = saved;
      if (!addressResult.ok || !addressResult.data) {
        setMessage({ tone: "error", text: addressResult.message });
        return;
      }
      merged = {
        ...saved,
        address: {
          id: (addressResult.data as unknown as { id?: string })?.id,
          addressLine: address.addressLine,
          city: address.city,
          district: address.district,
          division: address.division,
          postalCode: address.postalCode,
          country: address.country ?? "BANGLADESH",
        },
      };

      setBusiness(merged);
      setLogoFile(null);
      setCoverFile(null);
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setLogoPreview(null);
      setCoverPreview(null);
      onSaved?.(merged);
      setMessage({ tone: "success", text: "Business updated successfully." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/80 bg-surface shadow-surface">
        <CardContent className="space-y-5 py-8" role="status">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-40" />
        </CardContent>
      </Card>
    );
  }

  if (!business) {
    return (
      <Card className="border-border/80 bg-surface shadow-surface">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertDescription>{message?.text ?? "Could not load this business."}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const verificationTone =
    business.verificationStatus === "VERIFIED"
      ? "success"
      : business.verificationStatus === "PENDING"
        ? "warning"
        : "danger";

  const logoSource = logoPreview ?? business.logoUrl;
  const coverSource = coverPreview ?? business.coverUrl;

  return (
    <Card className="border-border/80 bg-surface shadow-surface">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Update business profile</CardTitle>
            <CardDescription>Keep your public details, media, and address current.</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={verificationTone}>{business.verificationStatus.replace("_", " ")}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {message && (
          <Alert variant={message.tone === "error" ? "destructive" : "default"} className={message.tone === "success" ? "border-success/30 bg-success-soft text-success shadow-surface" : "shadow-surface"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Summary strip */}
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background/50 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
              {business.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={business.logoUrl} alt={business.name} className="h-full w-full object-cover" />
              ) : (
                <Building2 className="size-7" />
              )}
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{business.name}</p>
              <p className="text-sm text-muted-foreground">Business profile · {business.slug}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Updated {business.updatedAt ? new Date(business.updatedAt).toLocaleDateString() : "—"}</Badge>
          </div>
        </div>

        {/* Basic info */}
        <div className="space-y-4 rounded-2xl border border-border bg-background/50 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Building2 className="size-4 text-primary" />
            Basic information
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-name">Business name *</Label>
              <Input id="edit-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={255} placeholder="e.g. Northstar Home Goods" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-business-type">Business type</Label>
              <select
                id="edit-business-type"
                value={businessType}
                onChange={(event) => setBusinessType(event.target.value as IBusiness["businessType"])}
                className="h-10 w-full rounded-field border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                {BUSINESS_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <select
                id="edit-category"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="h-10 w-full rounded-field border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={5000}
                rows={4}
                placeholder="What do you sell? Add detail customers can trust."
              />
              <p className="text-xs text-muted-foreground">Up to 5,000 characters.</p>
            </div>
          </div>
        </div>

        {/* Contact & links */}
        <div className="space-y-4 rounded-2xl border border-border bg-background/50 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Globe className="size-4 text-primary" />
            Contact &amp; links
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Contact email</Label>
              <Input id="edit-email" type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="hello@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone number</Label>
              <Input id="edit-phone" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="+880 1XXX-XXXXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input id="edit-website" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-insta">Instagram</Label>
              <Input id="edit-insta" value={instaUrl} onChange={(event) => setInstaUrl(event.target.value)} placeholder="https://instagram.com/…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tiktok">TikTok</Label>
              <Input id="edit-tiktok" value={tiktokUrl} onChange={(event) => setTiktokUrl(event.target.value)} placeholder="https://tiktok.com/…" />
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="space-y-4 rounded-2xl border border-border bg-background/50 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <ImagePlus className="size-4 text-primary" />
            Logo &amp; cover photo
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-surface">
                {logoSource ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoSource} alt="Business logo" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Building2 className="size-8" />
                  </div>
                )}
                {logoFile && (
                  <button
                    type="button"
                    onClick={() => clearImage("logo")}
                    className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-danger"
                    aria-label="Remove selected logo"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <input
                ref={logoInputRef}
                id="edit-logo"
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                className="sr-only"
                onChange={(event) => handleImageSelect("logo", event)}
              />
              <Button type="button" variant="outline" className="gap-2" onClick={() => logoInputRef.current?.click()}>
                <ImagePlus className="size-4" />
                {logoFile ? "Replace logo" : business.logoUrl ? "Change logo" : "Upload logo"}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Cover photo</Label>
              <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-surface">
                {coverSource ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverSource} alt="Business cover" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <ImagePlus className="size-8" />
                  </div>
                )}
                {coverFile && (
                  <button
                    type="button"
                    onClick={() => clearImage("cover")}
                    className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-danger"
                    aria-label="Remove selected cover"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <input
                ref={coverInputRef}
                id="edit-cover"
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                className="sr-only"
                onChange={(event) => handleImageSelect("cover", event)}
              />
              <Button type="button" variant="outline" className="gap-2" onClick={() => coverInputRef.current?.click()}>
                <ImagePlus className="size-4" />
                {coverFile ? "Replace cover" : business.coverUrl ? "Change cover" : "Upload cover"}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP · max 5 MB each. Saved to the server on submit.</p>
        </div>

        {/* Address */}
        <div className="space-y-4 rounded-2xl border border-border bg-background/50 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <MapPin className="size-4 text-primary" />
            Business address
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-address-line">Street address *</Label>
              <Input id="edit-address-line" value={addressLine} onChange={(event) => setAddressLine(event.target.value)} placeholder="House, road, area" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city">City *</Label>
              <Input id="edit-city" value={city} onChange={(event) => setCity(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-district">District *</Label>
              <Input id="edit-district" value={district} onChange={(event) => setDistrict(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-division">Division *</Label>
              <select id="edit-division" value={division} onChange={(event) => setDivision(event.target.value)} className="h-10 w-full rounded-field border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                {DIVISIONS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-country">Country</Label>
              <select id="edit-country" value={country} onChange={(event) => setCountry(event.target.value)} className="h-10 w-full rounded-field border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                {COUNTRIES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-postal-code">Postal code *</Label>
              <Input id="edit-postal-code" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} />
            </div>
          </div>
        </div>

        {/* Verification note */}
        <div className="rounded-2xl border border-border bg-background/50 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <ShieldCheck className="size-4" />
                Verification details
              </p>
              <p className="text-sm text-muted-foreground">
                Trade license, NID, and supporting documents are managed in the verification section.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-success">
              <ShieldCheck className="size-4" />
              Status: {business.verificationStatus?.replace("_", " ") ?? "—"}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <Button type="button" className="gap-2" disabled={isSaving} onClick={() => void handleSave()}>
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <CheckCircle2 className="size-3.5 text-success" />
          Changes are saved to your business on the API server.
        </p>
      </CardContent>
    </Card>
  );
}