"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/forms/field-error";

const contactSchema = z.object({
  nama: z.string().trim().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.email("Format email tidak valid").max(150, "Email maksimal 150 karakter"),
  pesan: z.string().trim().min(10, "Pesan minimal 10 karakter").max(2000, "Pesan maksimal 2000 karakter"),
});

type ContactInput = z.infer<typeof contactSchema>;

const CONTACT_EMAIL = "imigrasi.bantaeng@imigrasi.go.id";

export function ContactForm() {
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { nama: "", email: "", pesan: "" },
  });

  async function onSubmit(values: ContactInput) {
    setPending(true);
    try {
      const subject = encodeURIComponent(`Pesan Kontak BOSS dari ${values.nama}`);
      const body = encodeURIComponent(
        `Nama: ${values.nama}\nEmail: ${values.email}\n\nPesan:\n${values.pesan}`
      );
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      toast.success("Aplikasi email Anda dibuka. Kirim pesan untuk menyelesaikannya.");
      reset();
    } catch {
      toast.error("Gagal menyiapkan pesan. Silakan coba lagi.");
      setError("pesan", { message: "Gagal menyiapkan pesan" });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contact-nama">
          Nama <span className="text-destructive">*</span>
        </Label>
        <Input id="contact-nama" disabled={pending} aria-invalid={!!errors.nama} {...register("nama")} />
        <FieldError message={errors.nama?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="contact-email"
          type="email"
          disabled={pending}
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-pesan">
          Pesan <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="contact-pesan"
          rows={6}
          disabled={pending}
          aria-invalid={!!errors.pesan}
          {...register("pesan")}
        />
        <FieldError message={errors.pesan?.message} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send aria-hidden="true" />
        )}
        {pending ? "Menyiapkan…" : "Kirim Pesan"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Pesan akan dibuka melalui aplikasi email Anda dan dikirim ke {CONTACT_EMAIL}.
      </p>
    </form>
  );
}
