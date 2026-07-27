import { create } from 'zustand'
import type { User } from '@/types'

interface UserState {
  profileCache: Record<string, User>
  setProfile: (user: User) => void
  getProfile: (id: string) => User | undefined
  clear: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  profileCache: {},
  setProfile: (user) =>
    set((s) => ({
      profileCache: { ...s.profileCache, [user._id]: user },
    })),
  getProfile: (id) => get().profileCache[id],
  clear: () => set({ profileCache: {} }),
}))
