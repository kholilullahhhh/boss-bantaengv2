"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ACTIONS = [
  { value: "LOGIN", label: "Masuk" },
  { value: "CREATE", label: "Buat" },
  { value: "UPDATE", label: "Ubah" },
  { value: "DELETE", label: "Hapus" },
  { value: "PASSWORD_RESET", label: "Reset Password" },
];

interface ActivityFiltersProps {
  entities: string[];
  users: Array<{ id: string; name: string }>;
}

export function ActivityFilters({ entities, users }: ActivityFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const action = searchParams.get("action") ?? "";
  const entity = searchParams.get("entity") ?? "";
  const userId = searchParams.get("userId") ?? "";
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";

  function update(next: Record<string, string>, resetPage = true) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === "__all__" || value === "") params.delete(key);
      else params.set(key, value);
    }
    if (resetPage) params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-2 xl:grid-cols-5">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Aksi</Label>
        <Select value={action || "__all__"} onValueChange={(value) => update({ action: value })}>
          <SelectTrigger className="w-full" aria-label="Filter aksi">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua aksi</SelectItem>
            {ACTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Entitas</Label>
        <Select value={entity || "__all__"} onValueChange={(value) => update({ entity: value })}>
          <SelectTrigger className="w-full" aria-label="Filter entitas">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua entitas</SelectItem>
            {entities.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Pengguna</Label>
        <Select value={userId || "__all__"} onValueChange={(value) => update({ userId: value })}>
          <SelectTrigger className="w-full" aria-label="Filter pengguna">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua pengguna</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="activity-from" className="text-xs text-muted-foreground">
          Dari tanggal
        </Label>
        <Input
          id="activity-from"
          type="date"
          defaultValue={dateFrom}
          onBlur={(event) => update({ dateFrom: event.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="activity-to" className="text-xs text-muted-foreground">
          Sampai tanggal
        </Label>
        <div className="flex gap-2">
          <Input
            id="activity-to"
            type="date"
            defaultValue={dateTo}
            onBlur={(event) => update({ dateTo: event.target.value })}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              for (const key of ["action", "entity", "userId", "dateFrom", "dateTo", "page"]) {
                params.delete(key);
              }
              const query = params.toString();
              router.push(query ? `${pathname}?${query}` : pathname);
            }}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
