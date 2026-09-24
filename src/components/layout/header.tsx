"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import { navTitleForPath } from "@/components/layout/nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import type { SessionUser } from "@/server/queries/session";

interface HeaderProps {
  user: SessionUser;
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const sectionTitle = navTitleForPath(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 lg:px-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        {sectionTitle && sectionTitle !== "Dashboard" && (
          <Fragment>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <span className="font-medium text-foreground">{sectionTitle}</span>
          </Fragment>
        )}
      </nav>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
