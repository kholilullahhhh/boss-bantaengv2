import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { requireRouteAccess } from "@/server/queries/session";
import { getAkunList } from "@/server/queries/akun";
import { paginationSchema } from "@/lib/validations";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/tables/table-pagination";
import { SearchFilter } from "@/components/forms/search-filter";
import { AkunTable } from "@/components/akun/akun-table";
import { RoleFilter } from "@/components/akun/role-filter";

export const metadata: Metadata = {
  title: "Akun",
};

export default async function AkunPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string; search?: string; role?: string }>;
}) {
  const user = await requireRouteAccess("/dashboard/akun");
  const params = await searchParams;

  const pagination = paginationSchema.safeParse({
    page: params.page,
    pageSize: params.pageSize,
  });
  const { page, pageSize } = pagination.success ? pagination.data : paginationSchema.parse({});

  const list = await getAkunList({
    page,
    pageSize,
    search: typeof params.search === "string" ? params.search : "",
    role: typeof params.role === "string" ? params.role : "",
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Akun Pegawai"
        description="Kelola akun, role, dan status pegawai."
        actions={
          <Button asChild>
            <Link href="/dashboard/akun/create">
              <UserPlus aria-hidden="true" />
              Akun Baru
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SearchFilter placeholder="Cari nama / username / email…" />
        <RoleFilter />
      </div>

      <div className="space-y-3">
        <AkunTable data={list.items} currentUserId={user.id} />
        <TablePagination page={list.page} pageSize={list.pageSize} total={list.total} />
      </div>
    </div>
  );
}
