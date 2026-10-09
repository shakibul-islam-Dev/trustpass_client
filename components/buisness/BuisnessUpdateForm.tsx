"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  FileText,
  Globe,
  Loader2,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getBusinessById,
  updateBusiness,
  updateBusinessAddress,
  type AddressPayload,
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

interface BuisnessUpdateFormProps {
  /** The business to load and edit. */
  businessId: string;
  /** Called after a successful save so the parent can refresh its list. */
  onSaved?: (business: IBusiness) => void;
}

export default function BuisnessUpdateForm({ businessId, onSaved }: BuisnessUpdateFormProps) {
  const [business, setBusiness] = useState<IBusiness | null>(null);

  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [division, setDivision] = useState<string>("DHAKA");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState<string>("BANGLADESH");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setMessage(null);
      const result = await getBusinessById(businessId);
      if (!active) return;

      if (!result.ok || !result.data) {
        setMessage({ tone: "error", text: result.message });
        setIsLoading(false);
        return;
      }

      const loaded = result.data;
      setBusiness(loaded);
      setName(loaded.name ?? "");
      setContactEmail(loaded.contactEmail ?? "");
      setContactPhone(loaded.contactPhone ?? "");
      setWebsiteUrl(loaded.websiteUrl ?? "");
      setAddressLine(loaded.address?.addressLine ?? "");
      setCity(loaded.address?.city ?? "");
      setDistrict(loaded.address?.district ?? "");
      setDivision(loaded.address?.division ?? "DHAKA");
      setPostalCode(loaded.address?.postalCode ?? "");
      setCountry(loaded.address?.country ?? "BANGLADESH");
      setIsLoading(false);
    };

    void load();
    return () => {
      active = false;
    };
  }, [businessId]);

  const validateAddress = (): string | null => {
    if (addressLine.trim().length < 3) return "Street address must be at least 3 characters.";
    if (city.trim().length < 2) return "City must be at least 2 characters.";
    if (district.trim().length < 2) return "District must be at least 2 characters.";
    if (postalCode.trim().length < 3) return "Postal code must be at least 3 characters.";
    return null;
  };

  const handleSave = async () => {
    setMessage(null);

    const addressError = validateAddress();
    if (addressError) {
      setMessage({ tone: "error", text: addressError });
      return;
    }

    setIsSaving(true);
    try {
      const address: AddressPayload = {
        addressLine: addressLine.trim(),
        city: city.trim(),
        district: district.trim(),
        division,
        postalCode: postalCode.trim(),
        country,
      };

      let saved: IBusiness;

      const updateResult = await updateBusiness(businessId, {
        name: name.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
      });
      if (!updateResult.ok || !updateResult.data) {
        setMessage({ tone: "error", text: updateResult.message });
        return;
      }
      saved = updateResult.data;

      const addressResult = await updateBusinessAddress(businessId, address);
      if (!addressResult.ok || !addressResult.data) {
        setMessage({ tone: "error", text: addressResult.message });
        return;
      }
      saved = addressResult.data;

      setBusiness(saved);
      onSaved?.(saved);
      setMessage({ tone: "success", text: "Business updated successfully." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/80 bg-surface shadow-surface">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Loading business details…
        </CardContent>
      </Card>
    );
  }

  const verificationTone =
    business?.verificationStatus === "VERIFIED"
      ? "success"
      : business?.verificationStatus === "PENDING"
        ? "warning"
        : "danger";

  return (
    <Card className="border-border/80 bg-surface shadow-surface">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Update business profile</CardTitle>
            <CardDescription>Keep your public details and address accurate and current.</CardDescription>
          </div>

          {business?.verificationStatus && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={verificationTone}>{business.verificationStatus.replace("_", " ")}</Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {message && (
          <Alert variant={message.tone === "error" ? "destructive" : "default"} className={message.tone === "success" ? "border-success/30 bg-success-soft text-success shadow-surface" : "shadow-surface"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background/50 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Building2 className="size-7" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{business?.name}</p>
              <p className="text-sm text-muted-foreground">Business profile</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Updated {business?.updatedAt ? new Date(business.updatedAt).toLocaleDateString() : "—"}</Badge>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Business name</Label>
            <Input id="edit-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Contact email</Label>
            <Input id="edit-email" type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Phone number</Label>
            <Input id="edit-phone" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-website">Website</Label>
            <Input id="edit-website" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://…" />
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-background/50 p-4">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Business address</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-address-line">Street address</Label>
              <Input id="edit-address-line" value={addressLine} onChange={(event) => setAddressLine(event.target.value)} placeholder="House, road, area" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city">City</Label>
              <Input id="edit-city" value={city} onChange={(event) => setCity(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-district">District</Label>
              <Input id="edit-district" value={district} onChange={(event) => setDistrict(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-division">Division</Label>
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
              <Label htmlFor="edit-postal-code">Postal code</Label>
              <Input id="edit-postal-code" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background/50 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <FileText className="size-4" />
                Verification details
              </p>
              <p className="text-sm text-muted-foreground">
                Trade license, NID, and supporting documents are managed in the verification section.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-success">
              <ShieldCheck className="size-4" />
              Status: {business?.verificationStatus?.replace("_", " ") ?? "—"}
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