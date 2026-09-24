"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[public]", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
      <p className="text-base font-semibold">Terjadi kesalahan</p>
      <p className="text-sm text-muted-foreground">
        Halaman ini gagal dimuat. Silakan coba lagi.
      </p>
      <Button onClick={reset} variant="outline" size="sm">
        Coba Lagi
      </Button>
    </div>
  );
}
