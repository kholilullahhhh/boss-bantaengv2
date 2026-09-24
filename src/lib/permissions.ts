import type { Role } from "@prisma/client";

export const ROLES = [
  "ADMIN",
  "KEPALA_KANTOR",
  "TU",
  "INTELDAKIM",
  "VERDOKJAL",
  "USER",
] as const;

export type { Role };

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  KEPALA_KANTOR: "Kepala Kantor",
  TU: "Tata Usaha",
  INTELDAKIM: "Intelijen Keimigrasian",
  VERDOKJAL: "Verifikasi Dokumen",
  USER: "Pengguna",
};

export const DOCUMENT_ROLES: readonly Role[] = [
  "ADMIN",
  "KEPALA_KANTOR",
  "TU",
  "INTELDAKIM",
  "VERDOKJAL",
];

export const ALL_DOCUMENT_ROLES: readonly Role[] = ["ADMIN", "KEPALA_KANTOR"];

export const OWNED_DOCUMENT_ROLES: readonly Role[] = ["TU", "INTELDAKIM", "VERDOKJAL"];

export type RoutePermission =
  | "/dashboard"
  | "/dashboard/profile"
  | "/dashboard/akun"
  | "/dashboard/jenis-usaha"
  | "/dashboard/activity"
  | "/dashboard/dokumen";

const ROUTE_ROLES: Record<RoutePermission, readonly Role[]> = {
  "/dashboard": ROLES,
  "/dashboard/profile": ROLES,
  "/dashboard/akun": ["ADMIN"],
  "/dashboard/jenis-usaha": ["ADMIN"],
  "/dashboard/activity": ["ADMIN"],
  "/dashboard/dokumen": DOCUMENT_ROLES,
};

export function hasRole(role: Role | undefined, allowed: readonly Role[]): boolean {
  if (!role) return false;
  return allowed.includes(role);
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function requireRole<T extends { role: Role }>(
  actor: T | null | undefined,
  allowed: readonly Role[]
): T {
  if (!actor?.role) {
    throw new AuthorizationError("Silakan masuk terlebih dahulu.");
  }
  if (!hasRole(actor.role, allowed)) {
    throw new AuthorizationError("Anda tidak memiliki akses untuk melakukan aksi ini.");
  }
  return actor;
}

export function canAccess(route: RoutePermission, role: Role | undefined): boolean {
  if (!role) return false;
  return hasRole(role, ROUTE_ROLES[route]);
}

export function canManageDocument(
  actor: { id: string; role: Role } | null | undefined,
  document: { userId: string } | null | undefined
): boolean {
  if (!actor || !document) return false;
  if (hasRole(actor.role, ALL_DOCUMENT_ROLES)) return true;
  if (hasRole(actor.role, OWNED_DOCUMENT_ROLES)) return actor.id === document.userId;
  return false;
}

export function canManageUser(actorRole: Role | undefined, targetRole?: Role): boolean {
  if (!hasRole(actorRole, ["ADMIN"])) return false;
  if (targetRole && targetRole === "ADMIN" && actorRole !== "ADMIN") return false;
  return true;
}

export function canViewAllDocuments(role: Role | undefined): boolean {
  return hasRole(role, ALL_DOCUMENT_ROLES);
}

export function canManageFolders(role: Role | undefined): boolean {
  return hasRole(role, DOCUMENT_ROLES);
}

export function routePermissionForPath(pathname: string): RoutePermission | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const candidates: RoutePermission[] = [
    "/dashboard/dokumen",
    "/dashboard/profile",
    "/dashboard/akun",
    "/dashboard/jenis-usaha",
    "/dashboard/activity",
    "/dashboard",
  ];
  for (const candidate of candidates) {
    if (normalized === candidate || normalized.startsWith(`${candidate}/`)) {
      return candidate;
    }
  }
  if (normalized === "/dashboard") return "/dashboard";
  return null;
}
