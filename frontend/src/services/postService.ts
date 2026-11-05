import api from '@/lib/axios'
import { API_ENDPOINTS } from '@/config/api'
import type { Post } from '@/types'
import { estimateReadingTime, slugify } from '@/utils/format'

export interface CreatePostPayload {
  title: string
  content: string
  excerpt?: string
  coverImage?: string
  category?: string
  tags?: string[]
  status?: 'draft' | 'published'
}

export interface UpdatePostPayload extends Partial<CreatePostPayload> {
  likes?: string[]
  views?: number
  commentsCount?: number
  readingTime?: number
  slug?: string
}

export interface PaginatedResult {
  posts: Post[]
  meta: { page: number; limit: number; total: number; hasMore: boolean }
}

export const postService = {
  async getPosts(search?: string, page = 1, limit = 20) {
    const params: Record<string, string | number> = { page, limit }
    if (search) params.search = search
    const { data } = await api.get<{ posts: Post[]; meta: { page: number; limit: number; total: number; hasMore: boolean } }>(
      API_ENDPOINTS.posts.list,
      { params },
    )
    return { posts: data.posts ?? [], meta: data.meta ?? { page, limit, total: 0, hasMore: false } }
  },

  async getPost(id: string) {
    const { data } = await api.get<{ post: Post }>(API_ENDPOINTS.posts.byId(id))
    return data.post
  },

  async getUserPosts(userId: string) {
    try {
      const { data } = await api.get<{ posts: Post[] }>(API_ENDPOINTS.posts.byUser(userId))
      return data.posts ?? []
    } catch {
      // Fallback: filter client-side if backend user route fails
      const response = await this.getPosts()
      return response.posts.filter((p) => {
        const authorId = typeof p.author === 'string' ? p.author : p.author?._id
        return authorId === userId
      })
    }
  },

  async createPost(payload: CreatePostPayload) {
    const { ...postPayload } = payload
    const body = {
      ...postPayload,
      slug: slugify(postPayload.title) + '-' + Date.now().toString(36),
      excerpt: postPayload.excerpt || postPayload.content.slice(0, 160),
      readingTime: estimateReadingTime(postPayload.content),
      status: postPayload.status || 'published',
    }
    const { data } = await api.post<{ savedPost: Post }>(API_ENDPOINTS.posts.create, body)
    return data.savedPost
  },

  async updatePost(id: string, payload: UpdatePostPayload) {
    const { data } = await api.put<{ response: Post }>(API_ENDPOINTS.posts.update(id), payload)
    return data.response
  },

  async deletePost(id: string) {
    await api.delete(API_ENDPOINTS.posts.delete(id))
  },

  async toggleLike(post: Post, _userId: string) {
    const { data } = await api.post<{ post: Post }>(API_ENDPOINTS.posts.like(post._id))
    return data.post
  },
}
