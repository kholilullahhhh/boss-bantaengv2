"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchFilter({ placeholder = "Cari…", label = "Cari" }: { placeholder?: string; label?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");

  useEffect(() => {
    setValue(searchParams.get("search") ?? "");
  }, [searchParams]);

  function push(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.trim()) params.set("search", next.trim());
    else params.delete("search");
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <form
      className="flex w-full items-end gap-2 sm:max-w-sm"
      onSubmit={(event) => {
        event.preventDefault();
        push(value);
      }}
    >
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className="pl-8"
        />
      </div>
      <Button type="submit" size="sm">
        Cari
      </Button>
      {value && (
        <Button type="button" size="sm" variant="ghost" onClick={() => push("")}>
          Reset
        </Button>
      )}
    </form>
  );
}
