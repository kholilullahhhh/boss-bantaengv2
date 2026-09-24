import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/40 p-4">
      {/* Background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.95_0.02_240),transparent_55%)]"
      />

      <div className="relative w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          {/* Logo berdampingan */}
          <div className="flex items-center justify-center gap-3">
            {/* Logo BOSS */}
            <span
              className="
                relative flex size-16 items-center justify-center
                overflow-hidden rounded-full
                border border-border/60
                bg-white
                shadow-md
                transition-all duration-300
                hover:shadow-lg
              "
            >
              <Image
                src="/rapp.png"
                alt="Logo BOSS"
                width={64}
                height={64}
                className="size-14 object-contain"
                priority
              />
            </span>

            {/* Logo Imigrasi */}
            <span
              className="
                relative flex size-16 items-center justify-center
                overflow-hidden rounded-full
                border border-border/60
                bg-white
                shadow-md
                transition-all duration-300
                hover:shadow-lg
              "
            >
              <Image
                src="/logoimig.png"
                alt="Logo Imigrasi Bantaeng"
                width={64}
                height={64}
                className="size-14 object-contain"
                priority
              />
            </span>
          </div>

          {/* Brand */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#07172D]">
              BOSS
            </h1>

            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Bantaeng Office Smart System — Kantor Imigrasi Kelas III Non TPI
              Bantaeng
            </p>
          </div>
        </div>

        {children}
      </div>
    </main>
  );
}