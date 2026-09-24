# Perf Report — 2026-09-24

## Environment

- Next.js 15.5.26 · React 19.1 · Prisma 6 · Windows · single clean `next build`
- DB in `.env`: Neon pooled (tables may be absent at build time on this machine)
- Local embedded PG optional: port 5433 (`npm.cmd run db:up`)

## Build size (after this round's fixes)

```
Route (app)                                 Size  First Load JS
┌ ƒ /                                    2.87 kB         192 kB
├ ○ /_not-found                            182 B         103 kB
├ ƒ /agenda                                143 B         187 kB
├ ƒ /agenda/[id]                           143 B         187 kB
├ ƒ /api/auth/[...nextauth]                182 B         103 kB
├ ƒ /api/health                            182 B         103 kB
├ ƒ /api/upload                            182 B         103 kB
├ ƒ /dashboard                            122 kB         357 kB
├ ƒ /dashboard/activity                  3.99 kB         167 kB
├ ƒ /dashboard/akun                      4.04 kB         231 kB
├ ƒ /dashboard/akun/[id]/edit              149 B         205 kB
├ ƒ /dashboard/akun/create                 149 B         205 kB
├ ƒ /dashboard/dokumen                   7.86 kB         274 kB
├ ƒ /dashboard/dokumen/[id]/edit           148 B         204 kB
├ ƒ /dashboard/dokumen/create              148 B         204 kB
├ ƒ /dashboard/jenis-usaha               2.01 kB         229 kB
├ ƒ /dashboard/jenis-usaha/[id]/edit       138 B         170 kB
├ ƒ /dashboard/jenis-usaha/create          139 B         170 kB
├ ƒ /dashboard/profile                   5.32 kB         248 kB
├ ƒ /kontak                              3.17 kB         168 kB
├ ƒ /login                                4.9 kB         173 kB
└ ○ /register                            4.99 kB         173 kB
+ First Load JS shared by all             102 kB
ƒ Middleware                             87.5 kB
```

Notes:

| Item | Before intent | After (this PR) |
| --- | --- | --- |
| Shared first-load | ~102 kB baseline | **102 kB** (no regression) |
| Dashboard route | charts in main path | Suspense shells; charts hydrate async |
| `/api/health` | missing | **+182 B** (probe only) |
| Public `/`, `/agenda`, `/kontak` | always full SSR | `revalidate` 60–300s (ISR) when DB available |
| Public stats/agenda queries | throw if DB down at build | **fail-soft** (zeros/empty) so build/ISR can finish |

## Query shape (static audit + optional dev `log: ["query"]`)

| Page | Queries | Optimizations already present | Follow-up |
| --- | --- | --- | --- |
| `/dashboard` | ~7 parallel + optional top-id findMany | `Promise.all`, `groupBy`, 1 raw monthly SQL | none (no N+1) |
| `/dashboard/dokumen` | 2 | count+rows parallel, skip/take, narrow select | optional index already on `tanggalDokumen`, `userId`, `folderId` |
| `/dashboard/activity` | 3 | parallel filters + entities + users take 100 | OK |
| `/` public | 2 counts + agendas | ISR 60s | OK |
| Login | 1 user + rate limit | memory/Upstash | OK |

## Bug-fix impact on perf

| Fix | Perf impact |
| --- | --- |
| B001 DB re-fetch in `getSessionUser` | **+1 indexed `findUnique` per authed request** (acceptable for S1 correctness) |
| B002 ownership checks | +0–1 `findFirst` on create/update only |
| B003/B004/B005 | negligible |
| ISR public pages | reduces repeated TTFB + DB hits for anon |

## Targets & measurement

| Target | How measured | Result |
| --- | --- | --- |
| Shared JS ≤ ~110 kB | build report | **102 kB** ✅ |
| Login First Load | build | **173 kB** |
| Dashboard First Load | build | **357 kB** (Recharts in route) |
| Build completes without type/lint errors | `npm.cmd run build` | **✅** |
| Public prerender not hard-fail on empty DB | fail-soft queries | **✅** |

### Optional (needs approval — not done)

- Extra composite indexes only if `EXPLAIN` shows seq scans under production volume — **STOP + migrate approval** before `prisma migrate`.
- Bundle analyzer: no extra dependency added this round (avoid scope creep); route sizes from `next build` are the baseline.

## Regression checklist

```bash
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build   # ONE at a time
```

Related: `docs/bug-audit-2026-09-24.md`, `docs/perf-baseline-2026-09-24.md`.
