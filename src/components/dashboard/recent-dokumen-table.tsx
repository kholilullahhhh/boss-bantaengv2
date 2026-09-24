"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/tables/data-table";
import { formatFileSize } from "@/lib/validations";
import type { RecentDokumen } from "@/server/queries/dashboard";

const columns: ColumnDef<RecentDokumen>[] = [
  {
    accessorKey: "judul",
    header: "Judul",
    cell: ({ row }) => (
      <div className="max-w-56 truncate font-medium">
        <Link
          href={`/dashboard/dokumen?search=${encodeURIComponent(row.original.judul)}`}
          className="hover:underline"
        >
          {row.original.judul}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "userName",
    header: "Pengunggah",
    meta: { className: "hidden md:table-cell" },
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.userName}</span>,
  },
  {
    accessorKey: "folderName",
    header: "Folder",
    meta: { className: "hidden lg:table-cell" },
    cell: ({ row }) =>
      row.original.folderName ? (
        <Badge variant="secondary">{row.original.folderName}</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "tanggalDokumen",
    header: "Tanggal Dokumen",
    meta: { className: "hidden sm:table-cell" },
  },
  {
    accessorKey: "fileSize",
    header: "Ukuran",
    meta: { className: "hidden md:table-cell" },
    cell: ({ row }) => formatFileSize(row.original.fileSize),
  },
];

export function RecentDokumenTable({ data }: { data: RecentDokumen[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      caption="Dokumen terbaru"
      emptyTitle="Belum ada dokumen"
      emptyDescription="Dokumen yang baru diunggah akan muncul di sini."
    />
  );
}
