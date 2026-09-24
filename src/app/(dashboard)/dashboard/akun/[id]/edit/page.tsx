import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRouteAccess } from "@/server/queries/session";
import { getAkunById } from "@/server/queries/akun";
import { PageHeader } from "@/components/page-header";
import { AkunForm } from "@/components/akun/akun-form";

export const metadata: Metadata = {
  title: "Edit Akun",
};

export default async function EditAkunPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRouteAccess("/dashboard/akun");
  const { id } = await params;
  const row = await getAkunById(id);
  if (!row) notFound();

  return (
    <div className="space-y-4">
      <PageHeader title="Edit Akun" description={`Perbarui data akun ${row.username}.`} />
      <AkunForm
        mode="edit"
        id={row.id}
        defaultValues={{
          name: row.name,
          username: row.username,
          role: row.role,
          jabatan: row.jabatan ?? "",
          email: row.email ?? "",
          phone: row.phone ?? "",
          isActive: row.isActive,
        }}
      />
    </div>
  );
}
