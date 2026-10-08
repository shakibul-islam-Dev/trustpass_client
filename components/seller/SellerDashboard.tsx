"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardCheck,
  Compass,
  Package,
  ShieldCheck,
  Store,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { getBusinesses } from "@/lib/business-api/all-business";
import type { IBusiness, IBusinessesResponse } from "@/types/business";
import BusinessDocumentStatuses, { type BusinessDocumentStatusItem } from "./BusinessDocumentStatuses";
import BusinessCreationWizard from "./BusinessCreationWizard";
import SellerBusinessDirectory from "./SellerBusinessDirectory";
import SellerProductManagement from "./SellerProductManagement";
import ProfilePhotoPicker from "./ProfilePhotoPicker";
import TrustScoreBreakdown from "./TrustScoreBreakdown";

const sections = [
  { id: "overview", label: "Overview", icon: ChartNoAxesCombined },
  { id: "business", label: "Business setup", icon: Building2 },
  { id: "products", label: "Products", icon: Package },
  { id: "directory", label: "Marketplace", icon: Compass },
  { id: "verification", label: "Verification", icon: ShieldCheck },
] as const;

type SectionId = (typeof sections)[number]["id"];

const verificationPresentation: Record<
  IBusiness["verificationStatus"],
  { label: string; variant: "success" | "warning" | "danger" | "outline" }
> = {
  VERIFIED: { label: "Verified", variant: "success" },
  PENDING: { label: "Under review", variant: "warning" },
  REJECTED: { label: "Action required", variant: "danger" },
  SUSPENDED: { label: "Suspended", variant: "danger" },
  UNVERIFIED: { label: "Not submitted", variant: "outline" },
};

const toDocumentStatus = (business: IBusiness): BusinessDocumentStatusItem => {
  const status: BusinessDocumentStatusItem["status"] =
    business.verificationStatus === "VERIFIED"
      ? "APPROVED"
      : business.verificationStatus === "PENDING"
        ? "PENDING"
        : business.verificationStatus === "REJECTED" || business.verificationStatus === "SUSPENDED"
          ? "REJECTED"
          : "MISSING";

  return {
    id: business.id,
    name: "Business verification",
    status,
    updatedAt: new Date(business.updatedAt).toLocaleDateString(),
  };
};

