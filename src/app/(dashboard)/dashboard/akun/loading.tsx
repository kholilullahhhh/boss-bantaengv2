import { TableSkeleton } from "@/components/skeletons";

export default function AkunLoading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-40 animate-pulse rounded bg-muted" />
      <TableSkeleton rows={8} />
    </div>
  );
}
