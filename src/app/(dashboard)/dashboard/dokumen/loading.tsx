import { TableSkeleton, FormSkeleton } from "@/components/skeletons";

export default function DokumenLoading() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="h-7 w-40 animate-pulse rounded bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted" />
      </div>
      <FormSkeleton fields={2} />
      <TableSkeleton rows={8} />
    </div>
  );
}
