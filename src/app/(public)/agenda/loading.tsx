export default function AgendaLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-12 lg:px-6">
      <div className="h-9 w-64 animate-pulse rounded bg-muted" />
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-36 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}
