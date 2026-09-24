import { FormSkeleton } from "@/components/skeletons";

export default function EditJenisUsahaLoading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-44 animate-pulse rounded bg-muted" />
      <FormSkeleton fields={3} />
    </div>
  );
}
