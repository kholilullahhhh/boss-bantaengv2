"use server";

import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { profileSchema, changePasswordSchema, formatZodErrors } from "@/lib/validations";
import { requireActionAuth } from "@/server/queries/session";
import { logActivity } from "@/lib/activity";
import { getRequestContext } from "@/lib/request";
import type { ActionResult } from "@/types/action";

/**
 * Edit profil milik sendiri.
 * Authorization: wajib login. Target update SELALU session.user.id
 * (bukan id dari body request) — mencegah IDOR.
 * Field jabatan opsional; hash password tidak pernah ikut terkirim/dikirim balik.
 */
export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const auth = await requireActionAuth();
  if (!auth.ok) return auth.error;
  const user = auth.user;

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data yang Anda isi.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const { name, jabatan, email, phone, avatarUrl, password } = parsed.data;

  try {
    if (email) {
      const conflict = await prisma.user.findFirst({
        where: { email, id: { not: user.id } },
        select: { id: true },
      });
      if (conflict) {
        return {
          success: false,
          message: "Email sudah digunakan akun lain.",
          fieldErrors: { email: ["Email sudah digunakan"] },
        };
      }
    }

    await prisma.user.update({
      where: { id: user.id }, // IDOR-safe: id dari session, bukan input
      data: {
        name,
        jabatan: jabatan || null,
        email: email || null,
        phone: phone || null,
        avatarUrl: avatarUrl || null,
        ...(password ? { password: await hash(password, 10) } : {}),
      },
      select: { id: true },
    });

    const { ipAddress, userAgent } = await getRequestContext();
    await logActivity(
      "UPDATE",
      "Profil",
      user.id,
      { userId: user.id, ipAddress, userAgent },
      { gantiPassword: Boolean(password) }
    );

    revalidatePath("/dashboard/profile");
    return { success: true, message: "Profil berhasil diperbarui." };
  } catch (error) {
    console.error("[profile] Update gagal:", error instanceof Error ? error.message : error);
    return { success: false, message: "Gagal memperbarui profil. Silakan coba lagi." };
  }
}

/**
 * Ganti password (verifikasi password saat ini).
 * Authorization: wajib login; selalu memakai session.user.id.
 */
export async function changePasswordAction(input: unknown): Promise<ActionResult> {
  const auth = await requireActionAuth();
  if (!auth.ok) return auth.error;
  const user = auth.user;

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data yang Anda isi.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  try {
    const { compare } = await import("bcryptjs");
    const account = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, password: true },
    });
    if (!account) {
      return { success: false, message: "Akun tidak ditemukan." };
    }

    const valid = await compare(parsed.data.currentPassword, account.password);
    if (!valid) {
      return {
        success: false,
        message: "Password saat ini salah.",
        fieldErrors: { currentPassword: ["Password saat ini salah"] },
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await hash(parsed.data.newPassword, 10) },
      select: { id: true },
    });

    const { ipAddress, userAgent } = await getRequestContext();
    await logActivity(
      "PASSWORD_RESET",
      "Profil",
      user.id,
      { userId: user.id, ipAddress, userAgent },
      { via: "ubah-password-diri" }
    );

    revalidatePath("/dashboard/profile");
    return { success: true, message: "Password berhasil diubah." };
  } catch (error) {
    console.error("[profile] Ganti password gagal:", error instanceof Error ? error.message : error);
    return { success: false, message: "Gagal mengubah password. Silakan coba lagi." };
  }
}
