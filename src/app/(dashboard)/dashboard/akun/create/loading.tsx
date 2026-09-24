import { FormSkeleton } from "@/components/skeletons";

export default function CreateAkunLoading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-32 animate-pulse rounded bg-muted" />
      <FormSkeleton fields={7} />
    </div>
  );
}
