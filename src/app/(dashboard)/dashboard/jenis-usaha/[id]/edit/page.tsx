import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRouteAccess } from "@/server/queries/session";
import { getJenisUsahaById } from "@/server/queries/jenis-usaha";
import { PageHeader } from "@/components/page-header";
import { JenisUsahaForm } from "@/components/jenis-usaha/jenis-form";

export const metadata: Metadata = {
  title: "Edit Jenis Dokumen | BOSS",
};

export default async function EditJenisUsahaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRouteAccess("/dashboard/jenis-usaha");
  const { id } = await params;
  const row = await getJenisUsahaById(id);
  if (!row) notFound();

  return (
    <div className="space-y-4">
      <PageHeader title="Edit Jenis Dokumen" description="Perbarui data jenis dokumen." />
      <JenisUsahaForm
        mode="edit"
        id={row.id}
        defaultValues={{ namaJenis: row.namaJenis, deskripsi: row.deskripsi ?? "" }}
      />
    </div>
  );
}
