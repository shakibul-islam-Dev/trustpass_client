"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Loader2,
  Save,
  UserRound,
  LockKeyhole,
  Phone,
  Mail,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  getMe,
  getMyProfile,
  updateMe,
  updateMyProfile,
  uploadProfilePhoto,
} from "@/lib/core/profile-api";
import {
  changePassword,
  type PasswordApiResult,
} from "@/lib/core/password-api";

type Feedback = {
  type: "success" | "error";
  text: string;
};

const DEFAULT_AVATAR = "https://github.com/shadcn.png";

/** Image types the photo endpoint accepts (server's ALLOWED_MIME_TYPES). */
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Maps the API's uppercase gender to the select value used by the form. */
function genderToSelectValue(
  gender: "MALE" | "FEMALE" | "OTHER" | null,
): string {
  if (!gender) return "";
  return gender.toLowerCase();
}

export default function CompleteProfileManagement() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [linksText, setLinksText] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Load the current user + profile from the API once on mount, then hydrate
  // the form. Load failures are silent — the form keeps its placeholders, which
  // keeps this component usable on public pages where no session exists.
  useEffect(() => {
    let cancelled = false;

    async function loadCurrentProfile() {
      const [userResult, profileResult] = await Promise.all([
        getMe(),
        getMyProfile(),
      ]);

      if (cancelled) return;
      setIsLoading(false);

      const user = userResult.ok ? userResult.data : null;
      const profile = profileResult.ok ? profileResult.data : null;

      if (user) {
        setName(user.name ?? "");
        setEmail(user.email ?? "");
        setPhone(user.phone ?? "");
        setGender(genderToSelectValue(user.gender));
        if (user.image) setAvatarUrl(user.image);
      }

      if (profile) {
        setLinksText(profile.links?.join("\n") ?? "");
        if (profile.profile_photo) setAvatarUrl(profile.profile_photo);
      }
    }

    void loadCurrentProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // The server only accepts PNG / JPEG / WEBP for profile photos.
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setFeedback({
        type: "error",
        text: "Please choose a PNG, JPG, or WEBP image.",
      });
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: "error", text: "Profile photos must be 5 MB or smaller." });
      event.target.value = "";
      return;
    }

    setFeedback(null);
    setAvatarError(false);

    // Show the picked photo instantly while it uploads.
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    const previousAvatar = avatarUrl;
    setAvatarUrl(objectUrl);

    // Upload right away — the endpoint persists the photo server-side.
    setIsUploadingPhoto(true);
    const result = await uploadProfilePhoto(file);
    setIsUploadingPhoto(false);

    if (!result.ok || !result.data?.photoUrl) {
      // Revert to the previous avatar and report the failure.
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
      setAvatarUrl(previousAvatar);
      setAvatarError(false);
      setFeedback({ type: "error", text: result.message });
      event.target.value = "";
      return;
    }

    setAvatarUrl(result.data.photoUrl);
    setFeedback({ type: "success", text: "Your profile photo was updated." });
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    const hasPasswordInput = Boolean(currentPassword || newPassword || confirmPassword);

    if (hasPasswordInput && !currentPassword) {
      setFeedback({ type: "error", text: "Enter your current password to change it." });
      return;
    }

    if (hasPasswordInput && newPassword.length < 8) {
      setFeedback({ type: "error", text: "Your new password must be at least 8 characters." });
      return;
    }

    if (hasPasswordInput && newPassword !== confirmPassword) {
      setFeedback({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    const links = linksText
      .split("\n")
      .map((link) => link.trim())
      .filter(Boolean);

    const invalidLink = links.find((link) => {
      try {
        const url = new URL(link);
        return url.protocol !== "http:" && url.protocol !== "https:";
      } catch {
        return true;
      }
    });

    if (invalidLink) {
      setFeedback({
        type: "error",
        text: `This link is invalid: ${invalidLink}`,
      });
      return;
    }

    setIsSaving(true);

    try {
      const failures: string[] = [];

      // Persist the user + profile fields.
      const genderPayload =
        gender === "male" || gender === "female" || gender === "other"
          ? (gender.toUpperCase() as "MALE" | "FEMALE" | "OTHER")
          : undefined;

      const [userResult, profileResult] = await Promise.all([
        updateMe({
          name: name.trim(),
          phone: phone.trim() || undefined,
          gender: genderPayload,
        }),
        updateMyProfile({ links }),
      ]);

      if (!userResult.ok) failures.push(userResult.message);
      if (!profileResult.ok) failures.push(profileResult.message);

      // Change the password when the fields were filled in.
      if (hasPasswordInput) {
        const passwordResult: PasswordApiResult = await changePassword({
          currentPassword,
          newPassword,
          revokeOtherSessions: true,
        });
        if (!passwordResult.ok) failures.push(passwordResult.message);
      }

      if (failures.length > 0) {
        setFeedback({ type: "error", text: failures.join(" ") });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFeedback({
        type: "success",
        text: "Your profile was updated successfully.",
      });
    } catch {
      setFeedback({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main
        aria-busy="true"
        className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 md:px-0"
      >
        <header className="space-y-1">
          <p className="text-sm font-medium text-primary">ACCOUNT</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Profile settings
          </h1>
        </header>
        <div className="h-44 animate-pulse rounded-xl bg-muted/60" />
        <div className="h-72 animate-pulse rounded-xl bg-muted/60" />
        <div className="h-40 animate-pulse rounded-xl bg-muted/60" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 md:px-0">
      <header className="space-y-1">
        <p className="text-sm font-medium text-primary">ACCOUNT</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Profile settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal details, security, and public profile.
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        {feedback && (
          <Alert variant={feedback.type === "error" ? "destructive" : "default"}>
            {feedback.type === "error" ? (
              <AlertCircle className="size-4" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            <AlertDescription>{feedback.text}</AlertDescription>
          </Alert>
        )}

        <Card className="overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-primary/20 via-primary/10 to-muted" />
          <CardContent className="relative px-6 pb-6">
            <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="size-24 shrink-0 overflow-hidden rounded-full border-4 border-background bg-muted shadow-sm">
                  {!avatarError ? (
                    <img
                      src={avatarUrl}
                      alt="Profile preview"
                      className="size-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <UserRound className="size-9 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 pb-1">
                  <h2 className="truncate text-lg font-semibold">
                    {name.trim() || "Your name"}
                  </h2>
                  <p className="truncate text-sm text-muted-foreground">
                    {email || "Your email address"}
                  </p>
                </div>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  id="avatar-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={handleImageChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={isUploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Camera className="size-4" />
                  )}
                  {isUploadingPhoto ? "Uploading…" : "Change photo"}
                </Button>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP · Max 5 MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserRound className="size-5 text-primary" />
              <CardTitle className="text-lg">Personal information</CardTitle>
            </div>
            <CardDescription>
              Keep your contact details and public profile up to date.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="pl-9"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    readOnly
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Your email is tied to your account and cannot be changed here.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    className="pl-9"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+880 1XXX-XXXXXX"
                    maxLength={25}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={(value) => setGender(value ?? "")}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LockKeyhole className="size-5 text-primary" />
              <CardTitle className="text-lg">Change password</CardTitle>
            </div>
            <CardDescription>
              Leave these fields empty if you do not want to change your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter new password"
                  minLength={8}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LinkIcon className="size-5 text-primary" />
              <CardTitle className="text-lg">Social links</CardTitle>
            </div>
            <CardDescription>
              Add your portfolio or social profile URLs, one per line.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="social-links">Profile URLs</Label>
            <Textarea
              id="social-links"
              value={linksText}
              onChange={(event) => setLinksText(event.target.value)}
              placeholder={"https://github.com/yourname\nhttps://yourportfolio.com"}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Use complete URLs beginning with https:// or http://.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Remember to save your changes before leaving this page.
          </p>
          <Button type="submit" disabled={isSaving} className="gap-2 sm:min-w-36">
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save changes
              </>
            )}
          </Button>
        </div>
      </form>
    </main>
  );
}