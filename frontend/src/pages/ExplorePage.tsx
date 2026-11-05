import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Compass } from 'lucide-react'
import { postService } from '@/services/postService'
import { queryKeys } from '@/constants/queryKeys'
import { PostCard } from '@/components/feed/PostCard'
import { FeedSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

export default function ExplorePage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.posts.list('explore'),
    queryFn: () => postService.getPosts(),
  })

  const trending = useMemo(() => {
    const allPosts = data?.posts || []
    return [...allPosts]
      .sort((a, b) => (b.likes?.length || 0) + (b.views || 0) - ((a.likes?.length || 0) + (a.views || 0)))
      .slice(0, 20)
  }, [data])

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <p className="inline-flex items-center gap-2 text-sm text-accent">
          <Compass className="h-4 w-4" /> Explore
        </p>
        <h1 className="font-display text-3xl font-bold">Trending stories</h1>
        <p className="mt-1 text-sm text-muted">Ranked by engagement across the community.</p>
      </div>
      {isLoading ? (
        <FeedSkeleton />
      ) : isError ? (
        <EmptyState
          title="Couldn’t load explore"
          actionLabel="Retry"
          onAction={() => void refetch()}
        />
      ) : trending.length === 0 ? (
        <EmptyState title="Nothing trending yet" description="Publish something to kick things off." />
      ) : (
        <div className="space-y-5">
          {trending.map((p, i) => (
            <PostCard key={p._id} post={p} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
