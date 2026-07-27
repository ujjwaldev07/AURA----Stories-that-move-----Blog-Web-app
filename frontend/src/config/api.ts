/**
 * API endpoint map + integration notes.
 *
 * Auth (updated):
 * - POST /api/auth/register → 201 { user, token, message }
 * - POST /api/auth/login → 200 { user, token, message }
 * - POST|GET /api/auth/logout → clears httpOnly cookie
 * - GET /api/auth/refetch → restores session from Bearer or cookie
 * - JWT payload: { id, email } — never includes password
 * - CORS allowlist: CLIENT_ORIGINS (default http://localhost:5174) + credentials: true
 */

export const API_ENDPOINTS = {
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    google: '/api/auth/google',
    csrf: '/api/auth/csrf',
    logout: '/api/auth/logout',
    refetch: '/api/auth/refetch',
    me: '/api/auth/me',
    listUsers: '/api/auth/',
  },
  users: {
    list: '/api/users',
    byId: (id: string) => `/api/users/${id}`,
    update: (id: string) => `/api/users/${id}`,
    delete: (id: string) => `/api/users/${id}`,
  },
  posts: {
    list: '/api/posts',
    create: '/api/posts/create',
    byId: (id: string) => `/api/posts/${id}`,
    update: (id: string) => `/api/posts/${id}`,
    delete: (id: string) => `/api/posts/${id}`,
    like: (id: string) => `/api/posts/${id}/like`,
    byUser: (id: string) => `/api/posts/user/${id}`,
  },
  comments: {
    create: '/api/comments/create',
    byPost: (postId: string) => `/api/comments/post/${postId}`,
    update: (id: string) => `/api/comments/${id}`,
    delete: (id: string) => `/api/comments/${id}`,
  },
  upload: '/api/upload',
  bookmarks: {
    list: '/api/bookmarks',
    toggle: (postId: string) => `/api/bookmarks/${postId}`,
  },
  health: '/api/health',
} as const

export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Aura',
  tagline: import.meta.env.VITE_APP_TAGLINE || 'Stories that move',
  captionMaxLength: 2200,
  titleMaxLength: 200,
  excerptMaxLength: 300,
  commentMaxLength: 1000,
  debounceMs: 320,
  feedPageSize: 10,
  imageMaxSizeMB: 2,
  imageMaxDimension: 1600,
} as const
