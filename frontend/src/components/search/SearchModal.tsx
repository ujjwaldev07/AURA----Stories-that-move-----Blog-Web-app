import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Search as SearchIcon, TrendingUp, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useSearchStore } from '@/store/searchStore'
import { useDebounce } from '@/hooks/useDebounce'
import { postService } from '@/services/postService'
import { userService } from '@/services/userService'
import { queryKeys } from '@/constants/queryKeys'
import { ROUTES } from '@/constants/routes'
import { Avatar } from '@/components/ui/Avatar'
import { emailToUsername, getAvatarUrl, truncate } from '@/utils/format'

export function SearchModal() {
  const { isOpen, setOpen, recent, addRecent, clearRecent, query, setQuery } = useSearchStore()
  const [local, setLocal] = useState(query)
  const debounced = useDebounce(local, 320)

  useEffect(() => {
    if (isOpen) setLocal(query)
  }, [isOpen, query])

  useEffect(() => {
    setQuery(debounced)
  }, [debounced, setQuery])

  const postsQuery = useQuery({
    queryKey: queryKeys.search.query(`posts:${debounced}`),
    queryFn: () => postService.getPosts(debounced || undefined),
    enabled: isOpen,
  })

  const usersQuery = useQuery({
    queryKey: queryKeys.search.query(`users:${debounced}`),
    queryFn: () => userService.search(debounced),
    enabled: isOpen,
  })

  const trendingPosts = useMemo(() => {
    const posts = postsQuery.data?.posts || []
    return [...posts]
      .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
      .slice(0, 5)
  }, [postsQuery.data])

  const close = () => setOpen(false)

  const commitSearch = (q: string) => {
    addRecent(q)
    setLocal(q)
    setQuery(q)
  }

  return (
    <Modal open={isOpen} onClose={close} title="Search" size="lg">
      <div className="relative mb-4">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          autoFocus
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && local.trim()) commitSearch(local)
          }}
          placeholder="Search stories and people…"
          className="h-12 w-full rounded-2xl border border-border bg-surface pr-10 pl-10 outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--accent-soft)]"
          aria-label="Search"
        />
        {local ? (
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted"
            onClick={() => setLocal('')}
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        {!debounced ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {recent.length ? (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold tracking-wide text-muted uppercase">Recent</p>
                  <button type="button" className="text-xs text-accent" onClick={clearRecent}>
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => commitSearch(r)}
                      className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1.5 text-sm hover:bg-accent-soft"
                    >
                      <Clock className="h-3.5 w-3.5 text-muted" />
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-muted uppercase">
                <TrendingUp className="h-3.5 w-3.5" /> Trending posts
              </p>
              <div className="space-y-2">
                {trendingPosts.map((p) => (
                  <Link
                    key={p._id}
                    to={ROUTES.post(p._id)}
                    onClick={close}
                    className="block rounded-2xl px-3 py-2 hover:bg-surface-2"
                  >
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted">{truncate(p.excerpt || p.content, 80)}</p>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">People</p>
              <div className="space-y-1">
                {(usersQuery.data || []).slice(0, 6).map((u) => (
                  <Link
                    key={u._id}
                    to={ROUTES.profile(u._id)}
                    onClick={() => {
                      commitSearch(debounced)
                      close()
                    }}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-surface-2"
                  >
                    <Avatar src={getAvatarUrl(u)} name={emailToUsername(u.email)} size="sm" />
                    <div>
                      <p className="text-sm font-medium">{emailToUsername(u.email)}</p>
                      <p className="text-xs text-muted">{u.email}</p>
                    </div>
                  </Link>
                ))}
                {!usersQuery.data?.length ? (
                  <p className="px-3 py-2 text-sm text-muted">No people found</p>
                ) : null}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Stories</p>
              <div className="space-y-1">
                {(postsQuery.data?.posts || []).slice(0, 8).map((p) => (
                  <Link
                    key={p._id}
                    to={ROUTES.post(p._id)}
                    onClick={() => {
                      commitSearch(debounced)
                      close()
                    }}
                    className="block rounded-2xl px-3 py-2 hover:bg-surface-2"
                  >
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted">{truncate(p.content, 90)}</p>
                  </Link>
                ))}
{!postsQuery.data?.posts?.length ? (
                  <p className="px-3 py-2 text-sm text-muted">No stories found</p>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
