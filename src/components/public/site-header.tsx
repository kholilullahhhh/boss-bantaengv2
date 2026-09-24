import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/agenda", label: "Agenda" },
  { href: "/kontak", label: "Kontak" },
];

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-white shadow-sm">
            <Image
              src="/logoimig.png"
              alt="Logo Imigrasi"
              width={40}
              height={40}
              className="size-9 object-contain"
              priority
            />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight">BOSS</span>
            <span className="block text-xs text-muted-foreground">
              Bantaeng Office Smart System
            </span>
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link href="/register">Daftar</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/login">Masuk</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
