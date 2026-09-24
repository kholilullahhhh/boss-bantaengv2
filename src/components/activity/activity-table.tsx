"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/tables/data-table";
import type { ColumnDef } from "@tanstack/react-table";

export interface ActivityTableRow {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
  userName: string | null;
  username: string | null;
  metadata: unknown;
}

const ACTION_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  CREATE: "default",
  UPDATE: "secondary",
  DELETE: "destructive",
  LOGIN: "outline",
  PASSWORD_RESET: "destructive",
};

const ACTION_LABEL: Record<string, string> = {
  LOGIN: "Masuk",
  CREATE: "Buat",
  UPDATE: "Ubah",
  DELETE: "Hapus",
  PASSWORD_RESET: "Reset Password",
};

export function ActivityTable({ data }: { data: ActivityTableRow[] }) {
  const columns: ColumnDef<ActivityTableRow>[] = [
    {
      accessorKey: "createdAt",
      header: "Waktu",
      cell: ({ row }) => (
        <span className="text-sm">
          {new Date(row.original.createdAt).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      ),
    },
    {
      accessorKey: "userName",
      header: "Pengguna",
      cell: ({ row }) => (
        <div className="min-w-0 max-w-44">
          <p className="truncate text-sm font-medium">{row.original.userName ?? "Sistem"}</p>
          {row.original.username && (
            <p className="truncate font-mono text-xs text-muted-foreground">
              {row.original.username}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Aksi",
      meta: { className: "hidden sm:table-cell" },
      cell: ({ row }) => (
        <Badge variant={ACTION_VARIANT[row.original.action] ?? "secondary"}>
          {ACTION_LABEL[row.original.action] ?? row.original.action}
        </Badge>
      ),
    },
    {
      accessorKey: "entity",
      header: "Entitas",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="text-sm">{row.original.entity}</p>
          {row.original.entityId && (
            <p className="truncate font-mono text-xs text-muted-foreground">
              {row.original.entityId}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "ipAddress",
      header: "IP",
      meta: { className: "hidden lg:table-cell" },
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.ipAddress ?? "—"}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      caption="Log aktivitas"
      emptyTitle="Belum ada log"
      emptyDescription="Belum ada aktivitas yang cocok dengan filter."
    />
  );
}
