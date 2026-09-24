"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DOCUMENT_ROLES, canManageDocument } from "@/lib/permissions";
import {
  createDokumenSchema,
  updateDokumenSchema,
  formatZodErrors,
} from "@/lib/validations";
import { requireActionAuth } from "@/server/queries/session";
import { logActivity } from "@/lib/activity";
import { getRequestContext } from "@/lib/request";
import { deleteFile, isOwnedStorageKey } from "@/lib/storage";
import type { ActionResult } from "@/types/action";

function revalidateDokumen(): void {
  revalidatePath("/dashboard/dokumen");
  revalidatePath("/dashboard");
}

/**
 * Buat dokumen baru.
 * Authorization: hanya role dokumen (ADMIN/KEPALA/TU/INTELDAKIM/VERDOKJAL);
 * pemilik selalu diambil dari session — bukan dari input (anti-IDOR).
 */
export async function createDokumenAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const auth = await requireActionAuth(DOCUMENT_ROLES);
  if (!auth.ok) return auth.error;
  const user = auth.user;

  const parsed = createDokumenSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data yang Anda isi.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const { judul, deskripsi, folderId, tanggalDokumen, file } = parsed.data;
  const targetFolderId = folderId && folderId.length > 0 ? folderId : null;

  try {
    if (!isOwnedStorageKey(file.filePath, user.id)) {
      return {
        success: false,
        message: "Berkas tidak valid.",
        fieldErrors: { file: ["Path berkas tidak sesuai dengan akun Anda"] },
      };
    }
    const stolen = await prisma.dokumen.findFirst({
      where: { filePath: file.filePath },
      select: { id: true },
    });
    if (stolen) {
      return {
        success: false,
        message: "Berkas sudah terdaftar pada dokumen lain.",
        fieldErrors: { file: ["Berkas sudah digunakan"] },
      };
    }

    if (targetFolderId) {
      const folder = await prisma.folder.findUnique({ where: { id: targetFolderId } });
      if (!folder || folder.userId !== user.id) {
        return {
          success: false,
          message: "Folder tidak valid.",
          fieldErrors: { folderId: ["Folder tidak ditemukan atau bukan milik Anda"] },
        };
      }
    }

    const created = await prisma.dokumen.create({
      data: {
        userId: user.id,
        folderId: targetFolderId,
        judul,
        deskripsi: deskripsi || null,
        fileUrl: file.fileUrl,
        filePath: file.filePath,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        tanggalDokumen: new Date(`${tanggalDokumen}T00:00:00.000Z`),
      },
      select: { id: true },
    });

    const { ipAddress, userAgent } = await getRequestContext();
    await logActivity(
      "CREATE",
      "Dokumen",
      created.id,
      { userId: user.id, ipAddress, userAgent },
      { judul, folderId: targetFolderId }
    );

    revalidateDokumen();
    return { success: true, message: "Dokumen berhasil disimpan.", data: { id: created.id } };
  } catch (error) {
    console.error("[dokumen] Create gagal:", error instanceof Error ? error.message : error);
    return { success: false, message: "Gagal menyimpan dokumen. Silakan coba lagi." };
  }
}

/**
 * Perbarui dokumen (ganti berkas opsional).
 * Authorization: role dokumen + pemilik dokumen (ADMIN/KEPALA boleh semua).
 */
