import { ArrowLeft, LockKeyhole, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AccountAccessNoticeProps {
  title?: string;
  message?: string;
  onBack?: () => void;
}

export default function AccountAccessNotice({
  title = "Access restricted",
  message = "Your current account does not have access to this page. Return to your dashboard or contact support.",
  onBack,
}: AccountAccessNoticeProps) {
  return (
    <main className="flex min-h-[55vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg border-border/80 bg-surface shadow-surface">
        <CardContent className="space-y-5 p-6 text-center sm:p-8">
          <div className="relative mx-auto flex size-16 items-center justify-center rounded-2xl bg-warning/10 text-warning">
            <LockKeyhole className="size-7" />
            <span className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border-2 border-surface bg-surface text-muted-foreground">
              <ShieldAlert className="size-4" />
            </span>
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
          </div>
          {onBack && (
            <Button type="button" variant="outline" className="gap-2" onClick={onBack}>
              <ArrowLeft className="size-4" />
              Back to dashboard
            </Button>
          )}
          <p className="text-xs text-muted-foreground">Access notice UI only; authorization must be enforced by the route and server.</p>
        </CardContent>
      </Card>
    </main>
  );
}
