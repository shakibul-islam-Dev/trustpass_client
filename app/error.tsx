"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
  
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-2xl font-bold text-slate-800">
        Something went wrong!
      </h2>
      <p className="max-w-md text-sm text-slate-600">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={() => reset()} // পেজ রি-রেন্ডার করে পুনরায় চেষ্টা করার জন্য
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );
}
