"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jenisUsahaSchema, formatZodErrors } from "@/lib/validations";
import { requireActionAuth } from "@/server/queries/session";
import { logActivity } from "@/lib/activity";
import { getRequestContext } from "@/lib/request";
import type { ActionResult } from "@/types/action";

function revalidateJenis(): void {
  revalidatePath("/dashboard/jenis-usaha");
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

/**
 * Buat jenis usaha baru.
 * Authorization: hanya ADMIN.
 */
export async function createJenisUsahaAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const auth = await requireActionAuth(["ADMIN"]);
  if (!auth.ok) return auth.error;
  const user = auth.user;

  const parsed = jenisUsahaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data yang Anda isi.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  try {
    const created = await prisma.jenisUsaha.create({
      data: { namaJenis: parsed.data.namaJenis, deskripsi: parsed.data.deskripsi || null },
      select: { id: true },
    });

    const { ipAddress, userAgent } = await getRequestContext();
    await logActivity(
      "CREATE",
      "JenisUsaha",
      created.id,
      { userId: user.id, ipAddress, userAgent },
      { namaJenis: parsed.data.namaJenis }
    );

    revalidateJenis();
    return { success: true, message: "Jenis usaha berhasil dibuat.", data: { id: created.id } };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        success: false,
        message: "Nama jenis sudah digunakan.",
        fieldErrors: { namaJenis: ["Nama jenis sudah digunakan"] },
      };
    }
    console.error("[jenis-usaha] Create gagal:", error instanceof Error ? error.message : error);
    return { success: false, message: "Gagal menyimpan jenis usaha. Silakan coba lagi." };
  }
}

/**
 * Perbarui jenis usaha.
 * Authorization: hanya ADMIN.
 */
export async function updateJenisUsahaAction(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireActionAuth(["ADMIN"]);
  if (!auth.ok) return auth.error;
  const user = auth.user;

  const parsed = jenisUsahaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data yang Anda isi.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  try {
    const existing = await prisma.jenisUsaha.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, message: "Jenis usaha tidak ditemukan." };
    }

    await prisma.jenisUsaha.update({
      where: { id },
      data: { namaJenis: parsed.data.namaJenis, deskripsi: parsed.data.deskripsi || null },
    });

    const { ipAddress, userAgent } = await getRequestContext();
    await logActivity(
      "UPDATE",
      "JenisUsaha",
      id,
      { userId: user.id, ipAddress, userAgent },
      { namaJenis: parsed.data.namaJenis }
    );

    revalidateJenis();
    return { success: true, message: "Jenis usaha berhasil diperbarui.", data: { id } };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        success: false,
        message: "Nama jenis sudah digunakan.",
        fieldErrors: { namaJenis: ["Nama jenis sudah digunakan"] },
      };
    }
    console.error("[jenis-usaha] Update gagal:", error instanceof Error ? error.message : error);
    return { success: false, message: "Gagal memperbarui jenis usaha. Silakan coba lagi." };
  }
}

/**
 * Hapus jenis usaha (dikonfirmasi di klien, bukan DELETE HTTP biasa).
 * Authorization: hanya ADMIN.
 */
export async function deleteJenisUsahaAction(id: string): Promise<ActionResult> {
  const auth = await requireActionAuth(["ADMIN"]);
  if (!auth.ok) return auth.error;
  const user = auth.user;

  try {
    const existing = await prisma.jenisUsaha.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, message: "Jenis usaha tidak ditemukan." };
    }

    await prisma.jenisUsaha.delete({ where: { id } });

    const { ipAddress, userAgent } = await getRequestContext();
    await logActivity(
      "DELETE",
      "JenisUsaha",
      id,
      { userId: user.id, ipAddress, userAgent },
      { namaJenis: existing.namaJenis }
    );

    revalidateJenis();
    return { success: true, message: "Jenis usaha berhasil dihapus." };
  } catch (error) {
    console.error("[jenis-usaha] Delete gagal:", error instanceof Error ? error.message : error);
    return { success: false, message: "Gagal menghapus jenis usaha. Silakan coba lagi." };
  }
}
