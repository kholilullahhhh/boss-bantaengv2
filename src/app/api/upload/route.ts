import { NextResponse } from "next/server";
import {
  getExtension,
  isAllowedExtension,
  isAllowedMimeType,
  FILE_MAX_SIZE,
} from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { canManageDocument, DOCUMENT_ROLES, hasRole } from "@/lib/permissions";
import { buildStorageKey, putFile, readLocalFile, verifyFileSignature } from "@/lib/storage";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";
import { getRequestContext } from "@/lib/request";
import { getSessionUser } from "@/server/queries/session";

export const runtime = "nodejs";

const UPLOAD_RATE_LIMIT = 30;
const UPLOAD_WINDOW_MS = 5 * 60 * 1000;

function failure(status: number, message: string): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/** Unggah berkas dokumen (PDF/DOC/DOCX/XLS/XLSX, maks 10MB) — wajib login + role dokumen. */
export async function POST(request: Request): Promise<NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return failure(401, "Silakan masuk terlebih dahulu.");
  }
  if (!hasRole(user.role, DOCUMENT_ROLES)) {
    return failure(403, "Anda tidak memiliki akses untuk mengunggah berkas.");
  }

  const { ipAddress, userAgent } = await getRequestContext();
  const limit = await rateLimit(`upload:${user.id}`, UPLOAD_RATE_LIMIT, UPLOAD_WINDOW_MS);
  if (!limit.success) {
    return failure(429, "Terlalu banyak permintaan unggahan. Coba lagi beberapa menit lagi.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return failure(400, "Format permintaan tidak valid.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return failure(400, "Berkas wajib dipilih.");
  }
  if (file.size === 0) {
    return failure(400, "Berkas kosong.");
  }
  if (file.size > FILE_MAX_SIZE) {
    return failure(400, "Ukuran berkas melebihi batas 10 MB.");
  }

  const extension = getExtension(file.name);
  if (!isAllowedExtension(extension) || !isAllowedMimeType(file.type)) {
    return failure(400, "Tipe berkas tidak didukung (PDF, DOC, DOCX, XLS, XLSX).");
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const key = buildStorageKey(user.id, file.name);
    const stored = await putFile(key, bytes, file.type);

    await logActivity("CREATE", "file-upload", stored.path, { userId: user.id, ipAddress, userAgent }, {
      originalName: file.name.slice(0, 200),
      size: stored.size,
      mimeType: file.type,
    });

    return NextResponse.json({
      fileUrl: stored.url,
      filePath: stored.path,
      fileSize: stored.size,
      mimeType: file.type,
      originalName: file.name,
    });
  } catch (error) {
    console.error("[upload] Gagal menyimpan berkas:", error instanceof Error ? error.message : error);
    return failure(500, "Gagal mengunggah berkas. Silakan coba lagi.");
  }
}

/**
 * Streaming berkas lokal yang ditandatangani.
 * Memvalidasi tanda tangan HMAC + sesi + kepemilikan dokumen (anti-IDOR).
 */
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const filePath = url.searchParams.get("path") ?? "";
  const exp = Number(url.searchParams.get("exp") ?? "0");
  const sig = url.searchParams.get("sig") ?? "";
  const download = url.searchParams.get("download") === "1";

  if (!filePath || !sig || !verifyFileSignature(filePath, exp, sig)) {
    return failure(403, "Tautan berkas tidak valid atau kedaluwarsa.");
  }

  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return failure(401, "Silakan masuk terlebih dahulu.");
  }

  const dokumen = await prisma.dokumen.findFirst({
    where: { filePath },
    select: { id: true, userId: true, judul: true, mimeType: true },
  });
  if (
    !dokumen ||
    !canManageDocument({ id: sessionUser.id, role: sessionUser.role }, { userId: dokumen.userId })
  ) {
    return failure(403, "Anda tidak memiliki akses ke berkas ini.");
  }

  const local = await readLocalFile(filePath);
  if (!local) {
    return failure(404, "Berkas tidak ditemukan.");
  }

  const safeName = dokumen.judul.replace(/[^\w\s.-]/g, "_").slice(0, 80) || "dokumen";
  const extension = filePath.includes(".") ? filePath.slice(filePath.lastIndexOf(".")) : "";
  const disposition = download ? "attachment" : "inline";

  return new NextResponse(new Uint8Array(local.bytes), {
    status: 200,
    headers: {
      "Content-Type": dokumen.mimeType || "application/octet-stream",
      "Content-Length": String(local.bytes.byteLength),
      "Content-Disposition": `${disposition}; filename="${safeName}${extension}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
