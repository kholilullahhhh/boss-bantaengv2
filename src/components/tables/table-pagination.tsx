"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  pageSizes?: number[];
}

function pageWindow(page: number, totalPages: number): number[] {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages: number[] = [];
  for (let i = start; i <= end; i += 1) pages.push(i);
  return pages;
}

export function TablePagination({
  page,
  pageSize,
  total,
  pageSizes = [10, 25, 50],
}: TablePaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function navigate(next: { page?: number; pageSize?: number }) {
    const params = new URLSearchParams(searchParams.toString());
    const targetPage = next.page ?? page;
    const targetSize = next.pageSize ?? pageSize;
    if (targetPage <= 1) params.delete("page");
    else params.set("page", String(targetPage));
    if (targetSize === 10) params.delete("pageSize");
    else params.set("pageSize", String(targetSize));
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  if (total === 0) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Total {total} data · Halaman {page} dari {totalPages}
      </p>
      <div className="flex items-center gap-3">
        <Select
          value={String(pageSize)}
          onValueChange={(value) => navigate({ pageSize: Number(value), page: 1 })}
        >
          <SelectTrigger size="sm" className="w-24" aria-label="Jumlah baris per halaman">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizes.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} / hal
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                text="Sebelumnya"
                onClick={(event) => {
                  event.preventDefault();
                  if (page > 1) navigate({ page: page - 1 });
                }}
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>
            {pageWindow(page, totalPages).map((value) => (
              <PaginationItem key={value}>
                <PaginationLink
                  href="#"
                  isActive={value === page}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate({ page: value });
                  }}
                >
                  {value}
                </PaginationLink>
              </PaginationItem>
            ))}
            {totalPages > 5 && page < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                text="Berikutnya"
                onClick={(event) => {
                  event.preventDefault();
                  if (page < totalPages) navigate({ page: page + 1 });
                }}
                aria-disabled={page >= totalPages}
                className={page >= totalPages ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
