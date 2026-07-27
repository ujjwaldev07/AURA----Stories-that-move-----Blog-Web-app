import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { env } from '@/config/env'
import { mapApiError, type ApiClientError } from '@/utils/errors'

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Skip global 401 session clearing (login/register/refetch) */
    skipAuthRefresh?: boolean
  }
}

export const api = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30_000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

let csrfToken: string | null = null

function getCookie(name: string) {
  const encoded = `${encodeURIComponent(name)}=`
  return document.cookie.split('; ').find((entry) => entry.startsWith(encoded))?.slice(encoded.length)
}

/** Called after GET /api/auth/csrf. Keeps CSRF usable across production subdomains. */
export function setCsrfToken(token: string) {
  csrfToken = token
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Let the browser set multipart boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  if (!['get', 'head', 'options'].includes(config.method?.toLowerCase() || 'get')) {
    const token = csrfToken || getCookie('csrf_token')
    if (token) config.headers.set('x-csrf-token', decodeURIComponent(token))
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string; code?: string }>) => {
    const mapped = mapApiError(error)
    const status = mapped.status
    const url = error.config?.url || ''
    const skip =
      error.config?.skipAuthRefresh ||
      url.includes('/api/auth/login') ||
      url.includes('/api/auth/register') ||
      url.includes('/api/auth/refetch')

    if ((status === 401 || mapped.code === 'TOKEN_EXPIRED') && !skip) {
      window.dispatchEvent(
        new CustomEvent('aura:unauthorized', {
          detail: { code: mapped.code, message: mapped.message },
        }),
      )
    }

    return Promise.reject(mapped satisfies ApiClientError)
  },
)

/** Typed helper wrappers — prefer these over importing axios elsewhere */
export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    api.get<T>(url, config).then((r) => r.data),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.post<T>(url, data, config).then((r) => r.data),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.put<T>(url, data, config).then((r) => r.data),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.patch<T>(url, data, config).then((r) => r.data),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    api.delete<T>(url, config).then((r) => r.data),
}

export default api
