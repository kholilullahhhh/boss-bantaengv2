"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderPlus, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/forms/field-error";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn } from "@/lib/utils";
import { folderSchema, type FolderInput } from "@/lib/validations";
import type { z } from "zod";
import { createFolderAction, deleteFolderAction, updateFolderAction } from "@/server/actions/folder";
import type { FolderSidebarItem } from "@/server/queries/dokumen";

export const FOLDER_COLORS: Array<{ value: number; className: string; label: string }> = [
  { value: 1, className: "bg-blue-500", label: "Biru" },
  { value: 2, className: "bg-emerald-500", label: "Hijau" },
  { value: 3, className: "bg-amber-500", label: "Kuning" },
  { value: 4, className: "bg-rose-500", label: "Merah" },
  { value: 5, className: "bg-violet-500", label: "Ungu" },
  { value: 6, className: "bg-cyan-500", label: "Cyan" },
  { value: 7, className: "bg-orange-500", label: "Oranye" },
  { value: 8, className: "bg-slate-500", label: "Abu" },
];

export function folderColorClass(color: number): string {
  return FOLDER_COLORS.find((entry) => entry.value === color)?.className ?? "bg-slate-500";
}

interface FolderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder?: FolderSidebarItem | null;
  onSaved: () => void;
}

function FolderFormDialog({ open, onOpenChange, folder, onSaved }: FolderFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof folderSchema>, unknown, FolderInput>({
    resolver: zodResolver(folderSchema),
    defaultValues: { name: folder?.name ?? "", color: folder?.color ?? 1 },
  });

  async function onSubmit(values: FolderInput) {
    const result = folder
      ? await updateFolderAction(folder.id, values)
      : await createFolderAction(values);

    if (!result.success) {
      toast.error(result.message);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (field in values) setError(field as keyof FolderInput, { message: messages[0] });
        }
      }
      return;
    }

    toast.success(result.message);
    reset();
    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!isSubmitting) {
          onOpenChange(value);
          if (!value) reset();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{folder ? "Edit Folder" : "Folder Baru"}</DialogTitle>
          <DialogDescription>
            {folder ? "Ubah nama atau warna folder." : "Buat folder untuk mengelompokkan dokumen."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Nama Folder</Label>
            <Input
              id="folder-name"
              disabled={isSubmitting}
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder-color">Warna (1–8)</Label>
            <div className="flex flex-wrap gap-2" id="folder-color">
              {FOLDER_COLORS.map((color) => (
                <label
                  key={color.value}
                  className={cn(
                    "flex size-9 cursor-pointer items-center justify-center rounded-full text-xs font-semibold text-white ring-offset-2",
                    color.className,
                    "has-[:checked]:ring-2 has-[:checked]:ring-ring"
                  )}
                  title={color.label}
                >
                  <input
                    type="radio"
                    value={color.value}
                    className="sr-only"
                    disabled={isSubmitting}
                    {...register("color", { valueAsNumber: true })}
                  />
                  {color.value}
                </label>
              ))}
            </div>
            <FieldError message={errors.color?.message} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface FolderPanelProps {
  folders: FolderSidebarItem[];
  unfiledCount: number;
}

export function FolderPanel({ folders, unfiledCount }: FolderPanelProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFolder = searchParams.get("folderId") ?? "";

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<FolderSidebarItem | null>(null);
  const [deleting, setDeleting] = useState<FolderSidebarItem | null>(null);

  function folderHref(folderId: string): string {
    const params = new URLSearchParams(searchParams.toString());
    if (folderId) params.set("folderId", folderId);
    else params.delete("folderId");
    params.delete("page");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  async function confirmDelete() {
    if (!deleting) return;
    const result = await deleteFolderAction(deleting.id);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Folder</h2>
        <Button size="xs" variant="outline" onClick={() => setCreateOpen(true)}>
          <FolderPlus aria-hidden="true" />
          Baru
        </Button>
      </div>

      <nav aria-label="Filter folder" className="space-y-1">
        <Link
          href={folderHref("")}
          aria-current={activeFolder === "" ? "page" : undefined}
          className={cn(
            "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
            activeFolder === ""
              ? "bg-primary/10 font-medium text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <span>Semua Dokumen</span>
          <span className="text-xs tabular-nums">{folders.reduce((sum, f) => sum + f.count, 0) + unfiledCount}</span>
        </Link>

        <Link
          href={folderHref("__unfiled__")}
          aria-current={activeFolder === "__unfiled__" ? "page" : undefined}
          className={cn(
            "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
            activeFolder === "__unfiled__"
              ? "bg-primary/10 font-medium text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <span>Tanpa Folder</span>
          <span className="text-xs tabular-nums">{unfiledCount}</span>
        </Link>

        {folders.length === 0 && (
          <p className="px-3 py-2 text-xs text-muted-foreground">
            Belum ada folder. Klik “Baru” untuk membuat.
          </p>
        )}

        {folders.map((folder) => {
          const isActive = activeFolder === folder.id;
          return (
            <div
              key={folder.id}
              className={cn(
                "group flex items-center gap-1 rounded-lg pr-1 transition-colors",
                isActive ? "bg-primary/10" : "hover:bg-muted"
              )}
            >
              <Link
                href={folderHref(folder.id)}
                aria-current={isActive ? "page" : undefined}
                className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 text-sm"
              >
                <span className={cn("size-2.5 shrink-0 rounded-full", folderColorClass(folder.color))} aria-hidden="true" />
                <span className={cn("truncate", isActive ? "font-medium text-primary" : "text-muted-foreground group-hover:text-foreground")}>
                  {folder.name}
                </span>
                <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">
                  {folder.count}
                </span>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    aria-label={`Opsi folder ${folder.name}`}
                  >
                    <MoreHorizontal aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditing(folder)}>
                    <Pencil aria-hidden="true" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => setDeleting(folder)}>
                    <Trash2 aria-hidden="true" />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </nav>

      <FolderFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={() => router.refresh()}
      />
      <FolderFormDialog
        open={editing !== null}
        onOpenChange={(value) => {
          if (!value) setEditing(null);
        }}
        folder={editing}
        onSaved={() => router.refresh()}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(value) => {
          if (!value) setDeleting(null);
        }}
        title="Hapus folder?"
        description={`Folder “${deleting?.name ?? ""}” beserta seluruh dokumen di dalamnya akan dihapus permanen, termasuk berkasnya.`}
        confirmLabel="Hapus Folder"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
