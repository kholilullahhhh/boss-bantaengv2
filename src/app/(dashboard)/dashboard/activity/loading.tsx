import { TableSkeleton } from "@/components/skeletons";

export default function ActivityLoading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-48 animate-pulse rounded bg-muted" />
      <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
      <TableSkeleton rows={10} />
    </div>
  );
}
