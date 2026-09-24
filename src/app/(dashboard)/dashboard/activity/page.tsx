import type { Metadata } from "next";
import { requireRouteAccess } from "@/server/queries/session";
import { getActivityList, getActivityEntities } from "@/server/queries/activity";
import { prisma } from "@/lib/prisma";
import { paginationSchema } from "@/lib/validations";
import { PageHeader } from "@/components/page-header";
import { TablePagination } from "@/components/tables/table-pagination";
import { ActivityTable } from "@/components/activity/activity-table";
import { ActivityFilters } from "@/components/activity/activity-filters";

export const metadata: Metadata = {
  title: "Log Aktivitas",
};

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    action?: string;
    entity?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}) {
  await requireRouteAccess("/dashboard/activity");
  const params = await searchParams;

  const pagination = paginationSchema.safeParse({
    page: params.page,
    pageSize: params.pageSize,
  });
  const { page, pageSize } = pagination.success ? pagination.data : paginationSchema.parse({});

  const [list, entities, users] = await Promise.all([
    getActivityList({
      page,
      pageSize,
      action: typeof params.action === "string" ? params.action : "",
      entity: typeof params.entity === "string" ? params.entity : "",
      userId: typeof params.userId === "string" ? params.userId : "",
      dateFrom: typeof params.dateFrom === "string" ? params.dateFrom : "",
      dateTo: typeof params.dateTo === "string" ? params.dateTo : "",
    }),
    getActivityEntities(),
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
      take: 100,
    }),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Log Aktivitas"
        description="Riwayat login dan mutasi data seluruh pengguna."
      />

      <ActivityFilters
        entities={entities}
        users={users.map((user) => ({ id: user.id, name: user.name }))}
      />

      <div className="space-y-3">
        <ActivityTable data={list.items} />
        <TablePagination page={list.page} pageSize={list.pageSize} total={list.total} />
      </div>
    </div>
  );
}
