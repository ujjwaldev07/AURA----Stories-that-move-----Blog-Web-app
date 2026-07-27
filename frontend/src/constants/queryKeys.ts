export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  posts: {
    all: ['posts'] as const,
    list: (search?: string) => ['posts', 'list', search ?? ''] as const,
    detail: (id: string) => ['posts', 'detail', id] as const,
    byUser: (userId: string) => ['posts', 'user', userId] as const,
  },
  comments: {
    byPost: (postId: string) => ['comments', 'post', postId] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  bookmarks: ['bookmarks'] as const,
  search: {
    query: (q: string) => ['search', q] as const,
  },
} as const
