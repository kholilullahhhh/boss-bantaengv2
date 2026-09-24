"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardGroupError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard-group]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
      <p className="text-base font-semibold">Terjadi kesalahan</p>
      <p className="max-w-md text-sm text-muted-foreground">
        Halaman ini gagal dimuat. Silakan coba lagi.
      </p>
      <Button onClick={reset} variant="outline" size="sm">
        Coba Lagi
      </Button>
    </div>
  );
}
