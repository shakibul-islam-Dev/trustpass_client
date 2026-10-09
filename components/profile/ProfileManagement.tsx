"use client";

import { useEffect, useState } from "react";
import { Camera, Loader2, Save } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProfilePhotoPicker from "@/components/seller/ProfilePhotoPicker";
import {
  getMe,
  getMyProfile,
  updateMe,
  updateMyProfile,
  type ApiUser,
} from "@/lib/core/profile-api";

const VALID_LINK_PREFIXES = ["https://", "http://"];

export default function ProfileManagement() {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [links, setLinks] = useState<string[]>([]);
  const [about, setAbout] = useState("");
  const [linksText, setLinksText] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [userResult, profileResult] = await Promise.all([getMe(), getMyProfile()]);
      if (!active) return;

      if (!userResult.ok || !userResult.data) {
        setLoadError(userResult.message);
        setIsLoading(false);
        return;
      }

      setUser(userResult.data);
      setAbout(profileResult.data?.about ?? "");
      setLinks(profileResult.data?.links ?? []);
      setLinksText((profileResult.data?.links ?? []).join("\n"));
      setIsLoading(false);
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const parsedLinks = linksText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const handleSave = async () => {
    setMessage(null);

    const invalidLink = parsedLinks.find((link) => !VALID_LINK_PREFIXES.some((prefix) => link.startsWith(prefix)));
    if (invalidLink) {
      setMessage({ tone: "error", text: `"${invalidLink}" is not a valid link — start it with https:// or http://` });
      return;
    }

    setIsSaving(true);
    try {
      const name = user?.name?.trim() ?? "";
      if (name.length > 0 && name.length < 2) {
        setMessage({ tone: "error", text: "Name must be at least 2 characters." });
        return;
      }

      const [userResult, profileResult] = await Promise.all([
        updateMe({
          name: name || undefined,
          phone: user?.phone?.trim() || undefined,
          gender: user?.gender ?? undefined,
        }),
        updateMyProfile({ about: about.trim() || undefined, links: parsedLinks }),
      ]);

      if (!userResult.ok || !profileResult.ok) {
        setMessage({ tone: "error", text: userResult.ok ? profileResult.message : userResult.message });
        return;
      }

      if (userResult.data) setUser(userResult.data);
      setMessage({ tone: "success", text: "Profile updated successfully." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
        Loading profile…
      </div>
    );
  }

  if (loadError) {
    return (
      <Card className="border-border/80 bg-surface shadow-surface">
        <CardContent className="py-8 text-center text-sm text-danger">{loadError}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 xl:p-8">
      <Card className="overflow-hidden border-border/80 bg-surface shadow-surface">
        <CardContent className="p-0">
          <div className="flex flex-col gap-6 border-b border-border/80 bg-gradient-to-r from-primary/5 via-background to-surface p-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-4">
              <ProfilePhotoPicker name={user?.name || "Your profile photo"} />
              <div>
                <p className="text-lg font-semibold text-foreground">{user?.name || "Your account"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {user?.role && (
                  <Badge variant="outline" className="mt-2 border-primary/20 bg-primary/5 text-primary">
                    {user.role}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <CardContent className="space-y-5 p-6">
            {message && (
              <Alert variant={message.tone === "error" ? "destructive" : "default"} className={message.tone === "success" ? "border-success/30 bg-success-soft text-success shadow-surface" : "shadow-surface"}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input value={user?.name ?? ""} onChange={(event) => setUser((current) => (current ? { ...current, name: event.target.value } : current))} />
              </div>

              <div className="space-y-2">
                <Label>Email address</Label>
                <Input value={user?.email ?? ""} disabled />
              </div>

              <div className="space-y-2">
                <Label>Phone number</Label>
                <Input placeholder="+880 1XXX-XXXXXX" value={user?.phone ?? ""} onChange={(event) => setUser((current) => (current ? { ...current, phone: event.target.value } : current))} />
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <select
                  value={user?.gender ?? ""}
                  onChange={(event) => setUser((current) => (current ? { ...current, gender: (event.target.value || null) as ApiUser["gender"] } : current))}
                  className="h-10 w-full rounded-field border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <option value="">Prefer not to say</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-about">About</Label>
              <Textarea id="profile-about" placeholder="Tell customers a little about yourself…" value={about} onChange={(event) => setAbout(event.target.value)} maxLength={500} />
              <p className="text-right text-xs text-muted-foreground">{about.length}/500</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-links">Links</Label>
              <Textarea
                id="profile-links"
                placeholder={"One link per line, e.g.\nhttps://facebook.com/yourpage"}
                value={linksText}
                onChange={(event) => setLinksText(event.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Each link must start with https:// or http://</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" className="gap-2" disabled={isSaving} onClick={() => void handleSave()}>
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {isSaving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </CardContent>
        </CardContent>
      </Card>

      <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Camera className="size-3.5" />
        Photo upload, name, and links are saved to your account on the API server.
      </p>
    </div>
  );
}