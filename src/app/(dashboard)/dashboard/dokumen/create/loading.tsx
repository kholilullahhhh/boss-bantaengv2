import { FormSkeleton } from "@/components/skeletons";

export default function CreateDokumenLoading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-56 animate-pulse rounded bg-muted" />
      <FormSkeleton fields={6} />
    </div>
  );
}
