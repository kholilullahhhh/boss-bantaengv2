import { prisma } from "@/lib/prisma";

export interface JenisUsahaRow {
  id: string;
  namaJenis: string;
  deskripsi: string | null;
  createdAt: string;
}

export interface JenisUsahaListResult {
  items: JenisUsahaRow[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getJenisUsahaList(options: {
  page: number;
  pageSize: number;
  search?: string;
}): Promise<JenisUsahaListResult> {
  const search = options.search?.trim();
  const where = search
    ? {
        OR: [
          { namaJenis: { contains: search, mode: "insensitive" as const } },
          { deskripsi: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const skip = (options.page - 1) * options.pageSize;
  const [total, rows] = await Promise.all([
    prisma.jenisUsaha.count({ where }),
    prisma.jenisUsaha.findMany({
      where,
      orderBy: { namaJenis: "asc" },
      skip,
      take: options.pageSize,
    }),
  ]);

  return {
    total,
    page: options.page,
    pageSize: options.pageSize,
    items: rows.map((row) => ({
      id: row.id,
      namaJenis: row.namaJenis,
      deskripsi: row.deskripsi,
      createdAt: row.createdAt.toISOString(),
    })),
  };
}

export async function getJenisUsahaById(id: string): Promise<JenisUsahaRow | null> {
  const row = await prisma.jenisUsaha.findUnique({ where: { id } });
  if (!row) return null;
  return {
    id: row.id,
    namaJenis: row.namaJenis,
    deskripsi: row.deskripsi,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getAllJenisUsahaNames(): Promise<string[]> {
  const rows = await prisma.jenisUsaha.findMany({ orderBy: { namaJenis: "asc" }, select: { namaJenis: true } });
  return rows.map((row) => row.namaJenis);
}
