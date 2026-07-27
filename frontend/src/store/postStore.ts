import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Post } from '@/types'

interface PostState {
  draftCaption: string
  isCreateOpen: boolean
  optimisticPosts: Post[]
  setDraftCaption: (v: string) => void
  setCreateOpen: (v: boolean) => void
  prependOptimistic: (post: Post) => void
  clearOptimistic: () => void
}

export const usePostStore = create<PostState>()(
  persist(
    (set) => ({
      draftCaption: '',
      isCreateOpen: false,
      optimisticPosts: [],

      setDraftCaption: (v) => set({ draftCaption: v }),
      setCreateOpen: (v) => set({ isCreateOpen: v }),

      prependOptimistic: (post) =>
        set((s) => ({ optimisticPosts: [post, ...s.optimisticPosts] })),

      clearOptimistic: () => set({ optimisticPosts: [] }),
    }),
    {
      name: 'aura-posts',
      partialize: (s) => ({ draftCaption: s.draftCaption }),
    },
  ),
)
