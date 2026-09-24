import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BOSS — Bantaeng Office Smart System",
    template: "%s — BOSS",
  },
  description:
    "Sistem informasi digital Kantor Imigrasi Kelas III Non TPI Bantaeng.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  icons: {
    icon: [{ url: "/LogoBOSS.png", type: "image/png" }],
    apple: [{ url: "/LogoBOSS.png", type: "image/png" }],
  },
  openGraph: {
    title: "BOSS — Bantaeng Office Smart System",
    description:
      "Sistem informasi digital Kantor Imigrasi Kelas III Non TPI Bantaeng.",
    images: ["/LogoBOSS.png"],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
