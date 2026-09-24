import type { ActivityAction, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface ActivityContext {
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

const MAX_METADATA_BYTES = 4000;

function sanitizeMetadata(
  metadata: Record<string, unknown> | null | undefined
): Prisma.InputJsonValue | undefined {
  if (!metadata) return undefined;
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "string") {
      safe[key] = value.length > 300 ? `${value.slice(0, 300)}…` : value;
    } else if (typeof value === "number" || typeof value === "boolean") {
      safe[key] = value;
    } else if (Array.isArray(value)) {
      safe[key] = value
        .slice(0, 20)
        .filter((item) => typeof item === "string" || typeof item === "number");
    }
  }
  const serialized = JSON.stringify(safe);
  if (serialized.length > MAX_METADATA_BYTES) {
    return { truncated: true };
  }
  return safe as Prisma.InputJsonValue;
}

export async function logActivity(
  action: ActivityAction,
  entity: string,
  entityId: string | null,
  context: ActivityContext,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        entity,
        entityId,
        userId: context.userId ?? null,
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
        metadata: sanitizeMetadata(metadata),
      },
    });
  } catch (error) {
    console.error("[activity] Gagal menulis log:", error instanceof Error ? error.message : error);
  }
}
