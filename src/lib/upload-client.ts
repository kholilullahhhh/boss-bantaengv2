import { FILE_MAX_SIZE, getExtension, isAllowedExtension, isAllowedMimeType } from "@/lib/validations";

export interface UploadedFileMeta {
  fileUrl: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  originalName: string;
}

export class UploadError extends Error {}

/** Unggah berkas ke /api/upload dan kembalikan metadata yang divalidasi server. */
export async function uploadFile(file: File): Promise<UploadedFileMeta> {
  if (file.size > FILE_MAX_SIZE) {
    throw new UploadError("Ukuran berkas melebihi batas 10 MB.");
  }
  const extension = getExtension(file.name);
  if (!isAllowedExtension(extension) || !isAllowedMimeType(file.type)) {
    throw new UploadError("Tipe berkas tidak didukung (PDF, DOC, DOCX, XLS, XLSX).");
  }

  const form = new FormData();
  form.append("file", file);

  const response = await fetch("/api/upload", { method: "POST", body: form });
  const payload = (await response.json().catch(() => null)) as
    | (UploadedFileMeta & { error?: string })
    | { error?: string }
    | null;

  if (!response.ok || !payload || !("filePath" in payload)) {
    throw new UploadError(
      (payload && typeof payload === "object" && "error" in payload && payload.error) ||
        "Gagal mengunggah berkas."
    );
  }
  return payload as UploadedFileMeta;
}
