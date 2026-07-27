import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Eye } from 'lucide-react'
import { postService } from '@/services/postService'
import { queryKeys } from '@/constants/queryKeys'
import { CommentsSection } from '@/components/comments/CommentsSection'
import { FeedSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import { ROUTES } from '@/constants/routes'
import {
  formatRelativeTime,
  getAvatarUrl,
  getDisplayName,
  getUserId,
  resolveImageUrl,
} from '@/utils/format'
import { blurIn } from '@/animations/variants'

export default function PostDetailPage() {
  const { id = '' } = useParams()

  const { data: post, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => postService.getPost(id),
    enabled: !!id,
  })
  const [imageFailed, setImageFailed] = useState(false)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <FeedSkeleton />
      </div>
    )
  }

  if (isError || !post) {
    return (
      <EmptyState
        title="Story not found"
        description="It may have been deleted or the link is incorrect."
        actionLabel="Retry"
        onAction={() => void refetch()}
      />
    )
  }

  const authorId = getUserId(post.author)
  const authorName = getDisplayName(post.author)
  const cover = resolveImageUrl(post.coverImage)

  return (
    <motion.article
      variants={blurIn}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-2xl"
    >
      <Link
        to={ROUTES.feed}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Back to feed
      </Link>

      <div className="glass overflow-hidden rounded-[2rem]">
        {cover && !imageFailed ? (
          <img
            src={cover}
            alt={post.title}
            className="aspect-[16/9] w-full object-cover"
            loading="eager"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : post.coverImage ? (
          <div className="flex aspect-[16/9] items-center justify-center bg-surface-2 text-sm text-muted">
            Cover image unavailable
          </div>
        ) : null}
        <div className="p-6 md:p-8">
          <div className="mb-2 flex flex-wrap gap-2 text-xs text-muted">
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-accent">
              {post.category || 'General'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime || 1} min read
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {post.views || 0} views
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {post.title}
          </h1>
          <Link to={ROUTES.profile(authorId)} className="mt-5 flex items-center gap-3">
            <Avatar src={getAvatarUrl(post.author)} name={authorName} />
            <div>
              <p className="text-sm font-semibold">{authorName}</p>
              <p className="text-xs text-muted">{formatRelativeTime(post.createdAt)}</p>
            </div>
          </Link>
          <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
            <p className="whitespace-pre-wrap text-[15px] leading-7 text-ink/90">{post.content}</p>
          </div>
        </div>
      </div>

      <CommentsSection postId={post._id} />
    </motion.article>
  )
}
