"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PublicNavLink {
  href: string;
  label: string;
}

interface PublicNavProps {
  links: PublicNavLink[];
}

export function PublicNav({ links }: PublicNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop nav (sm+) */}
      <nav
        aria-label="Navigasi utama"
        className="
          absolute left-1/2
          hidden -translate-x-1/2
          items-center gap-1
          sm:flex
        "
      >
        {links.map((link) => (
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

      {/* Mobile toggle (below sm) */}
      <button
        type="button"
        aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="
          flex size-11 items-center justify-center rounded-lg
          text-white/90 transition-colors
          hover:bg-white/10 hover:text-white
          sm:hidden
        "
      >
        {open ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <Menu className="size-5" aria-hidden="true" />
        )}
      </button>

      {/* Mobile drawer */}
      {open && (
        <div
          className="absolute inset-x-0 top-full border-b border-white/10 bg-slate-950/95 backdrop-blur-xl sm:hidden"
          role="navigation"
          aria-label="Navigasi seluler"
        >
          <nav className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-3 text-sm font-medium text-white/85 transition-colors",
                  "hover:bg-white/10 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
