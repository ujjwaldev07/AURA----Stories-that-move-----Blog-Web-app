import type { AxiosError } from 'axios'

export interface ApiClientError {
  message: string
  status?: number
  code?: string
  isNetworkError: boolean
  isTimeout: boolean
  original?: unknown
}

function friendlyFromStatus(status?: number, serverMessage?: string): string {
  if (serverMessage && !/internal server/i.test(serverMessage)) {
    return serverMessage
  }

  switch (status) {
    case 400:
      return 'Please check your input and try again.'
    case 401:
      return 'Email or password is incorrect.'
    case 403:
      return 'You do not have permission to do that.'
    case 404:
      return 'We could not find what you were looking for.'
    case 409:
      return 'Email already exists.'
    case 429:
      return 'Too many attempts. Please wait a moment and try again.'
    case 500:
    case 502:
    case 503:
      return 'Server error. Please try again in a moment.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

export function mapApiError(error: AxiosError<{ message?: string; error?: string; code?: string }>): ApiClientError {
  const status = error.response?.status
  const serverMessage = error.response?.data?.message || error.response?.data?.error
  const code = error.response?.data?.code || error.code

  const isTimeout =
    error.code === 'ECONNABORTED' ||
    error.message?.toLowerCase().includes('timeout') === true

  const isNetworkError =
    !error.response &&
    (error.message === 'Network Error' ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNREFUSED')

  if (isTimeout) {
    return {
      message: 'Request timed out. Please try again.',
      status,
      code: 'TIMEOUT',
      isNetworkError: false,
      isTimeout: true,
      original: error,
    }
  }

  if (isNetworkError) {
    return {
      message: 'Cannot connect to server. Please make sure the backend is running.',
      status,
      code: 'NETWORK',
      isNetworkError: true,
      isTimeout: false,
      original: error,
    }
  }

  if (code === 'TOKEN_EXPIRED') {
    return {
      message: 'Session expired. Please sign in again.',
      status: 401,
      code: 'TOKEN_EXPIRED',
      isNetworkError: false,
      isTimeout: false,
      original: error,
    }
  }

  return {
    message: friendlyFromStatus(status, serverMessage),
    status,
    code: typeof code === 'string' ? code : undefined,
    isNetworkError: false,
    isTimeout: false,
    original: error,
  }
}

export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (!err) return fallback
  if (typeof err === 'string') return err
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const msg = (err as { message?: unknown }).message
    if (typeof msg === 'string' && msg.trim()) return msg
  }
  return fallback
}
