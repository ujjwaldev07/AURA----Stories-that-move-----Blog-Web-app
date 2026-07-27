import api from '@/lib/axios'
import { API_ENDPOINTS } from '@/config/api'

export const bookmarkService = {
  async list() {
    const { data } = await api.get<{ bookmarks: string[] }>(API_ENDPOINTS.bookmarks.list)
    return data.bookmarks ?? []
  },
  async toggle(postId: string) {
    const { data } = await api.post<{ bookmarked: boolean }>(API_ENDPOINTS.bookmarks.toggle(postId))
    return data.bookmarked
  },
}
