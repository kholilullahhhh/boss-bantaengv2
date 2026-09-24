import type { Metadata } from "next";
import { requireRouteAccess } from "@/server/queries/session";
import { PageHeader } from "@/components/page-header";
import { JenisUsahaForm } from "@/components/jenis-usaha/jenis-form";

export const metadata: Metadata = {
  title: "Jenis Usaha Baru",
};

export default async function CreateJenisUsahaPage() {
  await requireRouteAccess("/dashboard/jenis-usaha");

  return (
    <div className="space-y-4">
      <PageHeader title="Jenis Usaha Baru" description="Tambahkan jenis dokumen baru." />
      <JenisUsahaForm mode="create" />
    </div>
  );
}
