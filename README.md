# BOSS — Bantaeng Office Smart System

Sistem informasi digital untuk **Kantor Imigrasi Kelas III Non TPI Bantaeng**.

Rebuild modern dari aplikasi Laravel lama ke **Next.js (App Router) + TypeScript + PostgreSQL (Neon) + Prisma + NextAuth v5**.

## Fitur

- Autentikasi Credentials (username + password) dengan JWT session
- RBAC 6 role: `ADMIN`, `KEPALA_KANTOR`, `TU`, `INTELDAKIM`, `VERDOKJAL`, `USER`
- Dashboard statistik + grafik Recharts (tren 12 bulan, top 5 pengguna)
- Modul Dokumen + Folder (upload PDF/DOC/DOCX/XLS/XLSX maks 10 MB)
- CRUD Jenis Usaha, Akun, Profil (admin-only untuk Jenis Usaha & Akun)
- Activity Log (admin-only) — semua mutasi & login dicatat
- Landing publik: beranda, kontak (form + peta), agenda (list & detail)
- Validasi Zod di client & server (single source of truth)
- Server-side pagination (TanStack Table), loading skeleton, error boundary
- Rate limit login 5 percobaan / 15 menit per IP
- Upload file: Vercel Blob (produksi) atau penyimpanan lokal (dev)

## Tech Stack

| Layer | Teknologi |
| --- | --- |
| Framework | Next.js 15 (App Router, Server Actions, RSC) |
| Language | TypeScript (strict) |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | NextAuth (Auth.js) v5 — Credentials + JWT |
| Validation | Zod |
| UI | Tailwind CSS + shadcn/ui |
| Forms | react-hook-form + zodResolver |
| Tables | TanStack Table v8 (server-side pagination) |
| Charts | Recharts |
| Icons | lucide-react |
| Toast | sonner |
| Hash | bcryptjs (cost 10) |
| Testing | Vitest + Playwright |
| Lint / Format | ESLint + Prettier |

## Struktur Proyek

```
boss-bantaengv2/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (public)/          # Landing, kontak, agenda publik
│   │   ├── (auth)/            # login, register
│   │   ├── (dashboard)/       # dashboard/* (sidebar + role-based menu)
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   └── upload/
│   │   ├── error.tsx
│   │   └── layout.tsx
│   ├── components/            # ui, layout, forms, tables, modul
│   ├── lib/                   # auth, permissions, validations, storage
│   ├── server/
│   │   ├── actions/           # Server Actions (mutasi, auth check)
│   │   └── queries/           # Data fetching (RSC)
│   ├── types/
│   └── middleware.ts          # Route protection
├── tests/
│   ├── unit/                  # Vitest
│   └── e2e/                   # Playwright
├── .env.example
└── README.md
```

## Cara Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Database Neon

