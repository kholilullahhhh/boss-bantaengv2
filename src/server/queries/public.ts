import { prisma } from "@/lib/prisma";

export interface PublicStats {
  totalDokumen: number;
  totalAgenda: number;
  tahunLayanan: number;
}

const LAUNCH_YEAR = 2024;

export async function getPublicStats(): Promise<PublicStats> {
  const [totalDokumen, totalAgenda] = await Promise.all([
    prisma.dokumen.count(),
    prisma.agenda.count({ where: { status: "PUBLISH" } }),
  ]);
  return {
    totalDokumen,
    totalAgenda,
    tahunLayanan: Math.max(1, new Date().getFullYear() - LAUNCH_YEAR + 1),
  };
}
