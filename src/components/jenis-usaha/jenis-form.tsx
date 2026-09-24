"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/forms/field-error";
import { jenisUsahaSchema, type JenisUsahaInput } from "@/lib/validations";
import { createJenisUsahaAction, updateJenisUsahaAction } from "@/server/actions/jenis-usaha";

interface JenisUsahaFormProps {
  mode: "create" | "edit";
  id?: string;
  defaultValues?: Partial<JenisUsahaInput>;
}

export function JenisUsahaForm({ mode, id, defaultValues }: JenisUsahaFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<JenisUsahaInput>({
    resolver: zodResolver(jenisUsahaSchema),
    defaultValues: {
      namaJenis: defaultValues?.namaJenis ?? "",
      deskripsi: defaultValues?.deskripsi ?? "",
    },
  });

  async function onSubmit(values: JenisUsahaInput) {
    const result =
      mode === "create"
        ? await createJenisUsahaAction(values)
        : await updateJenisUsahaAction(id ?? "", values);

    if (!result.success) {
      toast.error(result.message);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (field in values) setError(field as keyof JenisUsahaInput, { message: messages[0] });
        }
      }
      return;
    }

    toast.success(result.message);
    router.push("/dashboard/jenis-usaha");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="namaJenis">
          Nama Jenis <span className="text-destructive">*</span>
        </Label>
        <Input
          id="namaJenis"
          placeholder="Contoh: Surat Tugas"
          disabled={isSubmitting}
          aria-invalid={!!errors.namaJenis}
          {...register("namaJenis")}
        />
        <FieldError message={errors.namaJenis?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deskripsi">Deskripsi</Label>
        <Textarea
          id="deskripsi"
          rows={4}
          placeholder="Keterangan singkat (opsional)"
          disabled={isSubmitting}
          aria-invalid={!!errors.deskripsi}
          {...register("deskripsi")}
        />
        <FieldError message={errors.deskripsi?.message} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {isSubmitting ? "Menyimpan…" : "Simpan"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Batal
        </Button>
      </div>
    </form>
  );
}
