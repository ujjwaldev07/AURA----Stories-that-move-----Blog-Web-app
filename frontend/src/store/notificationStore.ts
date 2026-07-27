import { create } from 'zustand'

export type NoticeKind = 'success' | 'error' | 'info' | 'loading'

interface Notice {
  id: string
  kind: NoticeKind
  message: string
}

interface NotificationState {
  notices: Notice[]
  push: (kind: NoticeKind, message: string) => string
  dismiss: (id: string) => void
  clear: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notices: [],
  push: (kind, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    set((s) => ({ notices: [...s.notices, { id, kind, message }] }))
    return id
  },
  dismiss: (id) => set((s) => ({ notices: s.notices.filter((n) => n.id !== id) })),
  clear: () => set({ notices: [] }),
}))
