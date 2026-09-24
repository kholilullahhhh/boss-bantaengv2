import { FormSkeleton } from "@/components/skeletons";

export default function CreateJenisUsahaLoading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-48 animate-pulse rounded bg-muted" />
      <FormSkeleton fields={3} />
    </div>
  );
}
