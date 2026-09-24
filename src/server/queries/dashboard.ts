import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canViewAllDocuments } from "@/lib/permissions";
import type { SessionUser } from "@/server/queries/session";

export interface TrendPoint {
  month: number;
  label: string;
  count: number;
}

export interface TopUserPoint {
  userId: string;
  name: string;
  count: number;
}

export interface RecentDokumen {
  id: string;
  judul: string;
  tanggalDokumen: string;
  createdAt: string;
  fileSize: number;
  userName: string;
  folderName: string | null;
}

export interface DashboardData {
  year: number;
  availableYears: number[];
  totalDokumen: number;
  dokumenBulanIni: number;
  totalUser: number;
  userBaruBulanIni: number;
  showUserStats: boolean;
  trend: TrendPoint[];
  topUsers: TopUserPoint[];
  recent: RecentDokumen[];
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export function currentYear(): number {
  return new Date().getFullYear();
}

export function availableYears(): number[] {
  const now = currentYear();
  return [now, now - 1, now - 2];
}

/**
 * Agregasi dashboard.
 * - Count/aggregate Prisma + groupBy (top user) + 1 query raw bulanan
 *   (Prisma groupBy tidak mendukung ekstraksi bulan) — tanpa loop 12 query.
 * - USER: hanya ringkasan dokumen miliknya sendiri.
 */
export async function getDashboardData(user: SessionUser, year: number): Promise<DashboardData> {
  const seeAll = canViewAllDocuments(user.role);
  const showUserStats = user.role !== "USER";
  const docScope: Prisma.DokumenWhereInput = seeAll ? {} : { userId: user.id };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const scopeConditions = [Prisma.sql`EXTRACT(YEAR FROM "tanggalDokumen") = ${year}`];
  if (!seeAll) {
    scopeConditions.push(Prisma.sql`"userId" = ${user.id}`);
  }
  const trendWhere = Prisma.join(scopeConditions, " AND ");

  const [
    totalDokumenAgg,
    dokumenBulanIniAgg,
    totalUserAgg,
    userBaruBulanIniAgg,
    topUserRows,
    recentRows,
    trendRows,
  ] = await Promise.all([
    prisma.dokumen.aggregate({ where: docScope, _count: { _all: true } }),
    prisma.dokumen.aggregate({
      where: { ...docScope, createdAt: { gte: startOfMonth } },
      _count: { _all: true },
    }),
    showUserStats
      ? prisma.user.aggregate({ _count: { _all: true } })
      : Promise.resolve({ _count: { _all: 0 } }),
    showUserStats
      ? prisma.user.aggregate({
          where: { createdAt: { gte: startOfMonth } },
          _count: { _all: true },
        })
      : Promise.resolve({ _count: { _all: 0 } }),
    prisma.dokumen.groupBy({
      by: ["userId"],
      where: docScope,
      _count: { _all: true },
      orderBy: { _count: { userId: "desc" } },
      take: 5,
    }),
    prisma.dokumen.findMany({
      where: docScope,
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        judul: true,
        tanggalDokumen: true,
        createdAt: true,
        fileSize: true,
        user: { select: { name: true } },
        folder: { select: { name: true } },
      },
    }),
    prisma.$queryRaw<Array<{ month: Date; count: number }>>`
      SELECT date_trunc('month', "tanggalDokumen") AS month, COUNT(*)::int AS count
      FROM "dokumens"
      WHERE ${trendWhere}
      GROUP BY 1
      ORDER BY 1
    `,
  ]);

  const topUserIds = topUserRows.map((row) => row.userId);
  const topUsersProfiles =
    topUserIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: topUserIds } },
          select: { id: true, name: true },
        })
      : [];
  const nameById = new Map(topUsersProfiles.map((profile) => [profile.id, profile.name]));

  const countByMonth = new Map<number, number>();
  for (const row of trendRows) {
    const date = new Date(row.month);
    countByMonth.set(date.getUTCMonth(), row.count);
  }

  const trend: TrendPoint[] = MONTH_LABELS.map((label, index) => ({
    month: index,
    label,
    count: countByMonth.get(index) ?? 0,
  }));

  const topUsers: TopUserPoint[] = topUserRows.map((row) => ({
    userId: row.userId,
    name: nameById.get(row.userId) ?? row.userId,
    count: row._count._all,
  }));

  const recent: RecentDokumen[] = recentRows.map((row) => ({
    id: row.id,
    judul: row.judul,
    tanggalDokumen: row.tanggalDokumen.toISOString().slice(0, 10),
    createdAt: row.createdAt.toISOString(),
    fileSize: row.fileSize,
    userName: row.user.name,
    folderName: row.folder?.name ?? null,
  }));

  return {
    year,
    availableYears: availableYears(),
    totalDokumen: totalDokumenAgg._count._all,
    dokumenBulanIni: dokumenBulanIniAgg._count._all,
    totalUser: totalUserAgg._count._all,
    userBaruBulanIni: userBaruBulanIniAgg._count._all,
    showUserStats,
    trend,
    topUsers,
    recent,
  };
}
