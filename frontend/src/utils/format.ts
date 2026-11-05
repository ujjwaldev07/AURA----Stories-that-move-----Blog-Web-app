import { formatDistanceToNowStrict, parseISO } from 'date-fns'
import type { User } from '@/types'
import { env } from '@/config/env'

export function emailToUsername(email: string): string {
  const local = email.split('@')[0] || 'creator'
  return local.replace(/[^a-zA-Z0-9._]/g, '').toLowerCase() || 'creator'
}

export function getDisplayName(user?: User | string | null): string {
  if (!user) return 'Anonymous'
  if (typeof user === 'string') return emailToUsername(user)
  return user.username || emailToUsername(user.email)
}

export function getUserId(user?: User | string | null): string {
  if (!user) return ''
  if (typeof user === 'string') return user
  return user._id
}

export function getAvatarUrl(user?: User | string | null, seed?: string): string {
  if (user && typeof user !== 'string' && user.avatar) {
    return resolveImageUrl(user.avatar)
  }
  const name =
    typeof user === 'string'
      ? user
      : user?.email || seed || 'aura'
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(name)}&backgroundType=gradientLinear`
}

export function resolveImageUrl(path?: string | null): string {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path
  }
  const clean = path.startsWith('/images/') ? path : path.startsWith('/') ? path : `/images/${path}`
  // Strip trailing slash from base URL to avoid double-slash (e.g. "//images/...")
  const base = env.apiBaseUrl.replace(/\/+$/, '')
  return `${base}${clean}`
}

export function formatRelativeTime(date?: string): string {
  if (!date) return ''
  try {
    return formatDistanceToNowStrict(parseISO(date), { addSuffix: true })
  } catch {
    return ''
  }
}

export function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trim()}…`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatCount(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`
  return `${(n / 1_000_000).toFixed(1)}M`
}

export function getInitials(name: string): string {
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}
