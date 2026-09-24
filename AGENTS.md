# AGENTS.md

BOSS — Next.js 15 App Router rebuild of a Laravel app for Kantor Imigrasi Kelas III Non TPI Bantaeng.

## Commands (Windows)

Shell is PowerShell. Bare `npm` is often blocked — use `npm.cmd` / `npx.cmd`.

```bash
npm.cmd run lint          # eslint .
npm.cmd run typecheck     # tsc --noEmit
npm.cmd run test          # vitest run (tests/unit only)
npm.cmd run build         # next build — run ONE at a time
npm.cmd run dev           # next dev (port 3000)
npm.cmd run test:e2e      # playwright (starts dev via webServer)
npm.cmd run db:up|down|status   # embedded Postgres on 127.0.0.1:5433
npx.cmd prisma generate
npx.cmd prisma migrate dev
npx.cmd prisma db seed
```

Verify order after code changes: `lint` → `typecheck` → `test` → `build`.

Bracket paths need `-LiteralPath` (e.g. `src/app/api/auth/[...nextauth]`).

## Build / dev pitfalls

- Never run two `next build`s (or build + `next dev`) at once; never delete `.next` while a server is running. This corrupts chunks / causes `PageNotFoundError` / `ENOTEMPTY`.
- Before a clean build: stop all `node.exe` Next processes, then `Remove-Item .next -Recurse -Force`, then one `npm.cmd run build`.
- `next.config.ts` sets `outputFileTracingRoot: __dirname`. A parent-dir lockfile (e.g. `D:\Nextjs\package-lock.json`) once made Next infer the wrong root → static chunks 404.
- `postinstall` runs `prisma generate`. If client types are missing: `npx.cmd prisma generate`.
- Playwright baseURL is `http://127.0.0.1:3000`. First compile is slow (timeouts already raised). Middleware redirects unauthorized `/dashboard/*` to `/dashboard` (final HTTP 200 — do not assert non-200).

## Architecture

Path alias: `@/*` → `src/*`.

Route groups (no URL segment):

- `(public)/` — landing, agenda, kontak. Header is **fixed/transparent** on `/` via `HeaderScroll`; other public pages get `pt-[72px]` from `PublicMain`.
- `(auth)/` — login, register.
- `(dashboard)/dashboard/*` — **must live under `(dashboard)/dashboard/`** so URLs are `/dashboard/dokumen` etc. Putting pages only under `(dashboard)/` yields wrong paths.

Auth/RBAC (enforced twice — keep both):

1. `src/middleware.ts` — route gate via `routePermissionForPath` + `canAccess`.
2. Every Server Action: `requireActionAuth(roles?)` first; every protected page: `requireRouteAccess(route)` first.

Helpers in `src/lib/permissions.ts`: `ROLES`, `DOCUMENT_ROLES`, `ALL_DOCUMENT_ROLES`, `OWNED_DOCUMENT_ROLES`, `requireRole`, `canAccess`. Roles: `ADMIN`, `KEPALA_KANTOR`, `TU`, `INTELDAKIM`, `VERDOKJAL`, `USER`. No separate admins table.

- Queries: `src/server/queries/*` (RSC). Mutations: `src/server/actions/*` (`"use server"`).
- Zod schemas: `src/lib/validations` — validate on client **and** server.
- Return type for actions: `ActionResult` in `src/types/action.ts`.
- Storage: `src/lib/storage.ts` — driver `blob` if `BLOB_READ_WRITE_TOKEN` else local `.storage/`. Local views use HMAC-signed URLs.
- Upload API: `src/app/api/upload/route.ts` + `src/lib/upload-client.ts`.

## Code rules (project-specific)

- TypeScript strict: **no `any`**.
- **No `useEffect` for data fetching** (RSC / Server Actions only). Scroll/UI listeners in client components are fine.
- Every mutation must call `auth()` / `requireActionAuth` and use `session.user.id` (anti-IDOR). Never trust client-supplied user ids.
- bcrypt cost 10; never send password hashes to the client.
- TanStack Table `cell:` / column defs with functions must live in a **client** component (e.g. `recent-dokumen-table.tsx`) — cannot cross server→client boundary.
- Radix `Select` rejects `""` item values: use `__none__` / `__all__` sentinels (`SelectField`).
- zod v4 + RHF: coerce/default schemas use `useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>`.
- `put()` needs `Buffer.from(bytes)`, not raw `Uint8Array`.
- `requireActionAuth` takes `readonly Role[]` (not mutable `Role[]`).
- Login rate limit: 5 / 15 min per IP (`src/lib/rate-limit.ts`).

## DB / seed

Local embedded Postgres: port **5433**, db `boss`, user/pass `postgres`/`postgres` (see `.env`, `scripts/db.mjs`). Production target is Neon (`DATABASE_URL` + `DIRECT_URL`).

Seed (`prisma/seed.ts`) password: `SEED_DEFAULT_PASSWORD` (default `BossBantaeng2025!`):

| Username | Role |
| --- | --- |
| `admin` | ADMIN |
| `nurarifandi` | KEPALA_KANTOR |
| `tajuddin` | TU |
| `syahrul` | INTELDAKIM |
| `zulherman` | VERDOKJAL |

Also seeds 15 jenis usaha + 5 PUBLISH agendas. Register (`/register`) creates role `USER`.

## Tests

- Unit: `tests/unit/*.test.ts` (Zod + permissions). No DB needed.
- E2E: `tests/e2e/smoke.spec.ts` — needs migrate+seed, free port 3000, DB up.
- Vitest include is only `tests/unit/**/*.test.ts`.

## Out of scope (do not reintroduce)

School-app / Laravel leftovers: guru, siswa, mapel, nuptk, UMKM, Stisla, separate admins table.

## Docs

Setup, RBAC matrix, deploy: `README.md`. Env template: `.env.example`.
