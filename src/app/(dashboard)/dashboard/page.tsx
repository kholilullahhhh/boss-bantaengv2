import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { FileText, Files, UserPlus, Users } from "lucide-react";
import { requireSession } from "@/server/queries/session";
import { getDashboardData, availableYears, currentYear } from "@/server/queries/dashboard";
import { ROLE_LABELS } from "@/lib/permissions";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { TopUsersChart, TrendChart } from "@/components/dashboard/charts";
import { YearFilter } from "@/components/dashboard/year-filter";
import { RecentDokumenTable } from "@/components/dashboard/recent-dokumen-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const user = await requireSession();
  const params = await searchParams;

  const requestedYear = Number(params.year);
  const years = availableYears();
  const year =
    Number.isInteger(requestedYear) && years.includes(requestedYear)
      ? requestedYear
      : currentYear();

  const data = await getDashboardData(user, year);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Selamat datang, ${user.name}`}
        description={`Anda masuk sebagai ${ROLE_LABELS[user.role]} (${user.username}).`}
        actions={
          <YearFilter years={data.availableYears} current={data.year} />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Dokumen"
          value={data.totalDokumen}
          icon={Files}
          hint={data.showUserStats ? "Seluruh dokumen" : "Dokumen milik Anda"}
        />
        <StatCard
          label="Dokumen Bulan Ini"
          value={data.dokumenBulanIni}
          icon={FileText}
          hint="Diunggah bulan berjalan"
        />
        {data.showUserStats && (
          <>
            <StatCard label="Total Pengguna" value={data.totalUser} icon={Users} hint="Seluruh akun pegawai" />
            <StatCard
              label="Pengguna Baru Bulan Ini"
              value={data.userBaruBulanIni}
              icon={UserPlus}
              hint="Terdaftar bulan berjalan"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-72 rounded-xl border" />}>
          <TrendChart data={data.trend} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-72 rounded-xl border" />}>
          <TopUsersChart data={data.topUsers} />
        </Suspense>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">10 Dokumen Terbaru</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/dokumen">Lihat Semua</Link>
          </Button>
        </div>
        <RecentDokumenTable data={data.recent} />
      </section>
    </div>
  );
}
