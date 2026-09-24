import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canViewAllDocuments } from "@/lib/permissions";
import type { DokumenFilterInput } from "@/lib/validations";
import type { SessionUser } from "@/server/queries/session";

export interface DokumenRow {
  id: string;
  judul: string;
  deskripsi: string | null;
  tanggalDokumen: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  filePath: string;
  createdAt: string;
  userName: string;
  folderId: string | null;
  folderName: string | null;
}

export interface DokumenListResult {
  items: DokumenRow[];
  total: number;
  page: number;
  pageSize: number;
}

const SORTABLE: Record<DokumenFilterInput["sortBy"], keyof Prisma.DokumenOrderByWithRelationInput> = {
  judul: "judul",
  tanggalDokumen: "tanggalDokumen",
  createdAt: "createdAt",
  fileSize: "fileSize",
};

function buildOrderBy(
  sortBy: DokumenFilterInput["sortBy"],
  sortOrder: DokumenFilterInput["sortOrder"]
): Prisma.DokumenOrderByWithRelationInput[] {
  if (sortBy === "createdAt") {
    return [{ createdAt: sortOrder }, { id: "desc" }];
  }
  const key = SORTABLE[sortBy];
  return [{ [key]: sortOrder }, { createdAt: "desc" }];
}

function buildWhere(
  viewer: SessionUser,
  filter: DokumenFilterInput
): Prisma.DokumenWhereInput {
  const seeAll = canViewAllDocuments(viewer.role);
  const where: Prisma.DokumenWhereInput = seeAll ? {} : { userId: viewer.id };

  if (filter.search) {
    where.OR = [
      { judul: { contains: filter.search, mode: "insensitive" } },
      { deskripsi: { contains: filter.search, mode: "insensitive" } },
    ];
  }
  if (filter.folderId === "__unfiled__") {
    where.folderId = null;
  } else if (filter.folderId) {
    where.folderId = filter.folderId;
  }
  if (filter.dateFrom || filter.dateTo) {
    where.tanggalDokumen = {
      ...(filter.dateFrom ? { gte: new Date(`${filter.dateFrom}T00:00:00.000Z`) } : {}),
      ...(filter.dateTo ? { lte: new Date(`${filter.dateTo}T23:59:59.999Z`) } : {}),
    };
  }
  return where;
}

export async function getDokumenList(
  viewer: SessionUser,
  filter: DokumenFilterInput
): Promise<DokumenListResult> {
  const where = buildWhere(viewer, filter);
  const orderBy = buildOrderBy(filter.sortBy, filter.sortOrder);

  const skip = (filter.page - 1) * filter.pageSize;

  const [total, rows] = await Promise.all([
    prisma.dokumen.count({ where }),
    prisma.dokumen.findMany({
      where,
      orderBy,
      skip,
      take: filter.pageSize,
      select: {
        id: true,
        judul: true,
        deskripsi: true,
        tanggalDokumen: true,
        fileSize: true,
        mimeType: true,
        fileUrl: true,
        filePath: true,
        createdAt: true,
        user: { select: { name: true } },
        folder: { select: { id: true, name: true } },
      },
    }),
  ]);

  return {
    total,
    page: filter.page,
    pageSize: filter.pageSize,
    items: rows.map((row) => ({
      id: row.id,
      judul: row.judul,
      deskripsi: row.deskripsi,
      tanggalDokumen: row.tanggalDokumen.toISOString().slice(0, 10),
      fileSize: row.fileSize,
      mimeType: row.mimeType,
      fileUrl: row.fileUrl,
      filePath: row.filePath,
      createdAt: row.createdAt.toISOString(),
      userName: row.user.name,
      folderId: row.folder?.id ?? null,
      folderName: row.folder?.name ?? null,
    })),
  };
}

export interface FolderSidebarItem {
  id: string;
  name: string;
  color: number;
  count: number;
  ownerName?: string;
}

export interface FolderSidebarResult {
  folders: FolderSidebarItem[];
  unfiledCount: number;
}

export async function getFolderSidebar(viewer: SessionUser): Promise<FolderSidebarResult> {
  const seeAll = canViewAllDocuments(viewer.role);
  const docScope: Prisma.DokumenWhereInput = seeAll ? {} : { userId: viewer.id };

  const [folders, counts] = await Promise.all([
    prisma.folder.findMany({
      where: seeAll ? {} : { userId: viewer.id },
      orderBy: [{ color: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        color: true,
        user: { select: { name: true } },
      },
    }),
    prisma.dokumen.groupBy({
      by: ["folderId"],
      where: docScope,
      _count: { _all: true },
    }),
  ]);

  const countByFolder = new Map<string, number>();
  let unfiledCount = 0;
  for (const row of counts) {
    if (row.folderId === null) {
      unfiledCount = row._count._all;
    } else {
      countByFolder.set(row.folderId, row._count._all);
    }
  }

  return {
    folders: folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      color: folder.color,
      count: countByFolder.get(folder.id) ?? 0,
      ...(seeAll ? { ownerName: folder.user.name } : {}),
    })),
    unfiledCount,
  };
}

export async function getDokumenDetail(
  viewer: SessionUser,
  id: string
): Promise<{
  id: string;
  judul: string;
  deskripsi: string | null;
  tanggalDokumen: string;
  fileUrl: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  folderId: string | null;
  folderName: string | null;
  userId: string;
} | null> {
  const row = await prisma.dokumen.findUnique({
    where: { id },
    select: {
      id: true,
      judul: true,
      deskripsi: true,
      tanggalDokumen: true,
      fileUrl: true,
      filePath: true,
      fileSize: true,
      mimeType: true,
      userId: true,
      folder: { select: { id: true, name: true } },
    },
  });
  if (!row) return null;

  const seeAll = canViewAllDocuments(viewer.role);
  const allowed = seeAll || row.userId === viewer.id;
  if (!allowed) return null;

  return {
    id: row.id,
    judul: row.judul,
    deskripsi: row.deskripsi,
    tanggalDokumen: row.tanggalDokumen.toISOString().slice(0, 10),
    fileUrl: row.fileUrl,
    filePath: row.filePath,
    fileSize: row.fileSize,
    mimeType: row.mimeType,
    folderId: row.folder?.id ?? null,
    folderName: row.folder?.name ?? null,
    userId: row.userId,
  };
}

export async function listOwnedFolders(userId: string): Promise<Array<{ id: string; name: string; color: number }>> {
  return prisma.folder.findMany({
    where: { userId },
    orderBy: [{ color: "asc" }, { name: "asc" }],
    select: { id: true, name: true, color: true },
  });
}
