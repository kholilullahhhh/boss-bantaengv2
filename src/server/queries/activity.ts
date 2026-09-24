import type { ActivityAction, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface ActivityRow {
  id: string;
  action: ActivityAction;
  entity: string;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
  userName: string | null;
  username: string | null;
  metadata: unknown;
}

export interface ActivityListResult {
  items: ActivityRow[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getActivityList(options: {
  page: number;
  pageSize: number;
  action?: string;
  entity?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<ActivityListResult> {
  const where: Prisma.ActivityLogWhereInput = {};
  if (options.action) where.action = options.action as ActivityAction;
  if (options.entity) where.entity = { equals: options.entity, mode: "insensitive" };
  if (options.userId) where.userId = options.userId;
  if (options.dateFrom || options.dateTo) {
    where.createdAt = {
      ...(options.dateFrom ? { gte: new Date(`${options.dateFrom}T00:00:00.000Z`) } : {}),
      ...(options.dateTo ? { lte: new Date(`${options.dateTo}T23:59:59.999Z`) } : {}),
    };
  }

  const skip = (options.page - 1) * options.pageSize;
  const [total, rows] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: options.pageSize,
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        ipAddress: true,
        createdAt: true,
        metadata: true,
        user: { select: { name: true, username: true } },
      },
    }),
  ]);

  return {
    total,
    page: options.page,
    pageSize: options.pageSize,
    items: rows.map((row) => ({
      id: row.id,
      action: row.action,
      entity: row.entity,
      entityId: row.entityId,
      ipAddress: row.ipAddress,
      createdAt: row.createdAt.toISOString(),
      metadata: row.metadata,
      userName: row.user?.name ?? null,
      username: row.user?.username ?? null,
    })),
  };
}

export async function getActivityEntities(): Promise<string[]> {
  const rows = await prisma.activityLog.groupBy({ by: ["entity"], orderBy: { entity: "asc" } });
  return rows.map((row) => row.entity);
}
