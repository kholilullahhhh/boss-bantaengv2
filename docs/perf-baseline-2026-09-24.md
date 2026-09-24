# Perf Baseline — 2026-09-24

Environment: Windows, Next.js 15.5.26, Node local, embedded PG 5433 / Neon `DATABASE_URL`, `STORAGE_DRIVER` auto → local (empty blob token).

## Build

Captured from single clean `next build` (see `docs/perf-report-2026-09-24.md` for post-change numbers).

| Metric | Baseline (this round, with fixes already in tree) |
| --- | --- |
| Route count | Landing, agenda (+detail), kontak, login, register, dashboard shells, dokumen CRUD, akun CRUD, jenis-usaha CRUD, activity, profile, api health, api auth, api upload |
| First-class goals | LCP landing warm < 2.5s; dashboard list < 1.5s server; no N+1 on lists |

> Note: Previous round recorded full green build; this baseline is re-measured after S1/S3 fixes (no intentional route-count regression; added `GET /api/health`).

## Query / data audit (static + Prisma `log: ["query"]` in development)

| Surface | Pattern | Expected queries (order) |
| --- | --- | --- |
| Dashboard | Parallel aggregates | ~7 parallel + optional top-user `findMany` (ids ≤5) |
| Dokumen list | `count` + `findMany` | 2 |
| Activity | list + entities + users | 3 parallel |
| Public landing | stats + agendas | revalidated every 60s (ISR) |
| Public agenda list/detail | publish filter | revalidated every 60s |
| Login | user by username | 1 + rate-limit memory |

Indexes present (schema): `dokumen.userId/folderId/tanggalDokumen`, `agenda.tglKegiatan/status`, `activity_log.userId/entity+entityId/createdAt`, `user.role/username`.

## Bundle / client

- Charts (`recharts`) load in dashboard client chunk only; Suspense shells around chart slots so list/stat first paint does not wait on chart JS paint path.
- Public pages: ISR `revalidate` 60–300s reduces cold DB hits for anon traffic.
- No `useEffect` data fetching (RSC only).

## How to re-capture

```bash
# one at a time
Remove-Item .next -Recurse -Force   # only after node.exe next stopped
npm.cmd run build
npm.cmd run test
```

Dev query log: set `log: ["query","warn","error"]` temporarily in `src/lib/prisma.ts` when auditing N+1 (default keeps `warn`/`error` only to avoid noisy dev I/O).

## Targets (report)

See `docs/perf-report-2026-09-24.md` for before/after and any schema-index follow-ups (require approval before migrate).