export default function SellerDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [businesses, setBusinesses] = useState<IBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [businessesLoading, setBusinessesLoading] = useState(true);
  const [businessesError, setBusinessesError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;

    const loadBusinesses = async () => {
      setBusinessesLoading(true);
      try {
        const response: IBusinessesResponse = await getBusinesses({ page: 1, limit: 100 });
        if (!response.success || !response.data) {
          throw new Error(response.error || response.message || "Could not load your business profiles.");
        }

        const ownedBusinesses = response.data.filter((business) => business.ownerId === user.id);
        if (active) {
          setBusinesses(ownedBusinesses);
          setSelectedBusinessId((current) =>
            ownedBusinesses.some((business) => business.id === current)
              ? current
              : ownedBusinesses[0]?.id ?? "",
          );
          setBusinessesError(null);
        }
      } catch (error) {
        console.error("Could not load seller businesses:", error);
        if (active) {
          setBusinessesError(error instanceof Error ? error.message : "Could not load your business profiles.");
        }
      } finally {
        if (active) setBusinessesLoading(false);
      }
    };

    void loadBusinesses();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const selectedBusiness = businesses.find((business) => business.id === selectedBusinessId);
  const verification = selectedBusiness
    ? verificationPresentation[selectedBusiness.verificationStatus]
    : null;
  const documents = selectedBusiness ? [toDocumentStatus(selectedBusiness)] : [];
  const initials = (user?.name || "Seller")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7">
      <header className="flex flex-col gap-6 rounded-3xl border border-border/70 bg-surface p-6 shadow-surface sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="max-w-2xl">
          <Badge variant="outline" className="mb-4 gap-1.5 border-primary/20 bg-primary/5 text-primary">
            <Store className="size-3.5" />
            Seller workspace
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : " back"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
            Build your business profile, manage your product catalog, and grow customer trust—all in one place.
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-background/60 p-4 sm:min-w-64">
          <Avatar className="size-12 border border-border">
            <AvatarImage src={user?.image ?? undefined} alt="" />
            <AvatarFallback className="bg-primary/10 font-semibold text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{user?.name || "Seller account"}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <BadgeCheck className="ml-auto size-5 shrink-0 text-primary" aria-label="Seller account" />
        </div>
      </header>

      <nav aria-label="Seller dashboard sections" className="overflow-x-auto border-b border-border">
        <div role="tablist" aria-label="Seller dashboard" className="flex min-w-max gap-1">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`seller-tab-${id}`}
              aria-selected={activeSection === id}
              aria-controls={`seller-panel-${id}`}
              onClick={() => setActiveSection(id)}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeSection === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <section
        id="seller-panel-overview"
        role="tabpanel"
        aria-labelledby="seller-tab-overview"
        hidden={activeSection !== "overview"}
        className="space-y-6"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewCard
            icon={Building2}
            label="Business profile"
            value={businessesLoading ? "Loading…" : businesses.length ? `${businesses.length} profile${businesses.length === 1 ? "" : "s"}` : "Get started"}
            description={selectedBusiness ? selectedBusiness.name : "Create your first business profile"}
            onClick={() => setActiveSection("business")}
          />
          <OverviewCard
            icon={Package}
            label="Product catalog"
            value="Manage products"
            description="Add products and keep your catalog current"
            onClick={() => setActiveSection("products")}
          />
          <OverviewCard
            icon={ShieldCheck}
            label="Verification"
            value={verification?.label ?? "Set up your profile"}
            description={selectedBusiness ? "Current business review status" : "Verification starts with your business profile"}
            onClick={() => setActiveSection("verification")}
          />
          <OverviewCard
            icon={CircleDollarSign}
            label="Payments"
            value="Not connected"
            description="Payment tools are not connected yet"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-border/80 bg-surface shadow-surface">
            <CardHeader>
              <CardTitle>Getting started</CardTitle>
              <CardDescription>Set up the essentials to make your business ready for customers.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <ActionCard
                icon={Building2}
                title="Create your business profile"
                description="Add your business details and verification documents."
                onClick={() => setActiveSection("business")}
              />
              <ActionCard
                icon={Package}
                title="Build your product catalog"
                description="Create listings and keep stock information organized."
                onClick={() => setActiveSection("products")}
              />
              <ActionCard
                icon={Compass}
                title="Explore the marketplace"
                description="Browse the businesses listed on TrustPass."
                onClick={() => setActiveSection("directory")}
              />
              <ActionCard
                icon={ClipboardCheck}
                title="Review verification"
                description="Check your business review and trust score."
                onClick={() => setActiveSection("verification")}
              />
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-surface shadow-surface">
            <CardHeader>
              <CardTitle>Your account</CardTitle>
              <CardDescription>Personalize your seller profile.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfilePhotoPicker name={user?.name || "Seller profile photo"} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        id="seller-panel-business"
        role="tabpanel"
        aria-labelledby="seller-tab-business"
        hidden={activeSection !== "business"}
        className="space-y-5"
      >
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
          You can prepare your profile and documents here. Business submission is not connected to the server yet, so the final submit action is unavailable.
        </div>
        <BusinessCreationWizard />
      </section>

      <section
        id="seller-panel-products"
        role="tabpanel"
        aria-labelledby="seller-tab-products"
        hidden={activeSection !== "products"}
        className="space-y-5"
      >
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Product catalog</h2>
          <p className="mt-1 text-sm text-muted-foreground">Organize your listings and inventory in one place.</p>
        </div>
        <SellerProductManagement />
      </section>

      <section
        id="seller-panel-directory"
        role="tabpanel"
        aria-labelledby="seller-tab-directory"
        hidden={activeSection !== "directory"}
        className="space-y-5"
      >
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Marketplace directory</h2>
          <p className="mt-1 text-sm text-muted-foreground">Browse businesses listed on TrustPass.</p>
        </div>
        <SellerBusinessDirectory />
      </section>

      <section
        id="seller-panel-verification"
        role="tabpanel"
        aria-labelledby="seller-tab-verification"
        hidden={activeSection !== "verification"}
        className="space-y-5"
      >
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Verification & trust</h2>
          <p className="mt-1 text-sm text-muted-foreground">Review your business status and the information available to customers.</p>
        </div>

        {businessesError && (
          <div role="alert" className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
            {businessesError}
          </div>
        )}

        {businesses.length > 1 && (
          <label className="block max-w-md space-y-2 text-sm font-medium text-foreground">
            Business profile
            <select
              value={selectedBusinessId}
              onChange={(event) => setSelectedBusinessId(event.target.value)}
              className="h-10 w-full rounded-field border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>{business.name}</option>
              ))}
            </select>
          </label>
        )}

        {businessesLoading ? (
          <p role="status" className="rounded-xl border border-border bg-surface p-5 text-sm text-muted-foreground">Loading your verification details…</p>
        ) : selectedBusiness ? (
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <Card className="border-border/80 bg-surface shadow-surface">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{selectedBusiness.name}</CardTitle>
                    <CardDescription className="mt-1">Business verification status</CardDescription>
                  </div>
                  {verification && <Badge variant={verification.variant}>{verification.label}</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <BusinessDocumentStatuses documents={documents} />
                <p className="text-xs leading-5 text-muted-foreground">
                  The business API currently provides an overall verification status, not individual document review results.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/80 bg-surface shadow-surface">
              <CardHeader>
                <CardTitle>Trust score</CardTitle>
                <CardDescription>Your current score and available breakdown.</CardDescription>
              </CardHeader>
              <CardContent>
                <TrustScoreBreakdown
                  score={selectedBusiness.trustScore}
                  factors={[]}
                  businessName={selectedBusiness.name}
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-dashed border-border bg-surface shadow-none">
            <CardContent className="flex flex-col items-center px-6 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="size-6" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">No business profile yet</h3>
              <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                Create a business profile to see its verification status and trust score here.
              </p>
              <Button type="button" className="mt-5 gap-2" onClick={() => setActiveSection("business")}>
                Set up a business
                <ArrowUpRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

function OverviewCard({
  icon: Icon,
  label,
  value,
  description,
  onClick,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  description: string;
  onClick?: () => void;
}) {
  const content = (
    <Card className={`h-full border-border/80 bg-surface text-left shadow-surface ${onClick ? "transition-colors hover:border-primary/30" : ""}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
          {onClick && <ArrowUpRight className="size-4 text-muted-foreground" />}
        </div>
        <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
    >
      {content}
    </button>
  ) : (
    <div>{content}</div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: typeof Building2;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-start gap-3 rounded-xl border border-border bg-background/40 p-4 text-left transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2 text-sm font-medium text-foreground">
          {title}
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}
