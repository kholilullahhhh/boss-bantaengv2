"use client";

import { useEffect, useState } from "react";

interface HeaderScrollProps {
  children: React.ReactNode;
}

export function HeaderScroll({ children }: HeaderScrollProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "border-white/10 bg-[#07172D]/75 shadow-lg shadow-black/20 backdrop-blur-xl"
          : "border-white/10 bg-[#07172D]/95 backdrop-blur-md",
      ].join(" ")}
    >
      {children}
    </header>
  );
}