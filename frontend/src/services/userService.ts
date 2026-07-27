import api from '@/lib/axios'
import { API_ENDPOINTS } from '@/config/api'
import type { User } from '@/types'

export const userService = {
  async getById(id: string) {
    const { data } = await api.get<{ user: User }>(API_ENDPOINTS.users.byId(id))
    if (!data.user) throw { message: 'User not found', status: 404 }
    return data.user
  },

  async update(id: string, payload: Partial<User>) {
    const { data } = await api.put<{ response: User }>(
      API_ENDPOINTS.users.update(id),
      payload,
    )
    return data.response
  },

  async remove(id: string) {
    await api.delete(API_ENDPOINTS.users.delete(id))
  },

  async search(query: string) {
    const { data } = await api.get<{ users: User[] }>(API_ENDPOINTS.users.list, {
      params: { search: query },
    })
    return data.users ?? []
  },
}
