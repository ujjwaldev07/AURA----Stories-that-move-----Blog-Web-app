import { useEffect, useState } from 'react'
import { APP_CONFIG } from '@/config/api'

export function useDebounce<T>(value: T, delay = APP_CONFIG.debounceMs): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
