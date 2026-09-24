import { FormSkeleton } from "@/components/skeletons";

export default function EditDokumenLoading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-40 animate-pulse rounded bg-muted" />
      <FormSkeleton fields={6} />
    </div>
  );
}
