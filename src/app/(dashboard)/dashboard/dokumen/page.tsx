import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRouteAccess } from "@/server/queries/session";
import { getDokumenList, getFolderSidebar } from "@/server/queries/dokumen";
import { dokumenFilterSchema, paginationSchema } from "@/lib/validations";
import { resolveFileViewUrl } from "@/lib/storage";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { DokumenFilters } from "@/components/dokumen/dokumen-filters";
import { FolderPanel } from "@/components/dokumen/folder-panel";
import { DokumenTable } from "@/components/dokumen/dokumen-table";
import { TablePagination } from "@/components/tables/table-pagination";

export const metadata: Metadata = {
  title: "Dokumen",
};

export default async function DokumenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireRouteAccess("/dashboard/dokumen");
  const raw = await searchParams;

  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") flat[key] = value;
  }

  // Pisahkan paging: `?page=-1` / `?page=abc` tidak boleh menghapus filter lain (S3).
  const { page: rawPage, pageSize: rawPageSize, ...filterFields } = flat;
  const parsed = dokumenFilterSchema.safeParse(filterFields);
  const base = parsed.success ? parsed.data : dokumenFilterSchema.parse({});
  const pageParsed = paginationSchema.safeParse({ page: rawPage, pageSize: rawPageSize });
  const filter = {
    ...base,
    page: pageParsed.success ? pageParsed.data.page : base.page,
    pageSize: pageParsed.success ? pageParsed.data.pageSize : base.pageSize,
  };

  const [list, folderSidebar] = await Promise.all([
    getDokumenList(user, filter),
    getFolderSidebar(user),
  ]);

  const rows = list.items.map((item) => ({
    ...item,
    viewUrl: resolveFileViewUrl(item.fileUrl, item.filePath),
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dokumen"
        description="Kelola arsip dan dokumen kerja kantor."
        actions={
          <Button asChild>
            <Link href="/dashboard/dokumen/create">
              <Plus aria-hidden="true" />
              Dokumen Baru
            </Link>
          </Button>
        }
      />

      <DokumenFilters />

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-xl border bg-card p-3">
          <FolderPanel folders={folderSidebar.folders} unfiledCount={folderSidebar.unfiledCount} />
        </aside>

        <div className="min-w-0 space-y-3">
          <DokumenTable data={rows} folders={folderSidebar.folders} />
          <TablePagination page={list.page} pageSize={list.pageSize} total={list.total} />
        </div>
      </div>
    </div>
  );
}
