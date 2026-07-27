import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { RECENT_SEARCHES_KEY } from '@/constants/storage'

interface SearchState {
  query: string
  recent: string[]
  isOpen: boolean
  setQuery: (q: string) => void
  setOpen: (v: boolean) => void
  addRecent: (q: string) => void
  clearRecent: () => void
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      query: '',
      recent: [],
      isOpen: false,
      setQuery: (q) => set({ query: q }),
      setOpen: (v) => set({ isOpen: v }),
      addRecent: (q) => {
        const trimmed = q.trim()
        if (!trimmed) return
        const next = [trimmed, ...get().recent.filter((r) => r !== trimmed)].slice(0, 8)
        set({ recent: next })
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
      },
      clearRecent: () => set({ recent: [] }),
    }),
    {
      name: 'aura-search',
      partialize: (s) => ({ recent: s.recent }),
    },
  ),
)
