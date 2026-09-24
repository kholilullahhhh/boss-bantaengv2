"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { NavItem } from "@/components/layout/nav";

interface SidebarContentProps {
  items: NavItem[];
  onNavigate?: () => void;
}

export function SidebarContent({ items, onNavigate }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center gap-3 px-2">
        <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-card shadow-sm">
          <Image
            src="/LogoBOSS.png"
            alt="Logo BOSS"
            width={40}
            height={40}
            className="size-9 object-contain"
            priority
          />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">BOSS</p>
          <p className="truncate text-xs text-muted-foreground">Bantaeng Office Smart System</p>
        </div>
      </div>

      <nav aria-label="Menu utama" className="flex-1 space-y-1">
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-2 pt-4 text-xs leading-relaxed text-muted-foreground">
        Kantor Imigrasi Kelas III Non TPI Bantaeng
      </div>
    </div>
  );
}

interface SidebarProps {
  items: NavItem[];
}

export function Sidebar({ items }: SidebarProps) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-sidebar p-4 text-sidebar-foreground lg:block">
        <SidebarContent items={items} />
      </aside>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            type="button"
            aria-label="Buka menu navigasi"
            className="fixed bottom-4 left-4 z-20 gap-2 rounded-full px-4 shadow-lg lg:hidden"
          >
            <Menu className="size-4" aria-hidden="true" />
            Buka Menu
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-sidebar p-4 text-sidebar-foreground sm:max-w-[85vw]">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu navigasi</SheetTitle>
          </SheetHeader>
          <SidebarContent items={items} />
        </SheetContent>
      </Sheet>
    </>
  );
}
