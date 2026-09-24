import { TableSkeleton } from "@/components/skeletons";

export default function JenisUsahaLoading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-44 animate-pulse rounded bg-muted" />
      <div className="h-9 w-full max-w-sm animate-pulse rounded bg-muted" />
      <TableSkeleton rows={8} />
    </div>
  );
}
