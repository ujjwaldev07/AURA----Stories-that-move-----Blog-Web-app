import { useAuthStore } from '@/store/authStore'
import { usePostStore } from '@/store/postStore'
import { FeedList } from '@/components/feed/FeedList'
import { Button } from '@/components/ui/Button'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { PenSquare, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { postService } from '@/services/postService'
import { queryKeys } from '@/constants/queryKeys'

export default function FeedPage() {
  const user = useAuthStore((s) => s.user)
  const setCreateOpen = usePostStore((s) => s.setCreateOpen)

  const stats = useQuery({
    queryKey: queryKeys.posts.list('stats'),
    queryFn: () => postService.getPosts(),
  })

  const posts = stats.data?.posts || []
  const likes = posts.reduce((acc, p) => acc + (p.likes?.length || 0), 0)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Welcome back</p>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {user?.username || 'Creator'}
            </h1>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="hidden sm:inline-flex">
            <PenSquare className="h-4 w-4" />
            New story
          </Button>
        </div>
        <FeedList />
      </div>

      <aside className="hidden space-y-4 lg:block">
        <div className="glass sticky top-24 space-y-4 rounded-3xl p-5">
          <div className="flex items-center gap-2 text-accent">
            <Sparkles className="h-4 w-4" />
            <p className="text-sm font-semibold">Today</p>
          </div>
          {stats.isLoading ? (
            <DashboardSkeleton />
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl bg-surface-2/80 p-4">
                <p className="text-xs text-muted">Stories in feed</p>
                <p className="font-display text-2xl font-bold">
                  <AnimatedCounter value={posts.length} />
                </p>
              </div>
              <div className="rounded-2xl bg-surface-2/80 p-4">
                <p className="text-xs text-muted">Total likes</p>
                <p className="font-display text-2xl font-bold">
                  <AnimatedCounter value={likes} />
                </p>
              </div>
            </div>
          )}
          <p className="text-xs leading-relaxed text-muted">
            Save stories to your account so they remain available on every signed-in device.
          </p>
        </div>
      </aside>
    </div>
  )
}
