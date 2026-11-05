import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import { PostCard } from '@/components/feed/PostCard'
import { FeedSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { postService } from '@/services/postService'
import { queryKeys } from '@/constants/queryKeys'
import { APP_CONFIG } from '@/config/api'
import { usePostStore } from '@/store/postStore'
import { Newspaper } from 'lucide-react'
import type { Post } from '@/types'

interface FeedListProps {
  search?: string
}

export function FeedList({ search }: FeedListProps) {
  const optimistic = usePostStore((s) => s.optimisticPosts)
  const { ref, inView } = useInView({ rootMargin: '200px' })

  const query = useInfiniteQuery({
    queryKey: queryKeys.posts.list(search),
    queryFn: async ({ pageParam = 1 }) => {
      const result = await postService.getPosts(search, pageParam, APP_CONFIG.feedPageSize)
      return {
        items: result.posts,
        nextPage: result.meta.hasMore ? pageParam + 1 : undefined,
        total: result.meta.total,
      }
    },
    initialPageParam: 1,
    getNextPageParam: (last) => last.nextPage,
  })

  useEffect(() => {
    if (inView && query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage()
    }
  }, [inView, query])

  const posts = useMemo(() => {
    const pages = query.data?.pages.flatMap((p) => p.items) ?? []
    const ids = new Set(pages.map((p) => p._id))
    const extras = optimistic.filter((p) => !ids.has(p._id))
    return [...extras, ...pages] as Post[]
  }, [query.data, optimistic])

  if (query.isLoading) return <FeedSkeleton />

  if (query.isError) {
    return (
      <EmptyState
        icon={<Newspaper className="h-7 w-7" />}
        title="Couldn't load the feed"
        description="Check your connection and try again."
        actionLabel="Retry"
        onAction={() => void query.refetch()}
      />
    )
  }

  if (!posts.length) {
    return (
      <EmptyState
        icon={<Newspaper className="h-7 w-7" />}
        title="No stories yet"
        description="Be the first to publish something memorable."
      />
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {posts.map((post, i) => (
        <PostCard key={post._id} post={post} index={i} />
      ))}
      <div ref={ref} className="py-4">
        {query.isFetchingNextPage ? <FeedSkeleton /> : null}
      </div>
    </div>
  )
}
