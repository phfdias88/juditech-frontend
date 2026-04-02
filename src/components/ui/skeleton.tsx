import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-slate-800/60",
        className
      )}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-11 w-11 rounded-lg" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr>
      <td className="py-3 pr-4"><Skeleton className="h-4 w-40" /></td>
      <td className="py-3 pr-4"><Skeleton className="h-5 w-16 rounded" /></td>
      <td className="py-3 pr-4"><Skeleton className="h-4 w-24" /></td>
      <td className="py-3 pr-4"><Skeleton className="h-4 w-20" /></td>
      <td className="py-3 pr-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
      <td className="py-3"><Skeleton className="h-4 w-28" /></td>
    </tr>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <Skeleton className="mb-6 h-6 w-40" />
        <div className="space-y-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="pb-3 pr-4"><Skeleton className="h-3 w-8" /></th>
                <th className="pb-3 pr-4"><Skeleton className="h-3 w-14" /></th>
                <th className="pb-3 pr-4"><Skeleton className="h-3 w-8" /></th>
                <th className="pb-3 pr-4"><Skeleton className="h-3 w-10" /></th>
                <th className="pb-3 pr-4"><Skeleton className="h-3 w-12" /></th>
                <th className="pb-3"><Skeleton className="h-3 w-8" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
