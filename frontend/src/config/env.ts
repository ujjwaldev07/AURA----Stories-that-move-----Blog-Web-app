function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL
  if (fromEnv && fromEnv.trim().length > 0 && fromEnv !== '/') return fromEnv

  const defaultOrigin = typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:8000'

  return defaultOrigin
}

export const env = {
  apiBaseUrl: getApiBaseUrl(),
  googleClientId: (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || '',
  appName: (import.meta.env.VITE_APP_NAME as string) || 'Aura',
  tagline: (import.meta.env.VITE_APP_TAGLINE as string) || 'Stories that move',
  isDev: import.meta.env.DEV,
} as const
