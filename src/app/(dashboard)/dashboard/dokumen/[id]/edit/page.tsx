import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRouteAccess } from "@/server/queries/session";
import { getDokumenDetail, listOwnedFolders } from "@/server/queries/dokumen";
import { PageHeader } from "@/components/page-header";
import { DokumenForm } from "@/components/dokumen/dokumen-form";

export const metadata: Metadata = {
  title: "Edit Dokumen",
};

export default async function EditDokumenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRouteAccess("/dashboard/dokumen");
  const detail = await getDokumenDetail(user, id);
  if (!detail) notFound();

  const folders = await listOwnedFolders(detail.userId);

  return (
    <div className="space-y-4">
      <PageHeader title="Edit Dokumen" description="Perbarui data atau ganti berkas dokumen." />
      <DokumenForm
        mode="edit"
        folders={folders}
        defaultValues={{
          id: detail.id,
          judul: detail.judul,
          deskripsi: detail.deskripsi ?? "",
          folderId: detail.folderId ?? "",
          tanggalDokumen: detail.tanggalDokumen,
          existingFileName: detail.filePath.split("/").pop() ?? detail.filePath,
          existingFileSize: detail.fileSize,
        }}
      />
    </div>
  );
}
