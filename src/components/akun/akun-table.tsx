"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, KeyRound, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/tables/data-table";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ROLE_LABELS } from "@/lib/permissions";
import { deleteAkunAction, resetPasswordAkunAction } from "@/server/actions/akun";

export interface AkunTableRow {
  id: string;
  name: string;
  username: string;
  email: string | null;
  phone: string | null;
  jabatan: string | null;
  role: keyof typeof ROLE_LABELS;
  isActive: boolean;
  createdAt: string;
}

export function AkunTable({ data, currentUserId }: { data: AkunTableRow[]; currentUserId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<AkunTableRow | null>(null);
  const [resetting, setResetting] = useState<AkunTableRow | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [resetPending, setResetPending] = useState(false);

  async function confirmDelete() {
    if (!deleting) return;
    const result = await deleteAkunAction(deleting.id);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setDeleting(null);
    router.refresh();
  }

  async function handleReset() {
    if (!resetting) return;
    setResetPending(true);
    try {
      const result = await resetPasswordAkunAction(resetting.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setTempPassword(result.data?.temporaryPassword ?? null);
      toast.success(result.message);
    } finally {
      setResetPending(false);
    }
  }

  function closeResetDialog() {
    setResetting(null);
    setTempPassword(null);
  }

  const columns: ColumnDef<AkunTableRow>[] = [
    {
      accessorKey: "name",
      header: "Nama",
      cell: ({ row }) => (
        <div className="min-w-0 max-w-56">
          <p className="truncate font-medium">{row.original.name}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.jabatan ?? "—"}</p>
        </div>
      ),
    },
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.username}</span>,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <Badge variant="secondary">{ROLE_LABELS[row.original.role]}</Badge>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email ?? "—"}</span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge>Aktif</Badge>
        ) : (
          <Badge variant="destructive">Nonaktif</Badge>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const isSelf = row.original.id === currentUserId;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`Opsi ${row.original.username}`}>
                  <MoreHorizontal aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/akun/${row.original.id}/edit`}>
                    <Pencil aria-hidden="true" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setResetting(row.original);
                    setTempPassword(null);
                  }}
                >
                  <KeyRound aria-hidden="true" />
                  Reset Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isSelf}
                  onClick={() => setDeleting(row.original)}
                >
                  <Trash2 aria-hidden="true" />
                  {isSelf ? "Tidak bisa hapus akun sendiri" : "Hapus"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        caption="Daftar akun pegawai"
        emptyTitle="Belum ada akun"
        emptyDescription="Belum ada akun yang cocok dengan filter."
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(value) => {
          if (!value) setDeleting(null);
        }}
        title="Hapus akun?"
        description={`Akun “${deleting?.username ?? ""}” beserta dokumen miliknya akan dihapus permanen.`}
        confirmLabel="Hapus Akun"
        onConfirm={confirmDelete}
      />

      <Dialog
        open={resetting !== null}
        onOpenChange={(value) => {
          if (!value) closeResetDialog();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              {tempPassword
                ? "Salin password sementara di bawah dan berikan ke pengguna. Tidak ditampilkan lagi setelah ditutup."
                : `Hasilkan password sementara untuk “${resetting?.username ?? ""}”.`}
            </DialogDescription>
          </DialogHeader>

          {tempPassword ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input readOnly value={tempPassword} className="font-mono" aria-label="Password sementara" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Salin password"
                  onClick={() => {
                    void navigator.clipboard.writeText(tempPassword);
                    toast.success("Password disalin.");
                  }}
                >
                  <Copy aria-hidden="true" />
                </Button>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={closeResetDialog}>
              {tempPassword ? "Selesai" : "Batal"}
            </Button>
            {!tempPassword && (
              <Button onClick={handleReset} disabled={resetPending}>
                {resetPending ? "Memproses…" : "Reset Password"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
