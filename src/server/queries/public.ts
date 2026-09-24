import { prisma } from "@/lib/prisma";

export interface PublicStats {
  totalDokumen: number;
  totalAgenda: number;
  tahunLayanan: number;
}

const LAUNCH_YEAR = 2024;

export async function getPublicStats(): Promise<PublicStats> {
  try {
    const [totalDokumen, totalAgenda] = await Promise.all([
      prisma.dokumen.count(),
      prisma.agenda.count({ where: { status: "PUBLISH" } }),
    ]);
    return {
      totalDokumen,
      totalAgenda,
      tahunLayanan: Math.max(1, new Date().getFullYear() - LAUNCH_YEAR + 1),
    };
  } catch (error) {
    // Build/ISR offline atau DB sedang tidak siap: landing tetap render (angka 0).
    console.error("[public] Stats gagal diambil:", error instanceof Error ? error.message : error);
    return {
      totalDokumen: 0,
      totalAgenda: 0,
      tahunLayanan: Math.max(1, new Date().getFullYear() - LAUNCH_YEAR + 1),
    };
  }
}
