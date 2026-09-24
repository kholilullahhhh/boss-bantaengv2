"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/forms/field-error";
import {
  profileSchema,
  changePasswordSchema,
  type ProfileInput,
  type ChangePasswordInput,
} from "@/lib/validations";
import { updateProfileAction, changePasswordAction } from "@/server/actions/profile";

interface ProfileFormProps {
  defaultValues: {
    name: string;
    jabatan: string;
    email: string;
    phone: string;
    avatarUrl: string;
  };
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { ...defaultValues, password: "" },
  });

  async function onSubmit(values: ProfileInput) {
    const result = await updateProfileAction(values);
    if (!result.success) {
      toast.error(result.message);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (field in values) setError(field as keyof ProfileInput, { message: messages[0] });
        }
      }
      return;
    }
    toast.success(result.message);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="profile-name">
          Nama Lengkap <span className="text-destructive">*</span>
        </Label>
        <Input id="profile-name" disabled={isSubmitting} aria-invalid={!!errors.name} {...register("name")} />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-jabatan">Jabatan</Label>
        <Input
          id="profile-jabatan"
          placeholder="Opsional"
          disabled={isSubmitting}
          aria-invalid={!!errors.jabatan}
          {...register("jabatan")}
        />
        <FieldError message={errors.jabatan?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            type="email"
            disabled={isSubmitting}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-phone">Telepon</Label>
          <Input
            id="profile-phone"
            placeholder="08xxxxxxxxxx"
            disabled={isSubmitting}
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
          <FieldError message={errors.phone?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-avatar">URL Foto Profil</Label>
        <Input
          id="profile-avatar"
          type="url"
          placeholder="https://…"
          disabled={isSubmitting}
          aria-invalid={!!errors.avatarUrl}
          {...register("avatarUrl")}
        />
        <FieldError message={errors.avatarUrl?.message} />
      </div>

      <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
        <Label htmlFor="profile-password">Password Baru (opsional)</Label>
        <Input
          id="profile-password"
          type="password"
          autoComplete="new-password"
          placeholder="Kosongkan jika tidak ingin mengubah password"
          disabled={isSubmitting}
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        <p className="text-xs text-muted-foreground">Minimal 8 karakter jika diisi.</p>
        <FieldError message={errors.password?.message} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {isSubmitting ? "Menyimpan…" : "Simpan Perubahan"}
      </Button>
    </form>
  );
}

export function PasswordChangeForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: ChangePasswordInput) {
    const result = await changePasswordAction(values);
    if (!result.success) {
      toast.error(result.message);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (field in values) {
            setError(field as keyof ChangePasswordInput, { message: messages[0] });
          }
        }
      }
      return;
    }
    toast.success(result.message);
    reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current-password">Password Saat Ini</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          disabled={isSubmitting}
          aria-invalid={!!errors.currentPassword}
          {...register("currentPassword")}
        />
        <FieldError message={errors.currentPassword?.message} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="new-password">Password Baru</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
            aria-invalid={!!errors.newPassword}
            {...register("newPassword")}
          />
          <FieldError message={errors.newPassword?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Konfirmasi Password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          <FieldError message={errors.confirmPassword?.message} />
        </div>
      </div>
      <Button type="submit" variant="outline" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        Ubah Password
      </Button>
    </form>
  );
}
