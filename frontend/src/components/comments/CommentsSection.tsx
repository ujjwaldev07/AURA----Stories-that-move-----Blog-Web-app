import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Pencil, Reply, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { commentService } from '@/services/commentService'
import { queryKeys } from '@/constants/queryKeys'
import { useAuthStore } from '@/store/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { CommentSkeleton } from '@/components/ui/Skeleton'
import {
  formatRelativeTime,
  getAvatarUrl,
  getDisplayName,
  getUserId,
} from '@/utils/format'
import type { Comment } from '@/types'
import { APP_CONFIG } from '@/config/api'
import { cn } from '@/lib/cn'

interface CommentsSectionProps {
  postId: string
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [editing, setEditing] = useState<Comment | null>(null)
  const [typing, setTyping] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const { data: comments = [], isLoading } = useQuery({
    queryKey: queryKeys.comments.byPost(postId),
    queryFn: () => commentService.getByPost(postId),
  })

  const tree = useMemo(() => {
    const roots = comments.filter((c) => !c.parentId)
    const children = (parentId: string) => comments.filter((c) => c.parentId === parentId)
    return { roots, children }
  }, [comments])

  useEffect(() => {
    if (!text) {
      setTyping(false)
      return
    }
    setTyping(true)
    const t = setTimeout(() => setTyping(false), 900)
    return () => clearTimeout(t)
  }, [text])

  const createMutation = useMutation({
    mutationFn: () =>
      commentService.create({
        content: text.trim(),
        post: postId,
        parentId: replyTo?._id || null,
      }),
    onSuccess: async () => {
      setText('')
      setReplyTo(null)
      await qc.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) })
      toast.success('Comment posted')
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
      })
    },
    onError: (err: { message?: string }) => toast.error(err.message || 'Failed to comment'),
  })

  const updateMutation = useMutation({
    mutationFn: () => commentService.update(editing!._id, text.trim()),
    onSuccess: async () => {
      setEditing(null)
      setText('')
      await qc.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) })
      toast.success('Updated')
    },
    onError: (err: { message?: string }) => toast.error(err.message || 'Update failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => commentService.remove(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.comments.byPost(postId) })
      toast.success('Deleted', { duration: 2500 })
    },
    onError: (err: { message?: string }) => toast.error(err.message || 'Delete failed'),
  })

  const submit = () => {
    if (!user) return toast.error('Sign in to comment')
    if (text.trim().length < 2) return toast.error('Comment is too short')
    if (editing) updateMutation.mutate()
    else createMutation.mutate()
  }

  const renderComment = (comment: Comment, depth = 0) => {
    const name = getDisplayName(comment.author)
    const isOwner = user && getUserId(comment.author) === user.id
    const kids = tree.children(comment._id)

    return (
      <motion.div
        key={comment._id}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className={cn('space-y-3', depth > 0 && 'ml-8 border-l border-border pl-4')}
      >
        <div className="flex gap-3">
          <Avatar src={getAvatarUrl(comment.author)} name={name} size="sm" />
          <div className="flex-1 rounded-2xl bg-surface-2/70 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{name}</p>
              <span className="text-[11px] text-muted">{formatRelativeTime(comment.createdAt)}</span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-ink/90">{comment.content}</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
                onClick={() => {
                  setReplyTo(comment)
                  setEditing(null)
                  setText(`@${name} `)
                }}
              >
                <Reply className="h-3.5 w-3.5" /> Reply
              </button>
              {isOwner ? (
                <>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
                    onClick={() => {
                      setEditing(comment)
                      setReplyTo(null)
                      setText(comment.content)
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs text-danger hover:opacity-80"
                    onClick={() => deleteMutation.mutate(comment._id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
        <AnimatePresence>
          {kids.map((child) => renderComment(child, depth + 1))}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <section className="mt-8 space-y-5" aria-label="Comments">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Conversation</h2>
        <AnimatePresence>
          {typing ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-muted"
            >
              Typing…
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="glass rounded-3xl p-3">
        {replyTo || editing ? (
          <div className="mb-2 flex items-center justify-between rounded-xl bg-accent-soft px-3 py-2 text-xs text-accent">
            <span>{editing ? 'Editing comment' : `Replying to ${getDisplayName(replyTo!.author)}`}</span>
            <button
              type="button"
              onClick={() => {
                setReplyTo(null)
                setEditing(null)
                setText('')
              }}
            >
              Cancel
            </button>
          </div>
        ) : null}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, APP_CONFIG.commentMaxLength))}
          placeholder="Share your thoughts…"
          rows={3}
          className="w-full resize-none rounded-2xl border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted">
            {text.length}/{APP_CONFIG.commentMaxLength}
          </span>
          <Button
            size="sm"
            onClick={submit}
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {editing ? 'Save' : 'Comment'}
          </Button>
        </div>
      </div>

      <div ref={listRef} className="scrollbar-thin max-h-[480px] space-y-4 overflow-y-auto pr-1">
        {isLoading ? (
          <CommentSkeleton />
        ) : comments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">No comments yet — start the thread.</p>
        ) : (
          <AnimatePresence initial={false}>
            {tree.roots.map((c) => renderComment(c))}
          </AnimatePresence>
        )}
      </div>
    </section>
  )
}
