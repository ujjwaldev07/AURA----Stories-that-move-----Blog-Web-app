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
    /** Internal guard: retry a request at most once after refreshing CSRF. */
    _csrfRetried?: boolean
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
let csrfInitialization: Promise<string> | null = null

/**
 * Establish the double-submit CSRF pair once for every set of callers. The
 * token is kept from the API response because a Vercel SPA cannot read a
 * host-only cookie owned by a Render API domain.
 */
export async function initializeCsrf(force = false): Promise<string> {
  if (!force && csrfToken) return csrfToken
  if (csrfInitialization) return csrfInitialization

  csrfInitialization = api
    .get<{ csrfToken?: string }>('/api/auth/csrf', { skipAuthRefresh: true })
    .then(({ data }) => {
      if (!data.csrfToken) throw new Error('Unable to initialize secure session.')
      csrfToken = data.csrfToken
      return csrfToken
    })
    .finally(() => {
      csrfInitialization = null
    })

  return csrfInitialization
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Let the browser set multipart boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  if (!['get', 'head', 'options'].includes(config.method?.toLowerCase() || 'get')) {
    const token = csrfToken || await initializeCsrf()
    config.headers.set('x-csrf-token', token)
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; error?: string; code?: string }>) => {
    const request = error.config
    const isCsrfFailure = error.response?.status === 403 &&
      error.response.data?.message === 'Invalid CSRF token. Refresh the page and try again.'

    // A CSRF rejection occurs before the route handler, so one replay is safe.
    // It repairs an expired cookie after a long-lived SPA tab.
    if (request && isCsrfFailure && !request._csrfRetried) {
      request._csrfRetried = true
      await initializeCsrf(true)
      return api.request(request)
    }

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
