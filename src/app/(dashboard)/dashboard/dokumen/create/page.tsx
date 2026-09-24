import type { Metadata } from "next";
import { requireRouteAccess } from "@/server/queries/session";
import { listOwnedFolders } from "@/server/queries/dokumen";
import { PageHeader } from "@/components/page-header";
import { DokumenForm } from "@/components/dokumen/dokumen-form";

export const metadata: Metadata = {
  title: "Dokumen Baru",
};

export default async function CreateDokumenPage() {
  const user = await requireRouteAccess("/dashboard/dokumen");
  const folders = await listOwnedFolders(user.id);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Unggah Dokumen Baru"
        description="Isi data dokumen dan unggah berkas (PDF, DOC, DOCX, XLS, XLSX — maks 10 MB)."
      />
      <DokumenForm mode="create" folders={folders} />
    </div>
  );
}
