import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted shimmer", className)}
      {...props}
    />
  )
}

function SkeletonText({
  className,
  lines = 3,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4 w-full",
            i === lines - 1 && "w-4/5" // Last line shorter
          )}
        />
      ))}
    </div>
  )
}

function SkeletonCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-2xl border bg-card p-6 shadow-sm", className)} {...props}>
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-6 w-32 mb-2" />
      <SkeletonText lines={2} />
      <div className="mt-6 flex gap-2">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  )
}

function SkeletonChart({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-2xl border bg-card p-6 shadow-sm", className)} {...props}>
      <div className="mb-6">
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-[300px] w-full rounded-md" />
    </div>
  )
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonChart }
