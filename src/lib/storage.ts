import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export interface StoredFile {
  /** URL publik/baca berkas (blob) atau path relatif (penyimpanan lokal). */
  url: string;
  /** Storage key — disimpan ke kolom filePath. */
  path: string;
  size: number;
}

export type StorageDriver = "blob" | "local";

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 jam

function resolveDriver(): StorageDriver {
  const configured = process.env.STORAGE_DRIVER;
  if (configured === "blob" || configured === "local") return configured;
  return process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local";
}

function baseDir(): string {
  return process.cwd();
}

function localRoot(): string {
  return path.join(baseDir(), ".storage");
}

function signingSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET wajib diatur untuk menandatangani URL berkas.");
  }
  return secret;
}

export function buildStorageKey(userId: string, originalName: string): string {
  const ext = path.extname(originalName).replace(/[^.A-Za-z0-9]/g, "").toLowerCase();
  const stamp = new Date().toISOString().slice(0, 10);
  return path.posix.join("dokumen", userId, `${stamp}-${randomUUID()}${ext}`);
}

function hmac(payload: string): string {
  return createHmac("sha256", signingSecret()).update(payload).digest("hex");
}

/** Tandatangan HMAC untuk membuka berkas lokal via /api/upload. */
export function signFilePath(filePath: string, expiresAt: number): string {
  return hmac(`${filePath}:${expiresAt}`);
}

export function verifyFileSignature(filePath: string, expiresAt: number, signature: string): boolean {
  if (!Number.isFinite(expiresAt) || expiresAt * 1000 < Date.now()) return false;
  const expected = signFilePath(filePath, expiresAt);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature ?? "", "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Bangun URL yang aman untuk ditampilkan ke pengguna.
 * Penyimpanan lokal ditandatangani (HMAC + kedaluwarsa); blob sudah unguessable.
 */
export function resolveFileViewUrl(fileUrl: string, filePath: string): string {
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  const expiresAt = Math.floor(Date.now() / 1000) + SIGNED_URL_TTL_SECONDS;
  const separator = fileUrl.includes("?") ? "&" : "?";
  return `${fileUrl}${separator}exp=${expiresAt}&sig=${signFilePath(filePath, expiresAt)}`;
}

export async function putFile(
  key: string,
  bytes: Uint8Array,
  mimeType: string
): Promise<StoredFile> {
  const driver = resolveDriver();

  if (driver === "blob") {
    const { put } = await import("@vercel/blob");
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) throw new Error("BLOB_READ_WRITE_TOKEN belum diatur.");
    const blob = await put(key, Buffer.from(bytes), {
      access: "public",
      token,
      contentType: mimeType,
    });
    return { url: blob.url, path: blob.pathname, size: bytes.byteLength };
  }

  const absolute = path.join(localRoot(), key);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, bytes);
  return {
    url: `/api/upload?path=${encodeURIComponent(key)}`,
    path: key,
    size: bytes.byteLength,
  };
}

export async function deleteFile(filePath: string): Promise<void> {
  if (!filePath || filePath.includes("..")) return;
  const driver = resolveDriver();

  if (driver === "blob") {
    if (!/^https?:\/\//i.test(filePath)) return;
    try {
      const { del } = await import("@vercel/blob");
      await del(filePath, { token: process.env.BLOB_READ_WRITE_TOKEN });
    } catch (error) {
      console.error("[storage] Gagal menghapus blob:", error instanceof Error ? error.message : error);
    }
    return;
  }

  try {
    await unlink(path.join(localRoot(), filePath));
  } catch {
    // Berkas mungkin sudah terhapus — abaikan.
  }
}

export async function readLocalFile(filePath: string): Promise<{
  bytes: Buffer;
  absolute: string;
} | null> {
  if (!filePath || filePath.includes("..") || path.isAbsolute(filePath)) return null;
  const absolute = path.join(localRoot(), filePath);
  const resolved = path.resolve(absolute);
  if (!resolved.startsWith(path.resolve(localRoot()) + path.sep)) return null;
  try {
    const bytes = await readFile(resolved);
    return { bytes, absolute: resolved };
  } catch {
    return null;
  }
}