export async function updateDokumenAction(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireActionAuth(DOCUMENT_ROLES);
  if (!auth.ok) return auth.error;
  const user = auth.user;

  const parsed = updateDokumenSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data yang Anda isi.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  try {
    const existing = await prisma.dokumen.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, message: "Dokumen tidak ditemukan." };
    }
    if (!canManageDocument(user, existing)) {
      return { success: false, message: "Anda tidak memiliki akses ke dokumen ini." };
    }

    const { judul, deskripsi, folderId, tanggalDokumen, file } = parsed.data;
    const targetFolderId = folderId && folderId.length > 0 ? folderId : null;

    if (file) {
      if (!isOwnedStorageKey(file.filePath, existing.userId)) {
        return {
          success: false,
          message: "Berkas tidak valid.",
          fieldErrors: { file: ["Path berkas tidak sesuai dengan pemilik dokumen"] },
        };
      }
      const claimed = await prisma.dokumen.findFirst({
        where: { filePath: file.filePath, id: { not: id } },
        select: { id: true },
      });
      if (claimed) {
        return {
          success: false,
          message: "Berkas sudah terdaftar pada dokumen lain.",
          fieldErrors: { file: ["Berkas sudah digunakan"] },
        };
      }
    }

    if (targetFolderId) {
      const folder = await prisma.folder.findUnique({ where: { id: targetFolderId } });
      if (!folder || folder.userId !== existing.userId) {
        return {
          success: false,
          message: "Folder tidak valid.",
          fieldErrors: { folderId: ["Folder tidak ditemukan atau bukan milik pemilik dokumen"] },
        };
      }
    }

    const oldFilePath = file ? existing.filePath : null;

    await prisma.dokumen.update({
      where: { id },
      data: {
        judul,
        deskripsi: deskripsi || null,
        folderId: targetFolderId,
        tanggalDokumen: new Date(`${tanggalDokumen}T00:00:00.000Z`),
        ...(file
          ? {
              fileUrl: file.fileUrl,
              filePath: file.filePath,
              fileSize: file.fileSize,
              mimeType: file.mimeType,
            }
          : {}),
      },
    });

    if (oldFilePath) {
      await deleteFile(oldFilePath);
    }

    const { ipAddress, userAgent } = await getRequestContext();
    await logActivity(
      "UPDATE",
      "Dokumen",
      id,
      { userId: user.id, ipAddress, userAgent },
      { judul, gantiBerkas: Boolean(file) }
    );

    revalidateDokumen();
    return { success: true, message: "Dokumen berhasil diperbarui.", data: { id } };
  } catch (error) {
    console.error("[dokumen] Update gagal:", error instanceof Error ? error.message : error);
    return { success: false, message: "Gagal memperbarui dokumen. Silakan coba lagi." };
  }
}

/**
 * Hapus dokumen beserta berkasnya dari storage.
 * Authorization: role dokumen + pemilik (ADMIN/KEPALA boleh semua).
 */
export async function deleteDokumenAction(id: string): Promise<ActionResult> {
  const auth = await requireActionAuth(DOCUMENT_ROLES);
  if (!auth.ok) return auth.error;
  const user = auth.user;

  try {
    const existing = await prisma.dokumen.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, message: "Dokumen tidak ditemukan." };
    }
    if (!canManageDocument(user, existing)) {
      return { success: false, message: "Anda tidak memiliki akses ke dokumen ini." };
    }

    await prisma.dokumen.delete({ where: { id } });
    await deleteFile(existing.filePath);

    const { ipAddress, userAgent } = await getRequestContext();
    await logActivity(
      "DELETE",
      "Dokumen",
      id,
      { userId: user.id, ipAddress, userAgent },
      { judul: existing.judul }
    );

    revalidateDokumen();
    return { success: true, message: "Dokumen berhasil dihapus." };
  } catch (error) {
    console.error("[dokumen] Delete gagal:", error instanceof Error ? error.message : error);
    return { success: false, message: "Gagal menghapus dokumen. Silakan coba lagi." };
  }
}

/**
 * Pindahkan dokumen ke folder lain.
 * Authorization: pemilik dokumen (ADMIN/KEPALA boleh semua);
 * folder tujuan harus milik pemilik dokumen.
 */
export async function moveDokumenAction(
  id: string,
  folderId: string | null
): Promise<ActionResult> {
  const auth = await requireActionAuth(DOCUMENT_ROLES);
  if (!auth.ok) return auth.error;
  const user = auth.user;

  try {
    const existing = await prisma.dokumen.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, message: "Dokumen tidak ditemukan." };
    }
    if (!canManageDocument(user, existing)) {
      return { success: false, message: "Anda tidak memiliki akses ke dokumen ini." };
    }

    if (folderId) {
      const folder = await prisma.folder.findUnique({ where: { id: folderId } });
      if (!folder || folder.userId !== existing.userId) {
        return { success: false, message: "Folder tujuan tidak valid." };
      }
    }

    await prisma.dokumen.update({ where: { id }, data: { folderId } });

    const { ipAddress, userAgent } = await getRequestContext();
    await logActivity(
      "UPDATE",
      "Dokumen",
      id,
      { userId: user.id, ipAddress, userAgent },
      { aksi: "pindah-folder", folderId }
    );

    revalidateDokumen();
    return { success: true, message: "Dokumen berhasil dipindahkan." };
  } catch (error) {
    console.error("[dokumen] Move gagal:", error instanceof Error ? error.message : error);
    return { success: false, message: "Gagal memindahkan dokumen. Silakan coba lagi." };
  }
}
