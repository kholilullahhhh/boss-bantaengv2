export default function PublicLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-16 lg:px-6">
      <div className="h-10 w-2/3 max-w-lg animate-pulse rounded bg-muted" />
      <div className="h-4 w-full max-w-xl animate-pulse rounded bg-muted" />
      <div className="h-4 w-5/6 max-w-xl animate-pulse rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
