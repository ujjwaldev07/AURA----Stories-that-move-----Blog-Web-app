export interface User {
  _id: string
  email: string
  password?: string
  username?: string
  bio?: string
  avatar?: string
  coverImage?: string
  createdAt?: string
  updatedAt?: string
}

export interface AuthUser {
  id: string
  email: string
  username: string
  avatar?: string
  bio?: string
  coverImage?: string
}

export interface Post {
  _id: string
  title: string
  slug?: string
  content: string
  excerpt?: string
  coverImage?: string
  author: string | User
  category?: string
  tags?: string[]
  status?: 'draft' | 'published'
  likes?: string[]
  views?: number
  commentsCount?: number
  readingTime?: number
  createdAt: string
  updatedAt?: string
}

export interface Comment {
  _id: string
  content: string
  author: string | User
  post: string
  parentId?: string | null
  createdAt: string
  updatedAt?: string
}

export interface PaginatedMeta {
  page: number
  hasMore: boolean
}

export interface ApiError {
  message?: string
  error?: string
  status?: number
}

export type ThemeMode = 'light' | 'dark'

export interface SearchResult {
  posts: Post[]
  users: User[]
}
