import type { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface AkunRow {
  id: string;
  name: string;
  username: string;
  email: string | null;
  phone: string | null;
  jabatan: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface AkunListResult {
  items: AkunRow[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getAkunList(options: {
  page: number;
  pageSize: number;
  search?: string;
  role?: string;
}): Promise<AkunListResult> {
  const where: Prisma.UserWhereInput = {};
  const search = options.search?.trim();
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (options.role) {
    where.role = options.role as Role;
  }

  const skip = (options.page - 1) * options.pageSize;
  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: [{ role: "asc" }, { name: "asc" }],
      skip,
      take: options.pageSize,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        jabatan: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    total,
    page: options.page,
    pageSize: options.pageSize,
    items: rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    })),
  };
}

export async function getAkunById(id: string): Promise<AkunRow | null> {
  const row = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phone: true,
      jabatan: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
  if (!row) return null;
  return { ...row, createdAt: row.createdAt.toISOString() };
}
