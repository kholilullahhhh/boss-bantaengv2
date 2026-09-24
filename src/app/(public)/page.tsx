import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileStack,
  Lock,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { getPublicStats } from "@/server/queries/public";
import { getPublishedAgendas } from "@/server/queries/agenda";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Beranda",
  description:
    "BOSS — Bantaeng Office Smart System. Sistem informasi digital Kantor Imigrasi Kelas III Non TPI Bantaeng.",
};

const PROGRAMS = [
  {
    icon: FileStack,
    title: "Pengelolaan Dokumen",
    description:
      "Unggah, kategorikan, dan temukan dokumen kantor secara digital dengan folder, filter, dan pencarian cepat.",
    highlights: ["Folder & tag", "Pencarian cepat", "Preview PDF/DOC"],
  },
  {
    icon: CalendarDays,
    title: "Agenda Kegiatan",
    description:
      "Informasi agenda kantor yang diperbarui berkala untuk seluruh pegawai dan masyarakat.",
    highlights: ["Jadwal terpusat", "Status publish", "Detail kegiatan"],
  },
  {
    icon: ShieldCheck,
    title: "Akses Berbasis Peran",
    description:
      "Kontrol akses ketat per role — hanya pihak berwenang yang dapat mengelola data sensitif.",
    highlights: ["6 role pegawai", "Middleware proteksi", "Log aktivitas"],
  },
  {
    icon: Users,
    title: "Kolaborasi Pegawai",
    description:
      "Dukungan multi-pengguna bagi Kepala Kantor, Tata Usaha, Inteldakim, dan Verdokjal.",
    highlights: ["Dashboard bersama", "Profil pegawai", "Notifikasi toast"],
  },
];

const FEATURES = [
  {
    icon: Search,
    title: "Pencarian & Filter",
    text: "Cari judul, saring folder & rentang tanggal, urutkan kolom sesuai kebutuhan.",
  },
  {
    icon: Lock,
    title: "Keamanan Data",
    text: "Zod validation, rate-limit login, signed URL berkas, dan cek role di setiap aksi.",
  },
  {
    icon: Sparkles,
    title: "Tampilan Modern",
    text: "UI responsif mobile-first, loading skeleton, empty state informatif, dark-ready.",
  },
  {
    icon: CheckCircle2,
    title: "Jejak Audit",
    text: "Semua mutasi & login tercatat di activity log — transparan untuk admin.",
  },
];

