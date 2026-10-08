import { AlertCircle, CheckCircle2, Info, LoaderCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export type SellerFormState =
  | { status: "idle" }
  | { status: "loading"; message?: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string; retry?: () => void }
  | { status: "empty"; message: string };

interface SellerFormFeedbackProps {
  state: SellerFormState;
}

export default function SellerFormFeedback({ state }: SellerFormFeedbackProps) {
  if (state.status === "idle") return null;

  if (state.status === "loading") {
    return (
      <div role="status" className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin text-primary" />
        {state.message ?? "Loading…"}
      </div>
    );
  }

  if (state.status === "success") {
    return (
      <Alert className="border-success/30 bg-success/5 text-success">
        <CheckCircle2 />
        <AlertTitle>Saved successfully</AlertTitle>
        <AlertDescription>{state.message}</AlertDescription>
      </Alert>
    );
  }

  if (state.status === "error") {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Something needs attention</AlertTitle>
        <AlertDescription>{state.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert>
      <Info className="text-muted-foreground" />
      <AlertTitle>{state.status === "empty" ? "Nothing here yet" : "Information"}</AlertTitle>
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  );
}
