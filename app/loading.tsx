export default function Loading() {
  return (
    <div className="flex w-full flex-1 items-center justify-center px-4 py-24">
      <div className="flex flex-col items-center gap-2">
        {/* Simple CSS Spinner */}
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
