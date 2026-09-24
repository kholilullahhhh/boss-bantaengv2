import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/public/contact-form";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi Kantor Imigrasi Kelas III Non TPI Bantaeng.",
};

export const revalidate = 300;

const MAP_QUERY = encodeURIComponent(
  "Kantor Imigrasi Kelas III Non TPI Bantaeng, Sulawesi Selatan"
);

export default function KontakPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-12 lg:px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Kontak Kami</h1>
        <p className="text-sm text-muted-foreground">
          Kirim pertanyaan atau masukan mengenai layanan kantor.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Formulir Pesan</CardTitle>
            <CardDescription>Isi data berikut untuk mengirim pesan melalui email.</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Kantor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span>
                  Kantor Imigrasi Kelas III Non TPI Bantaeng
                  <br />
                  Kabupaten Bantaeng, Sulawesi Selatan
                </span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span>0411 222 000</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span>imigrasi.bantaeng@imigrasi.go.id</span>
              </p>
              <p className="text-xs text-muted-foreground">Senin – Jumat, 08.00 – 16.00 WITA</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Peta Lokasi</CardTitle>
              <CardDescription>Kantor Imigrasi Kelas III Non TPI Bantaeng.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <iframe
                  title="Peta lokasi Kantor Imigrasi Bantaeng"
                  src={`https://maps.google.com/maps?q=${MAP_QUERY}&z=15&output=embed`}
                  className="h-72 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
