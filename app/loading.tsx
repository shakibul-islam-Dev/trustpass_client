export default function Loading() {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        {/* Simple CSS Spinner */}
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-sm font-medium text-slate-600">Loading...</p>
      </div>
    </div>
  );
}
