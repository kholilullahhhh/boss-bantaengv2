import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { HeaderScroll } from "@/components/layout/header-scroll";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/agenda", label: "Agenda" },
  { href: "/kontak", label: "Kontak" },
];

export async function SiteHeader() {
  const session = await auth();

  return (
    <HeaderScroll>
      <div className="mx-auto flex h-[72px] w-full max-w-6xl items-center justify-between gap-4 px-4 lg:px-6">
        {/* BRAND */}
        <Link href="/" className="group flex min-w-0 items-center gap-2.5">
          {/* Logo BOSS */}
          <span
            className="
              relative flex size-10 shrink-0 items-center justify-center
              overflow-hidden rounded-full
              border border-white/20
              bg-white/95
              shadow-sm
              transition-all duration-300
              group-hover:border-[#D8B84C]
            "
          >
            <Image
              src="/rapp.png"
              alt="Logo BOSS"
              width={40}
              height={40}
              className="size-9 object-contain"
              priority
            />
          </span>

          {/* Logo Imigrasi */}
          <span
            className="
              relative flex size-10 shrink-0 items-center justify-center
              overflow-hidden rounded-full
              border border-white/20
              bg-white/95
              shadow-sm
              transition-all duration-300
              group-hover:border-[#D8B84C]
            "
          >
            <Image
              src="/logoimig.png"
              alt="Logo Imigrasi Bantaeng"
              width={40}
              height={40}
              className="size-9 object-contain"
              priority
            />
          </span>

          {/* Brand */}
          <span className="min-w-0 leading-tight">
            <span className="block text-sm font-bold tracking-tight text-white">
              BOSS
            </span>

            <span className="hidden truncate text-[11px] text-white/65 sm:block">
              Bantaeng Office Smart System
            </span>
          </span>
        </Link>

        {/* NAVIGATION */}
        <nav
          aria-label="Navigasi utama"
          className="
    absolute left-1/2
    hidden -translate-x-1/2
    items-center gap-1
    sm:flex
  "
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="
        group relative rounded-lg
        px-3.5 py-2
        text-sm font-medium
        text-white/80
        transition-all duration-200
        hover:bg-white/10
        hover:text-white
      "
            >
              {link.label}

              <span
                className="
          absolute inset-x-3 bottom-1
          h-0.5 origin-center scale-x-0
          rounded-full
          bg-[#D8B84C]
          transition-transform duration-200
          group-hover:scale-x-100
        "
              />
            </Link>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="flex shrink-0 items-center gap-2">
          {session?.user ? (
            <Button
              asChild
              size="sm"
              className="
                border border-white/25
                bg-white/10
                px-4
                text-white
                shadow-none
                backdrop-blur-sm
                transition-all duration-200
                hover:border-white/40
                hover:bg-white/20
                hover:text-white
              "
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              {/* Daftar */}
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="
                  hidden
                  text-white/80
                  transition-all duration-200
                  hover:bg-white/10
                  hover:text-white
                  sm:inline-flex
                "
              >
                <Link href="/register">Daftar</Link>
              </Button>

              {/* Masuk */}
              <Button
                asChild
                size="sm"
                className="
                  border border-white/20
                  bg-white
                  px-4
                  font-medium
                  text-[#07172D]
                  shadow-sm
                  transition-all duration-200
                  hover:bg-white/90
                "
              >
                <Link href="/login">Masuk</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </HeaderScroll>
  );
}
