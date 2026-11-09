function getApiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (import.meta.env.PROD && !configuredUrl) {
    throw new Error(
      'VITE_API_BASE_URL is missing. Configure your production backend URL.'
    );
  }

  return (
    configuredUrl ||
    'http://localhost:8000'
  ).replace(/\/+$/, '');
}

export const env = {
  apiBaseUrl: getApiBaseUrl(),
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  appName: import.meta.env.VITE_APP_NAME || 'Aura',
  tagline: import.meta.env.VITE_APP_TAGLINE || 'Stories that move',
  isDev: import.meta.env.DEV,
} as const;