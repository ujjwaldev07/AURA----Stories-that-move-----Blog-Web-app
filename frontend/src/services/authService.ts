import api, { initializeCsrf } from '@/lib/axios'
import { API_ENDPOINTS } from '@/config/api'
import type { AuthUser, User } from '@/types'
import { emailToUsername, getAvatarUrl } from '@/utils/format'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
}

export interface GoogleLoginPayload {
  credential: string
}

export interface LoginResult {
  user: AuthUser
}

interface AuthSuccessResponse {
  message?: string
  user?: User
  response?: User
  data?: { email?: string }
}

function mapAuthUser(user: Partial<User> & { email: string; _id?: string; id?: string }): AuthUser {
  const id = user._id || user.id || ''
  return {
    id,
    email: user.email,
    username: user.username || emailToUsername(user.email),
    avatar: user.avatar || getAvatarUrl(user.email),
    bio: user.bio,
    coverImage: user.coverImage,
  }
}

export const authService = {
  async initializeCsrf() {
    await initializeCsrf()
  },

  async register(payload: RegisterPayload) {
    const { data } = await api.post<AuthSuccessResponse>(
      API_ENDPOINTS.auth.register,
      payload,
      { skipAuthRefresh: true },
    )
    const raw = data.user || data.response
    if (!raw?.email) {
      throw { message: 'Unexpected server response. Please try again.', status: 500 }
    }
    return {
      user: mapAuthUser(raw),
    }
  },

  async login(payload: LoginPayload): Promise<LoginResult> {
    const { data } = await api.post<AuthSuccessResponse>(
      API_ENDPOINTS.auth.login,
      payload,
      { skipAuthRefresh: true },
    )
    if (data.user?.email) {
      return {
        user: mapAuthUser(data.user),
      }
    }
    throw { message: 'Unexpected server response. Please try again.', status: 500 }
  },

  async loginWithGoogle(payload: GoogleLoginPayload) {
    const { data } = await api.post<AuthSuccessResponse>(API_ENDPOINTS.auth.google, payload, {
      skipAuthRefresh: true,
    })
    if (!data.user?.email) {
      throw { message: 'Unexpected Google sign-in response.', status: 500 }
    }
    return { user: mapAuthUser(data.user) }
  },

  async logout() {
    await api.post(API_ENDPOINTS.auth.logout)
  },

  async refetch() {
    const { data } = await api.get<{
      user?: User
      userData?: { email: string; id?: string; password?: string }
      email?: string
      _id?: string
      id?: string
    }>(API_ENDPOINTS.auth.refetch, { skipAuthRefresh: true })

    if (data.user?.email) {
      return mapAuthUser(data.user)
    }

    throw { message: 'Unauthorized', status: 401 }
  },
}
