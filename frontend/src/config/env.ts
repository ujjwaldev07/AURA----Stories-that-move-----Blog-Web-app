export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string) || '/',
  googleClientId: (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || '',
  appName: (import.meta.env.VITE_APP_NAME as string) || 'Aura',
  tagline: (import.meta.env.VITE_APP_TAGLINE as string) || 'Stories that move',
  isDev: import.meta.env.DEV,
} as const
