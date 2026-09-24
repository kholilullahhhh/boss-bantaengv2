import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { getPublishedAgendas } from "@/server/queries/agenda";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Agenda kegiatan Kantor Imigrasi Kelas III Non TPI Bantaeng.",
};

export const revalidate = 60;

export default async function AgendaPage() {
  const agendas = await getPublishedAgendas();

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-12 lg:px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Agenda Kegiatan</h1>
        <p className="text-sm text-muted-foreground">
          Daftar agenda resmi kantor yang telah diterbitkan.
        </p>
      </div>

      {agendas.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Belum ada agenda"
          description="Agenda yang diterbitkan akan tampil di halaman ini."
        />
      ) : (
        <div className="space-y-4">
          {agendas.map((agenda) => (
            <Card key={agenda.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {formatDate(agenda.tglKegiatan)}
                  </span>
                  <span>
                    {agenda.jamMulai}
                    {agenda.jamSelesai ? ` – ${agenda.jamSelesai}` : " WITA"}
                  </span>
                  <Badge variant="outline">Terbit</Badge>
                </CardDescription>
                <CardTitle>
                  <Link href={`/agenda/${agenda.id}`} className="hover:underline">
                    {agenda.judul}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {agenda.tempatKegiatan}
                </p>
                {agenda.deskripsi && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{agenda.deskripsi}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
