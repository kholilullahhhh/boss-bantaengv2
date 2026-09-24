"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface HeaderScrollProps {
  children: React.ReactNode;
}

export function HeaderScroll({ children }: HeaderScrollProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const isLanding = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      if (typeof document !== "undefined" && document.body.style.overflow === "hidden") {
        setScrolled(true);
        return;
      }
      setScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("focusin", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("focusin", handleScroll);
    };
  }, []);

  const className = [
    "fixed inset-x-0 top-0 z-50 w-full transition-all duration-300",
    !isLanding
      ? "border-b border-white/10 bg-[#07172D]/95 shadow-none backdrop-blur-md dark:bg-background/95 dark:border-border"
      : scrolled
        ? "border-b border-white/10 bg-slate-950/40 shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-xl dark:bg-slate-950/70"
        : "border-b border-transparent bg-transparent shadow-none backdrop-blur-0",
  ].join(" ");

  return (
    <header className={className}>
      {children}
    </header>
  );
}
