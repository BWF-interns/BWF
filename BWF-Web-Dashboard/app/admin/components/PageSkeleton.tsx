// app/admin/components/PageSkeleton.tsx
// Animated skeleton shown while API data is loading — eliminates blank page flash.

export default function PageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-lg bg-[#efe3d5]" />
        <div className="h-4 w-80 rounded bg-[#f5ece1]" />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[#efe3d5] bg-white p-4 shadow-sm space-y-2">
            <div className="h-3 w-20 rounded bg-[#f5ece1]" />
            <div className="h-7 w-16 rounded bg-[#efe3d5]" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#efe3d5] bg-white shadow-sm overflow-hidden">
        <div className="h-10 bg-[#f8efe5]" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 border-t border-[#f2e9de] px-4 py-3">
            <div className="h-4 flex-1 rounded bg-[#f5ece1]" />
            <div className="h-4 w-20 rounded bg-[#f5ece1]" />
            <div className="h-4 w-16 rounded bg-[#f5ece1]" />
            <div className="h-4 w-24 rounded bg-[#f5ece1]" />
          </div>
        ))}
      </div>
    </div>
  );
}
