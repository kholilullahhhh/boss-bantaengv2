import { readFileSync } from "node:fs";
import path from "node:path";
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import type { Role, StatusAgenda } from "@prisma/client";

function loadEnvFile(): void {
  const envPath = path.join(process.cwd(), ".env");
  let content: string;
  try {
    content = readFileSync(envPath, "utf8");
  } catch {
    return;
  }
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile();

const SEED_ACCOUNTS: Array<{
  username: string;
  name: string;
  role: Role;
  jabatan: string;
  email: string;
}> = [
  {
    username: "admin",
    name: "Admin",
    role: "ADMIN",
    jabatan: "Administrator",
    email: "admin@imigrasi-bantaeng.go.id",
  },
  {
    username: "nurarifandi",
    name: "Nur Arifandi Azis, S.H., M.M",
    role: "KEPALA_KANTOR",
    jabatan: "Kepala Kantor",
    email: "nurarifandi@imigrasi-bantaeng.go.id",
  },
  {
    username: "tajuddin",
    name: "Tajuddin, S.H., M.I.Kom",
    role: "TU",
    jabatan: "Kaur Tata Usaha",
    email: "tajuddin@imigrasi-bantaeng.go.id",
  },
  {
    username: "syahrul",
    name: "Syahrul Tompo, S.E., M.M",
    role: "INTELDAKIM",
    jabatan: "Kasubsi TI & Inteldakim",
    email: "syahrul@imigrasi-bantaeng.go.id",
  },
  {
    username: "zulherman",
    name: "Andi Muhammad Zulherman, S.H",
    role: "VERDOKJAL",
    jabatan: "Kasubsi Pelayanan & Verdokjal",
    email: "zulherman@imigrasi-bantaeng.go.id",
  },
];

const DOCUMENT_TYPES: Array<{ namaJenis: string; deskripsi: string }> = [
  { namaJenis: "SK", deskripsi: "Surat Keputusan" },
  { namaJenis: "Surat Tugas", deskripsi: "Penugasan pegawai" },
  { namaJenis: "Undangan", deskripsi: "Surat undangan kegiatan" },
  { namaJenis: "Edaran", deskripsi: "Surat edaran resmi" },
  { namaJenis: "Nota Dinas", deskripsi: "Komunikasi internal" },
  { namaJenis: "Memorandum", deskripsi: "Catatan resmi antar unit" },
  { namaJenis: "Permohonan", deskripsi: "Surat permohonan" },
  { namaJenis: "Persetujuan", deskripsi: "Surat persetujuan" },
  { namaJenis: "Keterangan", deskripsi: "Surat keterangan" },
  { namaJenis: "Berita Acara", deskripsi: "Berita acara kegiatan" },
  { namaJenis: "Laporan Kegiatan", deskripsi: "Laporan pelaksanaan kegiatan" },
  { namaJenis: "Surat Perintah", deskripsi: "Surat perintah" },
  { namaJenis: "Surat Masuk", deskripsi: "Korespondensi masuk" },
  { namaJenis: "Surat Keluar", deskripsi: "Korespondensi keluar" },
  { namaJenis: "Dokumen Pendukung", deskripsi: "Dokumen pendukung lainnya" },
];

interface SeedAgenda {
  judul: string;
  tempatKegiatan: string;
  tglKegiatan: string;
  jamMulai: string;
  jamSelesai: string;
  deskripsi: string;
  status: StatusAgenda;
}

const AGENDAS: SeedAgenda[] = [
  {
    judul: "Apel Pagi Bersama",
    tempatKegiatan: "Halaman Kantor Imigrasi Kelas III Non TPI Bantaeng",
    tglKegiatan: "2026-01-05",
    jamMulai: "07:30",
    jamSelesai: "08:00",
    deskripsi:
      "Apel pagi seluruh pegawai sebagai pembukaan minggu kerja dan pengecekan kehadiran.",
    status: "PUBLISH",
  },
  {
    judul: "Rapat Koordinasi Internal",
    tempatKegiatan: "Ruang Rapat Kantor Imigrasi Bantaeng",
    tglKegiatan: "2026-01-12",
    jamMulai: "09:00",
    jamSelesai: "11:00",
    deskripsi:
      "Rapat koordinasi seluruh unit kerja untuk menyelaraskan program kerja triwulan.",
    status: "PUBLISH",
  },
  {
    judul: "Sosialisasi Layanan Imigrasi bagi Masyarakat",
    tempatKegiatan: "Aula Kantor Kecamatan Bantaeng",
    tglKegiatan: "2026-02-03",
    jamMulai: "08:30",
    jamSelesai: "12:00",
    deskripsi:
      "Sosialisasi layanan paspor dan izin tinggal kepada masyarakat Kabupaten Bantaeng.",
    status: "PUBLISH",
  },
  {
    judul: "Pelatihan Pengelolaan Dokumen Digital",
    tempatKegiatan: "Ruang Komputer Kantor Imigrasi Bantaeng",
    tglKegiatan: "2026-02-18",
    jamMulai: "13:00",
    jamSelesai: "16:00",
    deskripsi:
      "Pelatihan pengelolaan arsip dan dokumen digital bagi pegawai bagian tata usaha.",
    status: "PUBLISH",
  },
  {
    judul: "Evaluasi Kinerja Bulanan",
    tempatKegiatan: "Ruang Rapat Kantor Imigrasi Bantaeng",
    tglKegiatan: "2026-03-02",
    jamMulai: "10:00",
    jamSelesai: "12:00",
    deskripsi:
      "Evaluasi capaian kinerja bulanan serta penetapan target kerja bulan berikutnya.",
    status: "PUBLISH",
  },
];

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  const seedPassword =
    process.env.SEED_DEFAULT_PASSWORD ??
    (process.env.NODE_ENV === "production" ? undefined : "BossBantaeng2025!");

  if (!seedPassword) {
    throw new Error(
      "SEED_DEFAULT_PASSWORD belum diatur. Setel di file .env sebelum menjalankan seed."
    );
  }

  const passwordHash = await hash(seedPassword, 10);

  try {
    console.log(`[seed] Menyiapkan ${SEED_ACCOUNTS.length} akun pegawai ...`);
    const accounts: Record<string, string> = {};
    for (const account of SEED_ACCOUNTS) {
      const user = await prisma.user.upsert({
        where: { username: account.username },
        update: {
          name: account.name,
          role: account.role,
          jabatan: account.jabatan,
          email: account.email,
          isActive: true,
          password: passwordHash,
        },
        create: {
          username: account.username,
          name: account.name,
          role: account.role,
          jabatan: account.jabatan,
          email: account.email,
          password: passwordHash,
        },
      });
      accounts[account.username] = user.id;
    }

    console.log(`[seed] Menyiapkan ${DOCUMENT_TYPES.length} jenis dokumen ...`);
    for (const type of DOCUMENT_TYPES) {
      await prisma.jenisUsaha.upsert({
        where: { namaJenis: type.namaJenis },
        update: { deskripsi: type.deskripsi },
        create: { namaJenis: type.namaJenis, deskripsi: type.deskripsi },
      });
    }

    const agendaOwner = accounts.admin;
    console.log(`[seed] Menyiapkan ${AGENDAS.length} agenda terbit ...`);
    for (const agenda of AGENDAS) {
      const data = {
        userId: agendaOwner,
        judul: agenda.judul,
        tempatKegiatan: agenda.tempatKegiatan,
        tglKegiatan: new Date(`${agenda.tglKegiatan}T00:00:00.000Z`),
        jamMulai: agenda.jamMulai,
        jamSelesai: agenda.jamSelesai,
        deskripsi: agenda.deskripsi,
        status: agenda.status,
      };
      const existing = await prisma.agenda.findFirst({ where: { judul: agenda.judul } });
      if (existing) {
        await prisma.agenda.update({ where: { id: existing.id }, data });
      } else {
        await prisma.agenda.create({ data });
      }
    }

    const userCount = await prisma.user.count();
    const jenisCount = await prisma.jenisUsaha.count();
    const agendaCount = await prisma.agenda.count();
    console.log(
      `[seed] Selesai. user=${userCount}, jenis_usaha=${jenisCount}, agenda=${agendaCount}`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("[seed] Gagal:", error);
  process.exit(1);
});
