"use client";

import { usePathname } from "next/navigation";

interface PublicMainProps {
  children: React.ReactNode;
}

export function PublicMain({ children }: PublicMainProps) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <main className={isLanding ? "flex-1" : "flex-1 pt-[72px]"}>
      {children}
    </main>
  );
}
