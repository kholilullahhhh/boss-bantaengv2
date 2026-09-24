"use client";

import { useId, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize, FILE_MAX_SIZE, ALLOWED_EXTENSIONS } from "@/lib/validations";
import { uploadFile, UploadError } from "@/lib/upload-client";
import { toast } from "sonner";
import type { UploadedFileMeta } from "@/lib/upload-client";

interface FileInputProps {
  value: UploadedFileMeta | null;
  onChange: (value: UploadedFileMeta | null) => void;
  disabled?: boolean;
  required?: boolean;
  existingLabel?: string;
}

export function FileInput({ value, onChange, disabled, required, existingLabel }: FileInputProps) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (file.size > FILE_MAX_SIZE) {
      toast.error("Ukuran berkas melebihi batas 10 MB.");
      return;
    }
    setUploading(true);
    try {
      const meta = await uploadFile(file);
      onChange(meta);
      toast.success("Berkas berhasil diunggah.");
    } catch (error) {
      const message = error instanceof UploadError ? error.message : "Gagal mengunggah berkas.";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        id={inputId}
        type="file"
        className="hidden"
        disabled={disabled || uploading}
        accept={ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{value.originalName}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(value.fileSize)} · {value.mimeType}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled || uploading}
              onClick={() => onChange(null)}
              aria-label="Hapus berkas terpilih"
            >
              <X aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            disabled={disabled || uploading}
            onClick={() => document.getElementById(inputId)?.click()}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload aria-hidden="true" />
            )}
            {uploading ? "Mengunggah…" : required ? "Pilih Berkas" : "Ganti Berkas"}
          </Button>
          {existingLabel && (
            <p className="text-xs text-muted-foreground">Berkas saat ini: {existingLabel}</p>
          )}
          {!existingLabel && (
            <p className="text-xs text-muted-foreground">
              PDF, DOC, DOCX, XLS, XLSX — maksimal 10 MB.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
