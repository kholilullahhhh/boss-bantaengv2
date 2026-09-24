import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/40 p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.95_0.02_240),transparent_55%)]"
      />
      <div className="relative w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="relative flex size-16 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-white shadow-md">
            <Image
              src="/rapp.png"
              alt="Logo BOSS"
              width={64}
              height={64}
              className="size-14 object-contain"
              priority
            />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">BOSS</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Bantaeng Office Smart System — Kantor Imigrasi Kelas III Non TPI
            Bantaeng
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
