import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Grid3X3, List, Settings2 } from 'lucide-react'
import { userService } from '@/services/userService'
import { postService } from '@/services/postService'
import { queryKeys } from '@/constants/queryKeys'
import { useAuthStore } from '@/store/authStore'
import { ProfileSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { PostCard } from '@/components/feed/PostCard'
import { ROUTES } from '@/constants/routes'
import {
  emailToUsername,
  getAvatarUrl,
  resolveImageUrl,
} from '@/utils/format'
import { cn } from '@/lib/cn'

export default function ProfilePage() {
  const { id = '' } = useParams()
  const me = useAuthStore((s) => s.user)
  const [tab, setTab] = useState('grid')
  const isMe = me?.id === id

  const userQuery = useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userService.getById(id),
    enabled: !!id,
  })

  const postsQuery = useQuery({
    queryKey: queryKeys.posts.byUser(id),
    queryFn: () => postService.getUserPosts(id),
    enabled: !!id,
  })

  const user = userQuery.data
  const posts = postsQuery.data || []
  const username = user ? emailToUsername(user.email) : 'creator'
  const likes = useMemo(
    () => posts.reduce((a, p) => a + (p.likes?.length || 0), 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [posts],
  )

  if (userQuery.isLoading || postsQuery.isLoading) return <ProfileSkeleton />

  if (!user) {
    return (
      <EmptyState
        title="Profile not found"
        description="This creator may no longer exist."
        actionLabel="Go to feed"
        onAction={() => {
          window.location.href = ROUTES.feed
        }}
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative overflow-hidden rounded-[2rem]">
        <div
          className="h-44 bg-[linear-gradient(135deg,var(--mesh-1),var(--mesh-2),var(--mesh-3))] md:h-52"
          style={
            user.coverImage
              ? {
                  backgroundImage: `url(${resolveImageUrl(user.coverImage)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        />
        <div className="glass relative -mt-1 rounded-b-[2rem] px-5 pt-0 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar
                src={getAvatarUrl(user)}
                name={username}
                size="xl"
                className="-mt-12 border-4 border-surface shadow-lg"
                ring
              />
              <div className="pb-1">
                <h1 className="font-display text-2xl font-bold">{username}</h1>
                <p className="text-sm text-muted">{user.email}</p>
              </div>
            </div>
            {isMe ? (
              <Link to={ROUTES.editProfile}>
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4" />
                  Edit profile
                </Button>
              </Link>
            ) : null}
          </div>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/85">
            {user.bio || 'Exploring ideas, publishing stories, building in public.'}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: 'Posts', value: posts.length },
              { label: 'Likes', value: likes },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-surface-2/80 p-3 text-center">
                <p className="font-display text-xl font-bold">
                  <AnimatedCounter value={s.value} />
                </p>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Tabs
          tabs={[
            { id: 'grid', label: 'Grid' },
            { id: 'list', label: 'List' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={tab === 'grid' ? <Grid3X3 className="h-6 w-6" /> : <List className="h-6 w-6" />}
          title="No posts yet"
          description={isMe ? 'Share your first story with the world.' : 'This creator hasn’t published yet.'}
        />
      ) : tab === 'grid' ? (
        <motion.div
          layout
          className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          {posts.map((p) => (
            <Link
              key={p._id}
              to={ROUTES.post(p._id)}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-2xl bg-surface-2',
              )}
            >
              {p.coverImage ? (
                <img
                  src={resolveImageUrl(p.coverImage)}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-3 text-center text-xs font-medium">
                  {p.title}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition group-hover:opacity-100" />
            </Link>
          ))}
        </motion.div>
      ) : (
        <div className="mt-5 space-y-4">
          {posts.map((p, i) => (
            <PostCard key={p._id} post={p} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
