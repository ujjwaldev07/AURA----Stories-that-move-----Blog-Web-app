import { useState } from 'react'
import { FeedList } from '@/components/feed/FeedList'
import { useDebounce } from '@/hooks/useDebounce'
import { Search } from 'lucide-react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query)

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-5 font-display text-3xl font-bold">Search</h1>
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find stories by title…"
          className="glass h-12 w-full rounded-2xl border border-border pr-4 pl-10 outline-none focus:border-accent"
          aria-label="Search posts"
        />
      </div>
      <FeedList search={debounced || undefined} />
    </div>
  )
}
