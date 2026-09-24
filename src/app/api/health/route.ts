import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Health probe untuk load test / uptime check. Tidak membuka data sensitif. */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ ok: true, ts: Date.now() }, { status: 200 });
}
