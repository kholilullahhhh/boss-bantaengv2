"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/tables/data-table";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { deleteJenisUsahaAction } from "@/server/actions/jenis-usaha";

export interface JenisUsahaTableRow {
  id: string;
  namaJenis: string;
  deskripsi: string | null;
  createdAt: string;
}

export function JenisUsahaTable({ data }: { data: JenisUsahaTableRow[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<JenisUsahaTableRow | null>(null);

  async function confirmDelete() {
    if (!deleting) return;
    const result = await deleteJenisUsahaAction(deleting.id);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setDeleting(null);
    router.refresh();
  }

  const columns: ColumnDef<JenisUsahaTableRow>[] = [
    {
      accessorKey: "namaJenis",
      header: "Nama Jenis",
      cell: ({ row }) => <span className="font-medium">{row.original.namaJenis}</span>,
    },
    {
      accessorKey: "deskripsi",
      header: "Deskripsi",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }) => (
        <span className="block max-w-md truncate text-muted-foreground">
          {row.original.deskripsi ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Dibuat",
      meta: { className: "hidden sm:table-cell" },
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("id-ID"),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Opsi ${row.original.namaJenis}`}>
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/jenis-usaha/${row.original.id}/edit`}>
                  <Pencil aria-hidden="true" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setDeleting(row.original)}>
                <Trash2 aria-hidden="true" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        caption="Daftar jenis usaha"
        emptyTitle="Belum ada jenis usaha"
        emptyDescription="Belum ada data jenis usaha yang cocok dengan filter."
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(value) => {
          if (!value) setDeleting(null);
        }}
        title="Hapus jenis usaha?"
        description={`Jenis “${deleting?.namaJenis ?? ""}” akan dihapus permanen.`}
        confirmLabel="Hapus"
        onConfirm={confirmDelete}
      />
    </>
  );
}
