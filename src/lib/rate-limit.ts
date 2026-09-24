export interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface MemoryEntry {
  count: number;
  resetAt: number;
}

const GLOBAL_FOR_RATE_LIMIT = globalThis as unknown as {
  __bossRateLimit?: Map<string, MemoryEntry>;
};

function memoryStore(): Map<string, MemoryEntry> {
  if (!GLOBAL_FOR_RATE_LIMIT.__bossRateLimit) {
    GLOBAL_FOR_RATE_LIMIT.__bossRateLimit = new Map();
  }
  return GLOBAL_FOR_RATE_LIMIT.__bossRateLimit;
}

function prune(store: Map<string, MemoryEntry>, now: number): void {
  if (store.size < 1000) return;
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

async function upstashLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const seconds = Math.ceil(windowMs / 1000);
  try {
    const response = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, seconds, "NX"],
        ["TTL", key],
      ]),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as Array<{ result: number | string }>;
    const count = Number(data[0]?.result ?? 0);
    const ttl = Number(data[2]?.result ?? seconds);
    return {
      success: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: Math.max(1, ttl),
    };
  } catch {
    return null;
  }
}

async function memoryLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const store = memoryStore();
  const now = Date.now();
  prune(store, now);
  const entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }
  entry.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  return {
    success: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    retryAfterSeconds,
  };
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const upstash = await upstashLimit(key, limit, windowMs);
  if (upstash) return upstash;
  return memoryLimit(key, limit, windowMs);
}

export async function resetRateLimit(key: string): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([["DEL", key]]),
        cache: "no-store",
      });
    } catch {
      // Upstash tidak tersedia: abaikan, rate limit memori tetap dipakai.
    }
  }
  memoryStore().delete(key);
}
