import { memo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Bookmark,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { Post } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { useAuthStore } from '@/store/authStore'
import { postService } from '@/services/postService'
import { bookmarkService } from '@/services/bookmarkService'
import { queryClient } from '@/lib/queryClient'
import { queryKeys } from '@/constants/queryKeys'
import { ROUTES } from '@/constants/routes'
import {
  formatRelativeTime,
  getAvatarUrl,
  getDisplayName,
  getUserId,
  resolveImageUrl,
  truncate,
} from '@/utils/format'
import { cn } from '@/lib/cn'
import { fadeUp } from '@/animations/variants'

interface PostCardProps {
  post: Post
  index?: number
}

export const PostCard = memo(function PostCard({ post, index = 0 }: PostCardProps) {
  const user = useAuthStore((s) => s.user)
  const authorId = getUserId(post.author)
  const authorName = getDisplayName(post.author)
  const authorAvatar = getAvatarUrl(post.author)
  const likes = post.likes || []
  const liked = user ? likes.includes(user.id) : false
  const [likeBusy, setLikeBusy] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const bookmarksQuery = useQuery({
    queryKey: queryKeys.bookmarks,
    queryFn: bookmarkService.list,
    enabled: Boolean(user),
    staleTime: 60_000,
  })
  const bookmarked = bookmarksQuery.data?.includes(post._id) ?? false
  const bookmarkMutation = useMutation({
    mutationFn: () => bookmarkService.toggle(post._id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bookmarks })
      const previous = queryClient.getQueryData<string[]>(queryKeys.bookmarks) || []
      queryClient.setQueryData<string[]>(queryKeys.bookmarks, bookmarked
        ? previous.filter((id) => id !== post._id)
        : [...previous, post._id])
      return { previous }
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(queryKeys.bookmarks, context?.previous)
      toast.error('Could not update bookmark')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks }),
  })
  const cover = resolveImageUrl(post.coverImage)

  const onLike = async () => {
    if (!user) {
      toast.error('Sign in to like posts')
      return
    }
    if (likeBusy) return
    setLikeBusy(true)
    const previous = likes
    const next = liked ? likes.filter((id) => id !== user.id) : [...likes, user.id]
    queryClient.setQueriesData({ queryKey: queryKeys.posts.all }, (old: unknown) => {
      if (!Array.isArray(old)) return old
      return (old as Post[]).map((p) => (p._id === post._id ? { ...p, likes: next } : p))
    })
    try {
      await postService.toggleLike({ ...post, likes: previous }, user.id)
    } catch {
      queryClient.setQueriesData({ queryKey: queryKeys.posts.all }, (old: unknown) => {
        if (!Array.isArray(old)) return old
        return (old as Post[]).map((p) => (p._id === post._id ? { ...p, likes: previous } : p))
      })
      toast.error('Could not update like')
    } finally {
      setLikeBusy(false)
    }
  }

  const onShare = async () => {
    const url = `${window.location.origin}${ROUTES.post(post._id)}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied')
    } catch {
      toast.error('Could not copy link')
    }
  }

  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: Math.min(index * 0.04, 0.2) }}
      whileHover={{ y: -3 }}
      className="glass group overflow-hidden rounded-3xl shadow-[var(--shadow-soft)]"
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <Link to={ROUTES.profile(authorId)} className="flex items-center gap-3">
          <Avatar src={authorAvatar} name={authorName} size="md" />
          <div>
            <p className="text-sm font-semibold">{authorName}</p>
            <p className="text-xs text-muted">{formatRelativeTime(post.createdAt)}</p>
          </div>
        </Link>
        <button
          type="button"
          className="rounded-xl p-2 text-muted opacity-0 transition group-hover:opacity-100 hover:bg-surface-2"
          aria-label="More options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <Link to={ROUTES.post(post._id)} className="mt-3 block px-4">
        <h3 className="font-display text-lg font-semibold leading-snug tracking-tight">
          {post.title}
        </h3>
        <p className="mt-1 text-sm text-muted">
          {truncate(post.excerpt || post.content, 140)}
        </p>
      </Link>

      {cover && !imageFailed ? (
        <Link to={ROUTES.post(post._id)} className="mt-4 block overflow-hidden px-3">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface-2">
            <motion.img
              src={cover}
              alt={post.title}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 768px) 100vw, 720px"
              className="h-full w-full object-cover"
              onError={() => setImageFailed(true)}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.45 }}
            />
          </div>
        </Link>
      ) : post.coverImage ? (
        <div className="mx-3 mt-4 flex aspect-[16/10] items-center justify-center rounded-2xl bg-surface-2 text-sm text-muted">
          Cover image unavailable
        </div>
      ) : null}

      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onLike}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm transition',
              liked ? 'bg-danger/10 text-danger' : 'text-muted hover:bg-surface-2 hover:text-ink',
            )}
            aria-pressed={liked}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <motion.span animate={{ scale: liked ? [1, 1.25, 1] : 1 }} transition={{ duration: 0.3 }}>
              <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
            </motion.span>
            <AnimatedCounter value={likes.length} />
          </button>
          <Link
            to={ROUTES.post(post._id)}
            className="inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-ink"
            aria-label="Comments"
          >
            <MessageCircle className="h-4 w-4" />
            <AnimatedCounter value={post.commentsCount || 0} />
          </Link>
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-ink"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!user) return toast.error('Sign in to bookmark posts')
            if (bookmarkMutation.isPending) return
            bookmarkMutation.mutate(undefined, { onSuccess: (saved) => toast.success(saved ? 'Saved' : 'Removed bookmark') })
          }}
          className={cn(
            'rounded-2xl p-2 transition',
            bookmarked ? 'text-warm' : 'text-muted hover:bg-surface-2 hover:text-ink',
          )}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          aria-pressed={bookmarked}
        >
          <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current')} />
        </button>
      </div>
    </motion.article>
  )
})
