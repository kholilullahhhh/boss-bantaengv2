import type { Metadata } from "next";
import { requireRouteAccess } from "@/server/queries/session";
import { PageHeader } from "@/components/page-header";
import { AkunForm } from "@/components/akun/akun-form";

export const metadata: Metadata = {
  title: "Akun Baru",
};

export default async function CreateAkunPage() {
  await requireRouteAccess("/dashboard/akun");

  return (
    <div className="space-y-4">
      <PageHeader title="Akun Baru" description="Buat akun pegawai dengan role yang sesuai." />
      <AkunForm mode="create" />
    </div>
  );
}
