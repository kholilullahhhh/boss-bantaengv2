import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appBaseUrl } from "@/lib/app-url";
import {
  AuthorizationError,
  canAccess,
  requireRole,
  ROLES,
  type RoutePermission,
} from "@/lib/permissions";
import type { ActionResult } from "@/types/action";

export interface SessionUser {
  id: string;
  name: string;
  username: string;
  role: Role;
  email: string | null;
  jabatan: string | null;
  avatarUrl: string | null;
  isActive: boolean;
}

/**
 * Selalu baca klaim role/isActive dari DB (bukan cache JWT).
 * JWT diset saat login — role/isActive yang berubah setelah login
 * harus langsung berlaku di request berikutnya (S1).
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      email: true,
      jabatan: true,
      avatarUrl: true,
      isActive: true,
    },
  });
  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    email: user.email,
    jabatan: user.jabatan,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
  };
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    const url = new URL("/login", appBaseUrl());
    url.searchParams.set("callbackUrl", "/dashboard");
    redirect(url.toString());
  }
  return user;
}

export async function requireRouteAccess(route: RoutePermission): Promise<SessionUser> {
  const user = await requireSession();
  if (!canAccess(route, user.role)) {
    redirect("/dashboard");
  }
  return user;
}

export type ActionAuth =
  | { ok: true; user: SessionUser }
  | { ok: false; error: ActionResult };

export async function requireActionAuth(roles?: readonly Role[]): Promise<ActionAuth> {
  const user = await getSessionUser();
  if (!user) {
    return {
      ok: false,
      error: { success: false, message: "Silakan masuk terlebih dahulu." },
    };
  }
  try {
    requireRole(user, roles ?? ROLES);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { ok: false, error: { success: false, message: error.message } };
    }
    throw error;
  }
  return { ok: true, user };
}
