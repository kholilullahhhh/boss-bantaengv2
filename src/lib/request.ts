import { headers } from "next/headers";

export function extractClientIp(headerValue: string | null | undefined): string {
  if (!headerValue) return "unknown";
  const first = headerValue.split(",")[0]?.trim();
  return first && first.length > 0 ? first : "unknown";
}

export function ipFromHeaders(headerMap: Headers): string {
  return extractClientIp(
    headerMap.get("x-forwarded-for") ?? headerMap.get("x-real-ip") ?? headerMap.get("cf-connecting-ip")
  );
}

export function userAgentFromHeaders(headerMap: Headers): string | null {
  const value = headerMap.get("user-agent");
  return value ? value.slice(0, 300) : null;
}

export async function getRequestContext(): Promise<{ ipAddress: string; userAgent: string | null }> {
  const headerMap = await headers();
  return {
    ipAddress: ipFromHeaders(headerMap),
    userAgent: userAgentFromHeaders(headerMap),
  };
}
