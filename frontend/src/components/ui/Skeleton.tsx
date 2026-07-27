import { cn } from '@/lib/cn'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton rounded-2xl', className)} aria-hidden />
}

export function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="Loading feed">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="glass overflow-hidden rounded-3xl p-4">
          <div className="mb-4 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="mb-3 h-4 w-3/4" />
          <Skeleton className="mb-4 aspect-[16/10] w-full rounded-2xl" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading profile">
      <Skeleton className="h-44 w-full rounded-3xl" />
      <div className="flex items-end gap-4 px-2">
        <Skeleton className="-mt-16 h-24 w-24 rounded-full" />
        <div className="mb-2 flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

export function CommentSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return <Skeleton className="h-40 w-full rounded-3xl" />
}

export function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3" aria-busy="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-3xl" />
      ))}
    </div>
  )
}
