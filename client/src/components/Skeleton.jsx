export function SkeletonCard({ className = "" }) {
  return (
    <div
      className={`skeleton h-32 rounded-2xl border border-white/5 dark:border-white/5 ${className}`}
    />
  );
}

export function SkeletonStat() {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="skeleton mb-3 h-4 w-24 rounded" />
      <div className="skeleton h-10 w-20 rounded-lg" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}
