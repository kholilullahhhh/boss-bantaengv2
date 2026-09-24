import type { Metadata } from "next";
import Link from "next/link";
import { FolderPlus } from "lucide-react";
import { requireRouteAccess } from "@/server/queries/session";
import { getJenisUsahaList } from "@/server/queries/jenis-usaha";
import { paginationSchema } from "@/lib/validations";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/tables/table-pagination";
import { SearchFilter } from "@/components/forms/search-filter";
import { JenisUsahaTable } from "@/components/jenis-usaha/jenis-table";

export const metadata: Metadata = {
  title: "Jenis Dokumen",
};

export default async function JenisUsahaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string; search?: string }>;
}) {
  await requireRouteAccess("/dashboard/jenis-usaha");
  const params = await searchParams;
  const pagination = paginationSchema.safeParse({
    page: params.page,
    pageSize: params.pageSize,
  });
  const { page, pageSize } = pagination.success
    ? pagination.data
    : paginationSchema.parse({});

  const list = await getJenisUsahaList({
    page,
    pageSize,
    search: typeof params.search === "string" ? params.search : "",
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Jenis Dokumen"
        description="Kelola daftar jenis dokumen/usaha kantor."
        actions={
          <Button asChild>
            <Link href="/dashboard/jenis-usaha/create">
              <FolderPlus aria-hidden="true" />
              Jenis Baru
            </Link>
          </Button>
        }
      />

      <SearchFilter placeholder="Cari nama atau deskripsi…" />

      <div className="space-y-3">
        <JenisUsahaTable data={list.items} />
        <TablePagination page={list.page} pageSize={list.pageSize} total={list.total} />
      </div>
    </div>
  );
}
