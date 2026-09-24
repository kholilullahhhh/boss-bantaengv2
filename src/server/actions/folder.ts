"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DOCUMENT_ROLES } from "@/lib/permissions";
import { folderSchema, formatZodErrors } from "@/lib/validations";
import { requireActionAuth } from "@/server/queries/session";
import { logActivity } from "@/lib/activity";
import { getRequestContext } from "@/lib/request";
import { deleteFile } from "@/lib/storage";
import type { ActionResult } from "@/types/action";

function revalidateDokumen(): void {
  revalidatePath("/dashboard/dokumen");
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

/**
 * Buat folder baru untuk pengguna yang sedang login.
 * Authorization: role dokumen; folder selalu menempel ke session.user.id.
 */
export async function createFolderAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const auth = await requireActionAuth(DOCUMENT_ROLES);
  if (!auth.ok) return auth.error;
  const user = auth.user;

  const parsed = folderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data yang Anda isi.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  try {
    const folder = await prisma.folder.create({
      data: { userId: user.id, name: parsed.data.name, color: parsed.data.color },
      select: { id: true },
    });

    const { ipAddress, userAgent } = await getRequestContext();
    await logActivity("CREATE", "Folder", folder.id, { userId: user.id, ipAddress, userAgent }, {
      name: parsed.data.name,
    });

    revalidateDokumen();
    return { success: true, message: "Folder berhasil dibuat.", data: { id: folder.id } };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        success: false,
        message: "Nama folder sudah digunakan.",
        fieldErrors: { name: ["Nama folder sudah digunakan"] },
      };
    }
    console.error("[folder] Create gagal:", error instanceof Error ? error.message : error);
    return { success: false, message: "Gagal membuat folder. Silakan coba lagi." };
  }
}

/**
 * Perbarui folder (nama & warna).
 * Authorization: pemilik folder atau ADMIN.
 */
export async function updateFolderAction(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireActionAuth(DOCUMENT_ROLES);
  if (!auth.ok) return auth.error;
  const user = auth.user;

  const parsed = folderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data yang Anda isi.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  try {
    const existing = await prisma.folder.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, message: "Folder tidak ditemukan." };
    }
    if (existing.userId !== user.id && user.role !== "ADMIN") {
      return { success: false, message: "Anda tidak memiliki akses ke folder ini." };
    }

    await prisma.folder.update({
      where: { id },
      data: { name: parsed.data.name, color: parsed.data.color },
    });

    const { ipAddress, userAgent } = await getRequestContext();
    await logActivity("UPDATE", "Folder", id, { userId: user.id, ipAddress, userAgent }, {
      name: parsed.data.name,
    });

    revalidateDokumen();
    return { success: true, message: "Folder berhasil diperbarui.", data: { id } };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        success: false,
        message: "Nama folder sudah digunakan.",
        fieldErrors: { name: ["Nama folder sudah digunakan"] },
      };
    }
    console.error("[folder] Update gagal:", error instanceof Error ? error.message : error);
    return { success: false, message: "Gagal memperbarui folder. Silakan coba lagi." };
  }
}

/**
 * Hapus folder: dokumen di dalamnya ikut dihapus beserta berkasnya dari storage.
 * Authorization: pemilik folder atau ADMIN.
 */
export async function deleteFolderAction(id: string): Promise<ActionResult> {
  const auth = await requireActionAuth(DOCUMENT_ROLES);
  if (!auth.ok) return auth.error;
  const user = auth.user;

  try {
    const existing = await prisma.folder.findUnique({
      where: { id },
      include: { dokumens: { select: { id: true, filePath: true, judul: true } } },
    });
    if (!existing) {
      return { success: false, message: "Folder tidak ditemukan." };
    }
    if (existing.userId !== user.id && user.role !== "ADMIN") {
      return { success: false, message: "Anda tidak memiliki akses ke folder ini." };
    }

    const filePaths = existing.dokumens.map((doc) => doc.filePath);

    await prisma.$transaction([
      prisma.dokumen.deleteMany({ where: { folderId: id } }),
      prisma.folder.delete({ where: { id } }),
    ]);

    await Promise.all(filePaths.map((path) => deleteFile(path)));

    const { ipAddress, userAgent } = await getRequestContext();
    await logActivity(
      "DELETE",
      "Folder",
      id,
      { userId: user.id, ipAddress, userAgent },
      { name: existing.name, jumlahDokumen: existing.dokumens.length }
    );

    revalidateDokumen();
    return { success: true, message: "Folder beserta isinya berhasil dihapus." };
  } catch (error) {
    console.error("[folder] Delete gagal:", error instanceof Error ? error.message : error);
    return { success: false, message: "Gagal menghapus folder. Silakan coba lagi." };
  }
}
