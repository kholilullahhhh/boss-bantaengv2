"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/forms/field-error";
import { SelectField } from "@/components/forms/select-field";
import { ROLE_VALUES, idSchemaLike } from "@/lib/validations";
import { ROLE_LABELS } from "@/lib/permissions";
import { createAkunAction, updateAkunAction } from "@/server/actions/akun";

/**
 * Skema form gabungan create/edit:
 * - password wajib diisi saat create (dicek di onSubmit, divalidasi ulang server)
 * - password dikosongkan saat edit (tidak dikirim — hash tidak pernah lewat form)
 */
const akunFormSchema = z.object({
  id: idSchemaLike.optional(),
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(/^[a-z0-9._-]+$/, "Username hanya boleh huruf kecil, angka, titik, underscore, dan strip"),
  password: z
    .string()
    .max(72, "Password maksimal 72 karakter")
    .refine((value) => value.length === 0 || value.length >= 8, "Password minimal 8 karakter"),
  role: z.enum(ROLE_VALUES, "Role tidak valid"),
  jabatan: z.string().trim().max(100, "Jabatan maksimal 100 karakter"),
  email: z.email("Format email tidak valid").max(150, "Email maksimal 150 karakter").or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{5,20}$/, "Nomor telepon tidak valid")
    .or(z.literal("")),
  isActive: z.boolean(),
});

type AkunFormValues = z.infer<typeof akunFormSchema>;

const ROLE_OPTIONS = ROLE_VALUES.map((value) => ({
  value,
  label: ROLE_LABELS[value],
}));

interface AkunFormProps {
  mode: "create" | "edit";
  id?: string;
  defaultValues?: Partial<Omit<AkunFormValues, "password">>;
}

export function AkunForm({ mode, id, defaultValues }: AkunFormProps) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AkunFormValues>({
    resolver: zodResolver(akunFormSchema),
    defaultValues: {
      id: id ?? "",
      name: defaultValues?.name ?? "",
      username: defaultValues?.username ?? "",
      password: "",
      role: defaultValues?.role ?? "USER",
      jabatan: defaultValues?.jabatan ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      isActive: defaultValues?.isActive ?? true,
    },
  });

  function applyErrors(
    fieldErrors: Record<string, string[]> | undefined,
    keys: readonly string[]
  ) {
    if (!fieldErrors) return;
    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (keys.includes(field)) {
        setError(field as keyof AkunFormValues, { message: messages[0] });
      }
    }
  }

  async function onSubmit(values: AkunFormValues) {
    if (mode === "create" && values.password.length === 0) {
      setError("password", { message: "Password wajib diisi" });
      return;
    }

    const keys = Object.keys(values) as Array<keyof AkunFormValues>;
    const result =
      mode === "create"
        ? await createAkunAction(values)
        : await updateAkunAction(id ?? "", values);

    if (!result.success) {
      toast.error(result.message);
      applyErrors(result.fieldErrors, keys);
      return;
    }

    toast.success(result.message);
    router.push("/dashboard/akun");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="akun-name">
          Nama Lengkap <span className="text-destructive">*</span>
        </Label>
        <Input id="akun-name" disabled={isSubmitting} aria-invalid={!!errors.name} {...register("name")} />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="akun-username">
          Username <span className="text-destructive">*</span>
        </Label>
        <Input
          id="akun-username"
          autoCapitalize="none"
          autoCorrect="none"
          disabled={isSubmitting}
          aria-invalid={!!errors.username}
          {...register("username")}
        />
        <FieldError message={errors.username?.message} />
      </div>

      {mode === "create" && (
        <div className="space-y-2">
          <Label htmlFor="akun-password">
            Password <span className="text-destructive">*</span>
          </Label>
          <Input
            id="akun-password"
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <p className="text-xs text-muted-foreground">Minimal 8 karakter.</p>
          <FieldError message={errors.password?.message} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="akun-email">Email</Label>
          <Input
            id="akun-email"
            type="email"
            disabled={isSubmitting}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="akun-phone">Telepon</Label>
          <Input
            id="akun-phone"
            placeholder="08xxxxxxxxxx"
            disabled={isSubmitting}
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
          <FieldError message={errors.phone?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="akun-jabatan">Jabatan</Label>
        <Input
          id="akun-jabatan"
          placeholder="Opsional"
          disabled={isSubmitting}
          aria-invalid={!!errors.jabatan}
          {...register("jabatan")}
        />
        <FieldError message={errors.jabatan?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          control={control}
          name="role"
          label="Role"
          disabled={isSubmitting}
          options={ROLE_OPTIONS}
          placeholder="Pilih role…"
        />
        <div className="flex items-end gap-2 pb-1">
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  id="akun-active"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  disabled={isSubmitting}
                />
                Akun aktif
              </label>
            )}
          />
        </div>
      </div>
      <FieldError message={errors.isActive?.message} />

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {isSubmitting ? "Menyimpan…" : mode === "create" ? "Buat Akun" : "Simpan Perubahan"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Batal
        </Button>
      </div>
    </form>
  );
}
