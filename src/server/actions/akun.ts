"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createAkunSchema, updateAkunSchema, formatZodErrors } from "@/lib/validations";
import { requireActionAuth } from "@/server/queries/session";
import { logActivity } from "@/lib/activity";
import { getRequestContext } from "@/lib/request";
import { deleteFile } from "@/lib/storage";
import type { ActionResult } from "@/types/action";

function revalidateAkun(): void {
  revalidatePath("/dashboard/akun");
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function generateTemporaryPassword(): string {
  // Contoh: Boss-4f3a9c21b7
  return `Boss-${randomBytes(6).toString("hex")}`;
}

/**
 * Buat akun pegawai baru.
 * Authorization: hanya ADMIN. Username divalidasi unik, password di-hash bcrypt (cost 10).
 */
export async function createAkunAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const auth = await requireActionAuth(["ADMIN"]);
  if (!auth.ok) return auth.error;
  const user = auth.user;

  const parsed = createAkunSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data yang Anda isi.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const { name, username, password, role, jabatan, email, phone, isActive } = parsed.data;

  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, ...(email ? [{ email }] : [])] },
      select: { username: true, email: true },
    });
    if (existing) {
      const fieldErrors: Record<string, string[]> = {};
      if (existing.username === username) fieldErrors.username = ["Username sudah digunakan"];
      if (email && existing.email === email) fieldErrors.email = ["Email sudah digunakan"];
      return { success: false, message: "Akun gagal dibuat.", fieldErrors };
    }

    const created = await prisma.user.create({
      data: {
        name,
        username,
        password: await hash(password, 10),
        role,
        jabatan: jabatan || null,
        email: email || null,
        phone: phone || null,
        isActive,
      },
      select: { id: true },
    });

    const { ipAddress, userAgent } = await getRequestContext();
    await logActivity("CREATE", "Akun", created.id, { userId: user.id, ipAddress, userAgent }, {
      username,
      role,
    });

    revalidateAkun();
    return { success: true, message: "Akun berhasil dibuat.", data: { id: created.id } };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        success: false,
        message: "Username atau email sudah digunakan.",
        fieldErrors: { username: ["Username sudah digunakan"] },
      };
    }
    console.error("[akun] Create gagal:", error instanceof Error ? error.message : error);
    return { success: false, message: "Gagal membuat akun. Silakan coba lagi." };
  }
}

/**
 * Perbarui akun (tanpa password — hash tidak pernah dikirim ke form).
 * Authorization: hanya ADMIN. Tidak boleh menonaktifkan akun sendiri.
 */
export async function updateAkunAction(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireActionAuth(["ADMIN"]);
  if (!auth.ok) return auth.error;
  const user = auth.user;

  const parsed = updateAkunSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data yang Anda isi.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  if (id === user.id && !parsed.data.isActive) {
    return { success: false, message: "Anda tidak dapat menonaktifkan akun sendiri." };
  }

  const { name, username, role, jabatan, email, phone, isActive } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { id }, select: { username: true } });
    if (!existing) {
      return { success: false, message: "Akun tidak ditemukan." };
    }

    const conflict = await prisma.user.findFirst({
      where: {
        id: { not: id },
        OR: [{ username }, ...(email ? [{ email }] : [])],
      },
      select: { username: true, email: true },
    });
    if (conflict) {
      const fieldErrors: Record<string, string[]> = {};
      if (conflict.username === username) fieldErrors.username = ["Username sudah digunakan"];
      if (email && conflict.email === email) fieldErrors.email = ["Email sudah digunakan"];
      return { success: false, message: "Akun gagal diperbarui.", fieldErrors };
    }

    await prisma.user.update({
      where: { id },
      data: {
        name,
        username,
        role,
        jabatan: jabatan || null,
        email: email || null,
        phone: phone || null,
        isActive,
      },
    });

    const { ipAddress, userAgent } = await getRequestContext();
    await logActivity("UPDATE", "Akun", id, { userId: user.id, ipAddress, userAgent }, {
      username,
      role,
      isActive,
    });

    revalidateAkun();
    return { success: true, message: "Akun berhasil diperbarui.", data: { id } };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        success: false,
        message: "Username atau email sudah digunakan.",
        fieldErrors: { username: ["Username sudah digunakan"] },
      };
    }
    console.error("[akun] Update gagal:", error instanceof Error ? error.message : error);
    return { success: false, message: "Gagal memperbarui akun. Silakan coba lagi." };
  }
}

/**
 * Hapus akun (hard delete, dikonfirmasi di klien).
 * Authorization: hanya ADMIN. Dilarang menghapus akun sendiri.
 * Berkas milik pengguna ikut dihapus dari storage.
 */
export async function deleteAkunAction(id: string): Promise<ActionResult> {
  const auth = await requireActionAuth(["ADMIN"]);
  if (!auth.ok) return auth.error;
  const user = auth.user;

  if (id === user.id) {
    return { success: false, message: "Anda tidak dapat menghapus akun sendiri." };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, role: true, _count: { select: { dokumens: true } } },
    });
    if (!existing) {
      return { success: false, message: "Akun tidak ditemukan." };
    }

    const files = await prisma.dokumen.findMany({
      where: { userId: id },
      select: { filePath: true },
    });

    // FK Dokumen/Folder cascade menghapus baris; berkas dihapus manual dari storage.
    await prisma.user.delete({ where: { id } });
    await Promise.all(files.map((file) => deleteFile(file.filePath)));

    const { ipAddress, userAgent } = await getRequestContext();
    await logActivity("DELETE", "Akun", id, { userId: user.id, ipAddress, userAgent }, {
      username: existing.username,
      role: existing.role,
      jumlahDokumen: existing._count.dokumens,
    });

    revalidateAkun();
    return { success: true, message: "Akun berhasil dihapus." };
  } catch (error) {
    console.error("[akun] Delete gagal:", error instanceof Error ? error.message : error);
    return { success: false, message: "Gagal menghapus akun. Silakan coba lagi." };
  }
}

/**
 * Reset password akun → hasilkan password sementara (ditampilkan sekali ke admin).
 * Authorization: hanya ADMIN.
 */
export async function resetPasswordAkunAction(
  id: string
): Promise<ActionResult<{ temporaryPassword: string }>> {
  const auth = await requireActionAuth(["ADMIN"]);
  if (!auth.ok) return auth.error;
  const user = auth.user;

  try {
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true },
    });
    if (!existing) {
      return { success: false, message: "Akun tidak ditemukan." };
    }

    const temporaryPassword = generateTemporaryPassword();
    await prisma.user.update({
      where: { id },
      data: { password: await hash(temporaryPassword, 10) },
    });

    const { ipAddress, userAgent } = await getRequestContext();
    await logActivity(
      "PASSWORD_RESET",
      "Akun",
      id,
      { userId: user.id, ipAddress, userAgent },
      { username: existing.username }
    );

    revalidateAkun();
    return {
      success: true,
      message: "Password berhasil direset.",
      data: { temporaryPassword },
    };
  } catch (error) {
    console.error("[akun] Reset password gagal:", error instanceof Error ? error.message : error);
    return { success: false, message: "Gagal mereset password. Silakan coba lagi." };
  }
}
