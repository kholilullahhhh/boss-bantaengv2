"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/forms/field-error";
import { FileInput } from "@/components/forms/file-input";
import { SelectField } from "@/components/forms/select-field";
import { dokumenBaseSchema, fileMetadataSchema, formatFileSize } from "@/lib/validations";
import { createDokumenAction, updateDokumenAction } from "@/server/actions/dokumen";

const formSchema = dokumenBaseSchema.extend({
  file: fileMetadataSchema.nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DokumenFormProps {
  mode: "create" | "edit";
  folders: Array<{ id: string; name: string }>;
  defaultValues?: {
    id?: string;
    judul?: string;
    deskripsi?: string;
    folderId?: string;
    tanggalDokumen?: string;
    existingFileName?: string;
    existingFileSize?: number;
  };
}

export function DokumenForm({ mode, folders, defaultValues }: DokumenFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      judul: defaultValues?.judul ?? "",
      deskripsi: defaultValues?.deskripsi ?? "",
      folderId: defaultValues?.folderId ?? "",
      tanggalDokumen: defaultValues?.tanggalDokumen ?? "",
      file: null,
    },
  });

  const fileValue = watch("file");

  async function onSubmit(values: FormValues) {
    if (mode === "create" && !values.file) {
      toast.error("Berkas wajib diunggah terlebih dahulu.");
      setError("file", { message: "Berkas wajib diunggah" });
      return;
    }

    const payload = {
      judul: values.judul,
      deskripsi: values.deskripsi ?? "",
      folderId: values.folderId ?? "",
      tanggalDokumen: values.tanggalDokumen,
      ...(values.file ? { file: values.file } : {}),
    };

    const result =
      mode === "create"
        ? await createDokumenAction(payload)
        : await updateDokumenAction(defaultValues?.id ?? "", payload);

    if (!result.success) {
      toast.error(result.message);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (field === "file") {
            toast.error(messages[0]);
            continue;
          }
          if (field in values) {
            setError(field as keyof FormValues, { message: messages[0] });
          }
        }
      }
      return;
    }

    toast.success(result.message);
    router.push("/dashboard/dokumen");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-2xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="judul">
          Judul <span className="text-destructive">*</span>
        </Label>
        <Input
          id="judul"
          disabled={isSubmitting}
          aria-invalid={!!errors.judul}
          {...register("judul")}
        />
        <FieldError message={errors.judul?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deskripsi">Deskripsi</Label>
        <Textarea
          id="deskripsi"
          rows={4}
          disabled={isSubmitting}
          aria-invalid={!!errors.deskripsi}
          {...register("deskripsi")}
        />
        <FieldError message={errors.deskripsi?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tanggalDokumen">
            Tanggal Dokumen <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tanggalDokumen"
            type="date"
            disabled={isSubmitting}
            aria-invalid={!!errors.tanggalDokumen}
            {...register("tanggalDokumen")}
          />
          <FieldError message={errors.tanggalDokumen?.message} />
        </div>

        <SelectField
          control={control}
          name="folderId"
          label="Folder"
          showNone
          noneLabel="Tanpa folder"
          placeholder="Pilih folder…"
          disabled={isSubmitting}
          options={folders.map((folder) => ({ value: folder.id, label: folder.name }))}
        />
      </div>

      <div className="space-y-2">
        <Label>
          Berkas {mode === "create" && <span className="text-destructive">*</span>}
        </Label>
        <Controller
          control={control}
          name="file"
          render={({ field, fieldState }) => (
            <div className="space-y-1.5">
              <FileInput
                value={field.value ?? null}
                onChange={field.onChange}
                disabled={isSubmitting}
                required={mode === "create"}
                existingLabel={
                  defaultValues?.existingFileName
                    ? `${defaultValues.existingFileName}${
                        defaultValues.existingFileSize
                          ? ` (${formatFileSize(defaultValues.existingFileSize)})`
                          : ""
                      }`
                    : undefined
                }
              />
              <FieldError message={fieldState.error?.message} />
              <p className="text-xs text-muted-foreground">
                PDF, DOC, DOCX, XLS, XLSX — maksimal 10 MB.
              </p>
            </div>
          )}
        />
        {mode === "create" && !fileValue && (
          <p className="text-xs text-muted-foreground">Berkas wajib diunggah terlebih dahulu.</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {isSubmitting ? "Menyimpan…" : mode === "create" ? "Simpan Dokumen" : "Simpan Perubahan"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
