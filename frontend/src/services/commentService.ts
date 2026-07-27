import api from '@/lib/axios'
import { API_ENDPOINTS } from '@/config/api'
import type { Comment } from '@/types'

export interface CreateCommentPayload {
  content: string
  post: string
  parentId?: string | null
}

export const commentService = {
  async getByPost(postId: string) {
    try {
      const { data } = await api.get<{ comments: Comment[] }>(
        API_ENDPOINTS.comments.byPost(postId),
      )
      return (data.comments || []).filter(
        (c) => c.post === postId || !c.post,
      )
    } catch {
      return []
    }
  },

  async create(payload: CreateCommentPayload) {
    const { data } = await api.post<{ savedComment: Comment }>(
      API_ENDPOINTS.comments.create,
      payload,
    )
    return data.savedComment
  },

  async update(id: string, content: string) {
    const { data } = await api.put<{ response: Comment }>(
      API_ENDPOINTS.comments.update(id),
      { content },
    )
    return data.response
  },

  async remove(id: string) {
    await api.delete(API_ENDPOINTS.comments.delete(id))
  },
}
