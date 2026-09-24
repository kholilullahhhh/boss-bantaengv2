import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-white shadow-sm">
              <Image
                src="/logoimig.png"
                alt="Logo Imigrasi"
                width={44}
                height={44}
                className="size-10 object-contain"
              />
            </span>
            <div>
              <p className="text-sm font-semibold">BOSS</p>
              <p className="text-xs text-muted-foreground">
                Bantaeng Office Smart System
              </p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Sistem informasi digital Kantor Imigrasi Kelas III Non TPI Bantaeng —
            pengelolaan dokumen, agenda, dan layanan internal yang cepat dan aman.
          </p>
          <div className="flex items-center gap-3">
            <span className="relative flex size-10 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-white p-1">
              <Image
                src="/LogoO.png"
                alt="Kementerian Imigrasi dan Pemasyarakatan RI"
                width={36}
                height={36}
                className="size-8 object-contain"
              />
            </span>
            <span className="relative flex size-10 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-white p-1">
              <Image
                src="/rapp.png"
                alt="Lambang Bantaeng"
                width={36}
                height={36}
                className="size-8 object-contain"
              />
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Tautan</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {[
              { href: "/", label: "Beranda" },
              { href: "/agenda", label: "Agenda" },
              { href: "/kontak", label: "Kontak" },
              { href: "/login", label: "Masuk" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-foreground hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Kantor</p>
          <address className="space-y-1 text-sm not-italic text-muted-foreground">
            <p>Kantor Imigrasi Kelas III Non TPI Bantaeng</p>
            <p>Jl. Bersama, Kabupaten Bantaeng, Sulawesi Selatan</p>
            <p>imigrasi-bantaeng.go.id</p>
          </address>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} BOSS — Bantaeng Office Smart System.
      </div>
    </footer>
  );
}
