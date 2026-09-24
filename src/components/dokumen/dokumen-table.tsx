"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, FolderInput, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/tables/data-table";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { formatFileSize } from "@/lib/validations";
import { deleteDokumenAction, moveDokumenAction } from "@/server/actions/dokumen";
import type { FolderSidebarItem } from "@/server/queries/dokumen";
import { useForm, Controller } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";

export interface DokumenTableRow {
  id: string;
  judul: string;
  deskripsi: string | null;
  tanggalDokumen: string;
  fileSize: number;
  mimeType: string;
  viewUrl: string;
  createdAt: string;
  userName: string;
  folderId: string | null;
  folderName: string | null;
}

interface MoveValues {
  folderId: string;
}

export function DokumenTable({
  data,
  folders,
}: {
  data: DokumenTableRow[];
  folders: FolderSidebarItem[];
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<DokumenTableRow | null>(null);
  const [moving, setMoving] = useState<DokumenTableRow | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<MoveValues>({
    defaultValues: { folderId: "" },
  });

  function openMove(row: DokumenTableRow) {
    setMoving(row);
    reset({ folderId: row.folderId ?? "" });
  }

  async function confirmDelete() {
    if (!deleting) return;
    const result = await deleteDokumenAction(deleting.id);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setDeleting(null);
    router.refresh();
  }

  async function onSubmitMove(values: MoveValues) {
    if (!moving) return;
    const result = await moveDokumenAction(moving.id, values.folderId || null);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setMoving(null);
    router.refresh();
  }

  const columns: ColumnDef<DokumenTableRow>[] = [
    {
      accessorKey: "judul",
      header: "Judul",
      cell: ({ row }) => (
        <div className="min-w-0 max-w-64">
          <p className="truncate font-medium">{row.original.judul}</p>
          {row.original.deskripsi && (
            <p className="truncate text-xs text-muted-foreground">{row.original.deskripsi}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "userName",
      header: "Pemilik",
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
          <span className="text-xs text-muted-foreground">Tanpa folder</span>
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
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Opsi ${row.original.judul}`}>
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a href={row.original.viewUrl} target="_blank" rel="noopener noreferrer">
                  <Download aria-hidden="true" />
                  Lihat / Unduh
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/dokumen/${row.original.id}/edit`}>
                  <Pencil aria-hidden="true" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openMove(row.original)}>
                <FolderInput aria-hidden="true" />
                Pindah Folder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
        caption="Daftar dokumen"
        emptyTitle="Belum ada dokumen"
        emptyDescription="Belum ada dokumen yang cocok dengan filter. Unggah dokumen baru untuk memulai."
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(value) => {
          if (!value) setDeleting(null);
        }}
        title="Hapus dokumen?"
        description={`Dokumen “${deleting?.judul ?? ""}” beserta berkasnya akan dihapus permanen.`}
        confirmLabel="Hapus Dokumen"
        onConfirm={confirmDelete}
      />

      <Dialog
        open={moving !== null}
        onOpenChange={(value) => {
          if (!value) setMoving(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pindahkan Dokumen</DialogTitle>
            <DialogDescription>
              Pilih folder tujuan untuk “{moving?.judul ?? ""}”.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitMove)} className="space-y-4">
            <Controller
              control={control}
              name="folderId"
              render={({ field }) => (
                <div className="space-y-2">
                  <label htmlFor="move-folder" className="text-sm font-medium">
                    Folder Tujuan
                  </label>
                  <select
                    id="move-folder"
                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <option value="">Tanpa folder</option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMoving(null)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Memindahkan…" : "Pindahkan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
