import { prisma } from "@/lib/prisma";

export interface AgendaRow {
  id: string;
  judul: string;
  tempatKegiatan: string;
  tglKegiatan: string;
  jamMulai: string;
  jamSelesai: string | null;
  deskripsi: string | null;
}

function mapAgenda(row: {
  id: string;
  judul: string;
  tempatKegiatan: string;
  tglKegiatan: Date;
  jamMulai: string;
  jamSelesai: string | null;
  deskripsi: string | null;
}): AgendaRow {
  return {
    id: row.id,
    judul: row.judul,
    tempatKegiatan: row.tempatKegiatan,
    tglKegiatan: row.tglKegiatan.toISOString().slice(0, 10),
    jamMulai: row.jamMulai,
    jamSelesai: row.jamSelesai,
    deskripsi: row.deskripsi,
  };
}

/** Hanya agenda berstatus PUBLISH yang tampil ke publik. */
export async function getPublishedAgendas(limit = 50): Promise<AgendaRow[]> {
  const rows = await prisma.agenda.findMany({
    where: { status: "PUBLISH" },
    orderBy: [{ tglKegiatan: "desc" }, { jamMulai: "asc" }],
    take: limit,
  });
  return rows.map(mapAgenda);
}

export async function getPublishedAgenda(id: string): Promise<AgendaRow | null> {
  const row = await prisma.agenda.findFirst({ where: { id, status: "PUBLISH" } });
  return row ? mapAgenda(row) : null;
}
