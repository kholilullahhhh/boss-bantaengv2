const FALLBACK_APP_URL = "http://localhost:3000";

/** URL aplikasi yang aman — env kosong/invalid tidak bikin `new URL` gagal saat build. */
export function resolveAppUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.AUTH_URL,
    FALLBACK_APP_URL,
  ];
  for (const candidate of candidates) {
    const raw = candidate?.trim();
    if (!raw) continue;
    try {
      return new URL(raw).toString();
    } catch {
      // lanjut kandidat berikutnya
    }
  }
  return FALLBACK_APP_URL;
}

/** Base absolut untuk `new URL(path, base)`. */
export function appBaseUrl(): string {
  return resolveAppUrl().replace(/\/+$/, "") || FALLBACK_APP_URL;
}