export default async function LandingPage() {
  const [stats, agendas] = await Promise.all([
    getPublicStats(),
    getPublishedAgendas(3),
  ]);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const heroStats = [
    {
      label: "Dokumen Terkelola",
      value: stats.totalDokumen,
      icon: FileStack,
    },
    {
      label: "Agenda Terbit",
      value: stats.totalAgenda,
      icon: CalendarDays,
    },
    {
      label: "Tahun Layanan",
      value: stats.tahunLayanan,
      icon: Building2,
    },
  ];

  return (
    <div>
      {/* Hero — background foto kantor */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/rat.jpeg"
            alt="Kantor Imigrasi Kelas III Non TPI Bantaeng"
            fill
            priority
            quality={85}
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-slate-900/40"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30"
          />
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center lg:px-6 lg:py-24">
          <div className="space-y-6 text-white">
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="secondary"
                className="border-white/20 bg-white/15 text-white backdrop-blur"
              >
                Kantor Imigrasi Kelas III Non TPI Bantaeng
              </Badge>
              <span className="flex items-center gap-1.5 text-xs font-medium text-white/80">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Sistem digital terintegrasi
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white shadow-lg">
                <Image
                  src="/logoimig.png"
                  alt="Logo Imigrasi"
                  width={56}
                  height={56}
                  className="size-13 object-contain p-1"
                  priority
                />
              </span>
              <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white shadow-lg">
                <Image
                  src="/LogoO.png"
                  alt="Kementerian Imigrasi dan Pemasyarakatan RI"
                  width={56}
                  height={56}
                  className="size-13 object-contain p-1"
                  priority
                />
              </span>
              <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white shadow-lg">
                <Image
                  src="/rapp.png"
                  alt="Lambang Daerah Bantaeng"
                  width={56}
                  height={56}
                  className="size-13 object-contain"
                  priority
                />
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              BOSS — Bantaeng Office Smart System
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              Sistem informasi kantor modern untuk pengelolaan dokumen, agenda,
              dan layanan internal yang cepat, aman, dan terintegrasi di Kantor
              Imigrasi Bantaeng.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white text-slate-900 hover:bg-white/90"
              >
                <Link href="/login">
                  Masuk ke Dashboard
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
              >
                <Link href="/agenda">Lihat Agenda</Link>
              </Button>
            </div>
          </div>

          {/* Kartu statistik glass */}
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {heroStats.map((item) => (
              <Card
                key={item.label}
                className="border-white/20 bg-white/10 text-white backdrop-blur-md supports-[backdrop-filter]:bg-white/10"
              >
                <CardHeader className="space-y-1 pb-2">
                  <CardDescription className="flex items-center gap-1.5 text-xs text-white/80">
                    <item.icon className="size-3.5" aria-hidden="true" />
                    {item.label}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold tracking-tight">
                    {item.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Strip bawah hero */}
        <div className="relative border-t border-white/10 bg-slate-950/50 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 text-sm text-white/80 lg:px-6">
            <span className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              Jl. Bersama, Kabupaten Bantaeng, Sulawesi Selatan
            </span>
            <span className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" aria-hidden="true" />
              Layanan informasi kantor
            </span>
            <span className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              imigrasi-bantaeng.go.id
            </span>
          </div>
        </div>
      </section>

      {/* Tentang kantor — foto + teks */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 lg:px-6 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border shadow-xl">
              <Image
                src="/rat.jpeg"
                alt="Gedung Kantor Imigrasi Bantaeng — Butta Toa Bantaeng"
                width={1200}
                height={800}
                className="h-auto w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-5 -right-3 hidden rounded-xl border bg-card p-4 shadow-lg sm:block">
              <div className="flex items-center gap-3">
                <span className="relative flex size-12 items-center justify-center overflow-hidden rounded-full bg-white p-1">
                  <Image
                    src="/logoimig.png"
                    alt="Logo Imigrasi"
                    width={48}
                    height={48}
                    className="size-11 object-contain"
                  />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Melayani dengan</p>
                  <p className="text-sm font-semibold">Bhumi Pura Wira Wibawa</p>
                </div>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="absolute -top-4 -left-4 -z-10 size-28 rounded-2xl bg-primary/10"
            />
          </div>

          <div className="space-y-5">
            <Badge variant="secondary" className="w-fit">
              Tentang Kantor
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Butta Toa Bantaeng siap melayani perjalanan Anda
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Kantor Imigrasi Kelas III Non TPI Bantaeng hadir dekat dengan
              masyarakat. Lewat BOSS, seluruh arsip kegiatan, agenda, dan
              layanan internal dikelola dalam satu sistem digital yang rapi,
              aman, dan mudah diakses oleh pegawai berwenang.
            </p>
            <ul className="space-y-2.5">
              {[
                "Dashboard statistik & tren dokumen real-time",
                "Folder dokumen + unggahan PDF/DOC/DOCX/XLS/XLSX",
                "Agenda publik untuk masyarakat & pegawai",
                "Activity log lengkap untuk akuntabilitas",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-foreground"
                >
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild>
                <Link href="/login">
                  Mulai Gunakan
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/kontak">Hubungi Kami</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Program */}
      <section className="border-t bg-gradient-to-b from-muted/40 via-background to-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 lg:px-6">
          <div className="mb-8 max-w-2xl space-y-2">
            <Badge variant="secondary" className="w-fit">
              Layanan & Program
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight">
              Kemampuan utama BOSS
            </h2>
            <p className="text-sm text-muted-foreground">
              Dirancang untuk mendukung operasional kantor Imigrasi Bantaeng
              secara modern dan transparan.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROGRAMS.map((program) => (
              <Card
                key={program.title}
                className="group transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <CardHeader>
                  <span className="mb-1 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <program.icon className="size-5" aria-hidden="true" />
                  </span>
                  <CardTitle className="text-base">{program.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {program.description}
                  </p>
                  <ul className="space-y-1.5">
                    {program.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                      >
                        <span className="size-1.5 rounded-full bg-primary/60" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fitur unggulan */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 lg:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div className="space-y-3">
            <Badge variant="secondary" className="w-fit">
              Kenapa BOSS
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight">
              Bukan sekadar penyimpan file
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Setiap modul dibangun dengan validasi ketat, otorisasi berbasis
              role, dan pengalaman UI yang nyaman — dari dashboard sampai
              halaman publik.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
              >
                <span className="mb-2 flex size-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <feature.icon className="size-4" aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold">{feature.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agenda terbaru */}
      <section className="border-t bg-muted/20">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 lg:px-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Agenda Terbaru
              </h2>
              <p className="text-sm text-muted-foreground">
                Kegiatan yang akan datang.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/agenda">Semua Agenda</Link>
            </Button>
          </div>

          {agendas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada agenda terbit.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {agendas.map((agenda) => (
                <Card
                  key={agenda.id}
                  className="relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/40"
                  />
                  <CardHeader>
                    <CardDescription>
                      {formatDate(agenda.tglKegiatan)} · {agenda.jamMulai}
                      {agenda.jamSelesai ? `–${agenda.jamSelesai}` : ""}
                    </CardDescription>
                    <CardTitle>
                      <Link
                        href={`/agenda/${agenda.id}`}
                        className="hover:underline"
                      >
                        {agenda.judul}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {agenda.tempatKegiatan}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA kontak — background foto redup */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/rat.jpeg"
            alt=""
            fill
            aria-hidden="true"
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70"
          />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 lg:px-6 lg:py-20">
          <div className="max-w-2xl space-y-5 text-primary-foreground">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Butuh bantuan layanan?
            </h2>
            <p className="text-sm leading-relaxed text-primary-foreground/90 sm:text-base">
              Hubungi kami untuk informasi layanan Kantor Imigrasi Kelas III Non
              TPI Bantaeng — kami siap membantu pegawai dan masyarakat.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
              >
                <Link href="/kontak">
                  <Mail aria-hidden="true" />
                  Hubungi Kami
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <a href="tel:+62411222000">
                  <Phone aria-hidden="true" />
                  Telepon Kantor
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
