import {
  Activity,
  FolderClosed,
  FolderPlus,
  LayoutDashboard,
  LibraryBig,
  type LucideIcon,
  UserRound,
  Users,
} from "lucide-react";
import type { Role } from "@prisma/client";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: readonly Role[];
}

const DOCUMENT_ROLES = ["ADMIN", "KEPALA_KANTOR", "TU", "INTELDAKIM", "VERDOKJAL"] as const;
const ALL_ROLES = ["ADMIN", "KEPALA_KANTOR", "TU", "INTELDAKIM", "VERDOKJAL", "USER"] as const;

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ALL_ROLES },
  { title: "Dokumen", href: "/dashboard/dokumen", icon: LibraryBig, roles: DOCUMENT_ROLES },
  { title: "Jenis Dokumen", href: "/dashboard/jenis-usaha", icon: FolderPlus, roles: ["ADMIN"] },
  { title: "Akun", href: "/dashboard/akun", icon: Users, roles: ["ADMIN"] },
  { title: "Log Aktivitas", href: "/dashboard/activity", icon: Activity, roles: ["ADMIN"] },
  { title: "Profil", href: "/dashboard/profile", icon: UserRound, roles: ALL_ROLES },
];

export function navForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function navTitleForPath(pathname: string): string | null {
  const matches = NAV_ITEMS.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  ).sort((a, b) => b.href.length - a.href.length);
  return matches[0]?.title ?? null;
}

export const FOLDER_ICON = FolderClosed;