1. Buka [https://console.neon.tech](https://console.neon.tech) dan buat project baru.
2. Salin **connection string** (pooled) untuk `DATABASE_URL`.
3. Salin **direct endpoint** (untuk migrasi) untuk `DIRECT_URL`.

Contoh:

```
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx.neon.tech/boss_bantaeng?sslmode=require"
DIRECT_URL="postgresql://ep-xxx-user:PASSWORD@ep-xxx.neon.tech/boss_bantaeng?sslmode=require"
```

### 3. Environment variables

```bash
cp .env.example .env
```

Isi nilai berikut di `.env`:

| Variabel | Keterangan |
| --- | --- |
| `DATABASE_URL` | Neon pooled connection string |
| `DIRECT_URL` | Neon direct endpoint (wajib untuk migrasi Prisma) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | `true` |
| `BLOB_READ_WRITE_TOKEN` | Token Vercel Blob (opsional; kosong = storage lokal) |
| `SEED_DEFAULT_PASSWORD` | Password default untuk akun seed |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |

> **Local Postgres (opsional):** proyek ini menyertakan `scripts/db.mjs` untuk embedded Postgres lokal di port `5433` (`npm run db:up`). Untuk Neon, abaikan skrip tersebut dan gunakan connection string Neon di `.env`.

### 4. Migrasi database

```bash
npx prisma migrate dev
# atau untuk production / CI:
npx prisma migrate deploy
```

### 5. Seed data awal

```bash
npx prisma db seed
```

Akun seed (password: `SEED_DEFAULT_PASSWORD`, default `BossBantaeng2025!`):

| Username | Role | Nama |
| --- | --- | --- |
| `admin` | ADMIN | Admin |
| `nurarifandi` | KEPALA_KANTOR | Nur Arifandi Azis, S.H., M.M |
| `tajuddin` | TU | Tajuddin, S.H., M.I.Kom |
| `syahrul` | INTELDAKIM | Syahrul Tompo, S.E., M.M |
| `zulherman` | VERDOKJAL | Andi Muhammad Zulherman, S.H |

Juga di-seed: 15 jenis usaha dan 5 agenda berstatus `PUBLISH`.

### 6. Jalankan development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Perintah Berguna

```bash
npm run dev            # Next.js dev server
npm run build          # Production build
npm run start          # Jalankan production server
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run test           # Vitest unit tests
npm run test:e2e       # Playwright smoke tests
npm run format         # Prettier write

npx prisma migrate dev     # Migrasi + generate client
npx prisma db seed         # Seed
npx prisma studio          # Prisma Studio

npm run db:up              # Start embedded local Postgres (port 5433)
npm run db:down            # Stop embedded local Postgres
npm run db:status          # Cek status embedded Postgres
```

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Di [Vercel](https://vercel.com), klik **Add New → Project** dan import repo.
3. Tambahkan environment variables:

   - `DATABASE_URL` (Neon pooled)
   - `DIRECT_URL` (Neon direct — untuk `prisma migrate deploy` di build)
   - `AUTH_SECRET`
   - `AUTH_TRUST_HOST=true`
   - `BLOB_READ_WRITE_TOKEN` (enable Blob Storage di Vercel)
   - `NEXT_PUBLIC_APP_URL=https://your-app.vercel.app`

4. Build command (atau pastikan `postinstall` berjalan):

   ```bash
   npx prisma generate && npx prisma migrate deploy && next build
   ```

5. Deploy. Setelah live, login dengan akun seed dan **segera ganti password**.

## RBAC (Permission Matrix)

| Modul | ADMIN | KEPALA | TU | INTELDAKIM | VERDOKJAL | USER |
| --- | :-: | :-: | :-: | :-: | :-: | :-: |
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dokumen (semua) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Dokumen (milik sendiri) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Jenis Usaha | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Akun | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Activity Log | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Profil | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

Enforcement dilakukan di **middleware** (route) dan di **setiap Server Action** (`requireActionAuth` + role check).

## Keamanan

- Semua input divalidasi Zod di server (tidak ada "trust client").
- Hash password bcrypt cost 10; hash tidak pernah dikirim ke client.
- Anti-IDOR: update profil selalu memakai `session.user.id`.
- Server Actions selalu memanggil `auth()` / `requireActionAuth` sebelum mutate.
- Rate limit login: 5 percobaan / 15 menit per IP.
- File upload: validasi mime + size, nama file di-rename (UUID), akses signed URL (HMAC + expiry).
- Cookie: `httpOnly`, `sameSite=lax`, `secure` di production.

## Testing

```bash
# Unit (Zod schemas + permissions.ts + storage ownership)
npm run test

# Smoke + responsive + theme + security + flows
npm run test:e2e
```

Smoke tests:

1. Login sebagai admin → dashboard tampil
2. Upload dokumen → dokumen muncul di list
3. Role USER akses `/dashboard/akun` → redirect ke `/dashboard`

Responsive / theme e2e (`responsive.spec.ts`, `theme.spec.ts`):

- Viewport 320 / 768 / 1440 — halaman publik tanpa horizontal scroll
- Hamburger nav publik + Sheet sidebar dashboard (mobile)
- Cycle tema light/dark/system + persist setelah reload

Security e2e (`security.spec.ts`):

- Unauth `/dashboard` & `/dashboard/akun` → `/login`
- Register username duplikat → error field (bukan 500)
- USER tidak bisa buka `/dashboard/{akun,activity,jenis-usaha,dokumen}`
- Admin tetap bisa `/dashboard/akun`
- `/dashboard/dokumen?page=-1` tidak 500 (filter tidak di-reset)

Flows e2e (`flows.spec.ts`):

- Public beranda → agenda → detail → kontak
- Admin jenis-usaha list/create + profil
- `GET /api/health` → `{ ok: true }`

> Untuk e2e, pastikan DB sudah migrate + seed, dan dev server bisa start (Playwright mengelola webServer-nya).

## Dark Mode & Responsive

### Dark mode

- `next-themes` di root layout (`ThemeProvider`), `attribute="class"`, default **system**.
- Toggle: cycle **light → dark → system** (`ThemeToggle`, `aria-label="Ganti tema"`).
- Mounted di: public header, dashboard header, auth layout (kanan atas).
- Design tokens di `src/app/globals.css` (`.dark` block): brand-indigo primary, `--chart-1..5`, `--chart-grid`, sidebar tokens.
- Shadow gelap di-override di `.dark` (alpha lebih tinggi).
- Charts memakai `src/lib/chart-colors.ts` + `var(--chart-*)`.
- Exception (tetap gelap/putih regardless theme): hero landing overlays, logo circles, header navy `#07172D`, glass buttons di header publik.

### Responsive breakpoints (keputusan)

| Range | Layout |
| --- | --- |
| 320–639 (`sm` ke bawah) | Navbar publik = hamburger drawer; dashboard = floating **Buka Menu** → Sheet; tabel = scroll-x + kolom tersembunyi |
| 640–1023 (`sm`–`lg`) | Nav publik penuh; dashboard sidebar masih drawer; filter 1–2 kolom |
| 1024+ (`lg`+) | Dashboard sidebar fixed `lg:pl-64`; grid 2–4 kolom |

Kolom tabel disembunyikan via `meta.className` (`hidden md:table-cell` dll.) — hanya dipakai di client columns.

### QA checklist

- [ ] 320 / 768 / 1440: `/`, `/agenda`, `/kontak`, `/login` tanpa horizontal scroll
- [ ] 375: hamburger nav publik buka drawer Agenda/Kontak/Beranda
- [ ] 375: login → **Buka Menu** → Sheet sidebar navigasi
- [ ] Toggle tema: light → dark → system; persist reload
- [ ] Dashboard charts grid/axis terbaca di dark
- [ ] Tabel Dokumen/Akun/Activity: scroll-x di mobile, kolom utama tetap terlihat
- [ ] Tap target icon ≥ 44px (ThemeToggle, hamburger)
- [ ] `npm run lint` → `typecheck` → `test` → `build` hijau

## Performance & Bug Audit

Ringkasan audit 2026-09-24 (detail di `docs/`):

| Dokumen | Isi |
| --- | --- |
| `docs/bug-audit-2026-09-24.md` | Tabel temuan B001–B006 (severity, repro, fix, test) |
| `docs/perf-baseline-2026-09-24.md` | Baseline query/bundle/ISR + cara re-capture |
| `docs/perf-report-2026-09-24.md` | Before/after, optimasi, target |

### Fix utama (wajib paham saat maintain)

- **S1 stale session (B001):** `getSessionUser` selalu baca `role`/`isActive` dari DB — JWT hanya untuk id sesi. Middleware tetap gate pertama; action/page tetap `requireActionAuth` / `requireRouteAccess`.
- **S1 IDOR file path (B002/B005):** create/update dokumen wajib `isOwnedStorageKey(filePath, pemilik)` (`dokumen/{userId}/…`), tolak `..`, tolak path yang sudah dipakai dokumen lain.
- **S3 filter pagination (B003):** `/dashboard/dokumen` parse filter tanpa `page`/`pageSize`, clamp paging terpisah — `?page=-1` tidak mereset filter.
- **S3 register race (B004):** Prisma `P2002` → field error "sudah digunakan", bukan 500.
- **B006 (product):** hapus folder masih hard-delete isi — sesuai dialog konfirmasi; **jangan ubah schema `SetNull` tanpa keputusan produk**.

### Perf notes

- Dashboard: agregasi paralel + `groupBy` + 1 raw SQL bulanan (tanpa loop 12 query).
- List: `count`+`findMany` `Promise.all`, `take`/`skip`, `select` sempit.
- Publik: ISR `revalidate` 60s (beranda/agenda), 300s (kontak).
- Charts di-Suspense agar shell list tidak menunggu chart.
- Dev: set Prisma `log` ke `query` sesaat untuk audit N+1 (default `warn`/`error`). Prod: `error` saja.
- `GET /api/health` untuk probe/load test (tanpa data sensitif).

### E2E coverage

- `tests/e2e/security.spec.ts` — unauth redirect, USER vs admin routes, dup register, `?page=-1`.
- `tests/e2e/flows.spec.ts` — public beranda/agenda/kontak, jenis-usaha, profil, health.

Schema/index tambahan (jika dibutuhkan volume besar): **STOP + approve** sebelum `prisma migrate`.

## Troubleshooting

| Masalah | Solusi |
| --- | --- |
| Migrasi gagal di Neon | Pastikan `DIRECT_URL` diisi (bukan pooled) |
| `P1012` / env errors | Cek `.env` ada dan `AUTH_SECRET` terisi |
| File upload gagal di Vercel | Set `BLOB_READ_WRITE_TOKEN` |
| Chunks 404 di dev | Hapus `.next` lalu `npm run dev` lagi; pastikan tidak ada lockfile induk yang bikin workspace root salah |
| e2e timeout di awal | Compile pertama lambat — tunggu server hangat atau naikkan timeout |
