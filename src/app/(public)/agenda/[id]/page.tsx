import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, MapPin } from "lucide-react";
import { getPublishedAgenda } from "@/server/queries/agenda";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const agenda = await getPublishedAgenda(id);
  return { title: agenda ? agenda.judul : "Agenda" };
}

export default async function AgendaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agenda = await getPublishedAgenda(id);
  if (!agenda) notFound();

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-12 lg:px-6">
      <Button asChild variant="ghost" size="sm" className="w-fit -ml-2">
        <Link href="/agenda">
          <ArrowLeft aria-hidden="true" />
          Kembali ke Agenda
        </Link>
      </Button>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Terbit</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{agenda.judul}</h1>
        </CardHeader>
        <CardContent className="space-y-5">
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="flex items-start gap-2.5">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div>
                <dt className="text-xs text-muted-foreground">Tanggal</dt>
                <dd className="font-medium">{formatDate(agenda.tglKegiatan)}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div>
                <dt className="text-xs text-muted-foreground">Waktu</dt>
                <dd className="font-medium">
                  {agenda.jamMulai}
                  {agenda.jamSelesai ? ` – ${agenda.jamSelesai}` : ""} WITA
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div>
                <dt className="text-xs text-muted-foreground">Tempat</dt>
                <dd className="font-medium">{agenda.tempatKegiatan}</dd>
              </div>
            </div>
          </dl>

          {agenda.deskripsi && (
            <div className="border-t pt-4">
              <h2 className="mb-2 text-sm font-semibold">Deskripsi</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {agenda.deskripsi}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
