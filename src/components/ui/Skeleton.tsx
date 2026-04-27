interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
}

export function BoardSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {(['todo', 'in-progress', 'done'] as const).map((col) => (
        <div key={col} className="flex flex-col gap-3">
          <Skeleton className="h-6 w-24" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-4">
              <Skeleton className="mb-2 h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
