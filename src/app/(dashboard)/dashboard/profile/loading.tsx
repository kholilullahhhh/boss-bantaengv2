import { FormSkeleton, CardsSkeleton } from "@/components/skeletons";

export default function ProfileLoading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-40 animate-pulse rounded bg-muted" />
      <CardsSkeleton count={1} />
      <FormSkeleton fields={6} />
    </div>
  );
}
