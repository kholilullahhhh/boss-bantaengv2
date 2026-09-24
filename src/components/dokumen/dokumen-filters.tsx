"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
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

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Terbaru" },
  { value: "createdAt:asc", label: "Terlama" },
  { value: "judul:asc", label: "Judul A–Z" },
  { value: "tanggalDokumen:desc", label: "Tanggal dokumen" },
  { value: "fileSize:desc", label: "Ukuran terbesar" },
];

export function DokumenFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = searchParams.get("sortOrder") ?? "desc";
  const sortValue = `${sortBy}:${sortOrder}`;

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  function pushParams(update: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(update)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    if (!("page" in update)) params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <form
      className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-2 xl:grid-cols-6"
      onSubmit={(event) => {
        event.preventDefault();
        pushParams({ search: search.trim() });
      }}
    >
      <div className="space-y-1.5 xl:col-span-2">
        <Label htmlFor="dokumen-search" className="text-xs text-muted-foreground">
          Cari judul
        </Label>
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="dokumen-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Kata kunci…"
            className="pl-8"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="date-from" className="text-xs text-muted-foreground">
          Dari tanggal
        </Label>
        <Input
          id="date-from"
          type="date"
          defaultValue={dateFrom}
          onBlur={(event) => pushParams({ dateFrom: event.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="date-to" className="text-xs text-muted-foreground">
          Sampai tanggal
        </Label>
        <Input
          id="date-to"
          type="date"
          defaultValue={dateTo}
          onBlur={(event) => pushParams({ dateTo: event.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Urutkan</Label>
        <Select
          value={sortValue}
          onValueChange={(value) => {
            const [by, order] = value.split(":");
            pushParams({ sortBy: by, sortOrder: order });
          }}
        >
          <SelectTrigger className="w-full" aria-label="Urutkan dokumen">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end gap-2">
        <Button type="submit" size="sm" className="flex-1">
          Terapkan
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setSearch("");
            const params = new URLSearchParams(searchParams.toString());
            for (const key of ["search", "dateFrom", "dateTo", "folderId", "page"]) params.delete(key);
            const query = params.toString();
            router.push(query ? `${pathname}?${query}` : pathname);
          }}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
