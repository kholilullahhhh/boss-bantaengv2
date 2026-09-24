"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[root]", error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          background: "hsl(0 0% 98%)",
          color: "hsl(0 0% 9%)",
        }}
      >
        <div style={{ textAlign: "center", padding: 24, maxWidth: 440 }}>
          <AlertTriangle style={{ width: 40, height: 40, margin: "0 auto 12px", color: "hsl(0 72% 51%)" }} />
          <h1 style={{ fontSize: 18, margin: "0 0 8px" }}>Terjadi kesalahan</h1>
          <p style={{ fontSize: 14, color: "hsl(0 0% 45%)", margin: "0 0 16px" }}>
            BOSS tidak dapat memproses permintaan ini. Silakan coba lagi atau hubungi administrator.
          </p>
          <Button onClick={reset}>Coba Lagi</Button>
        </div>
      </body>
    </html>
  );
}
