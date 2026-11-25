import { Skeleton, TableSkeleton } from "@/components/ui/States";

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-live="polite">
      <span className="sr-only">Loading admin screen</span>
      <div className="flex flex-col gap-3 pb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-2 gap-px border border-hair bg-hair sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2 bg-surface px-3.5 py-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-14" />
          </div>
        ))}
      </div>
      <div className="rounded-sm border border-hair bg-surface">
        <TableSkeleton rows={8} cols={6} />
      </div>
    </div>
  );
}
