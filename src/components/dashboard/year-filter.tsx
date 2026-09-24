"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function YearFilter({ years, current }: { years: number[]; current: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const year = Number(value);
    const now = new Date().getFullYear();
    if (year === now) params.delete("year");
    else params.set("year", String(year));
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="year-filter" className="text-sm text-muted-foreground">
        Tahun
      </Label>
      <Select value={String(current)} onValueChange={onChange}>
        <SelectTrigger id="year-filter" size="sm" className="w-28" aria-label="Filter tahun">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
