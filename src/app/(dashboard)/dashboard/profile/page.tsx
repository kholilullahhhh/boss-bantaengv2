import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/server/queries/session";
import { ROLE_LABELS } from "@/lib/permissions";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileForm, PasswordChangeForm } from "@/components/profile/profile-form";

export const metadata: Metadata = {
  title: "Profil",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function ProfilePage() {
  const sessionUser = await requireSession();

  // Ambil data segar dari DB — hash password TIDAK ikut dipilih (tidak pernah dirender).
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phone: true,
      jabatan: true,
      avatarUrl: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="space-y-4">
      <PageHeader title="Profil Saya" description="Perbarui data diri dan password akun Anda." />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
              <AvatarFallback className="text-lg">{initials(user.name) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>
                {user.username} ·{" "}
                <Badge variant="secondary" className="mx-0.5">
                  {ROLE_LABELS[user.role]}
                </Badge>
              </CardDescription>
              {user.jabatan && <p className="text-sm text-muted-foreground">{user.jabatan}</p>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultValues={{
              name: user.name,
              jabatan: user.jabatan ?? "",
              email: user.email ?? "",
              phone: user.phone ?? "",
              avatarUrl: user.avatarUrl ?? "",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ganti Password</CardTitle>
          <CardDescription>Verifikasi password saat ini sebelum mengubah password.</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm />
        </CardContent>
      </Card>
    </div>
  );
}
