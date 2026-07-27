import { Link } from 'react-router-dom'
import { Globe, Share2, Users } from 'lucide-react'
import { env } from '@/config/env'
import { ROUTES } from '@/constants/routes'

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-bold">{env.appName}</p>
          <p className="mt-2 max-w-sm text-sm text-muted">
            {env.tagline}. Crafted for creators who care about craft.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Product</p>
          <div className="flex flex-col gap-2 text-sm text-muted">
            <Link to={ROUTES.feed} className="hover:text-ink">
              Feed
            </Link>
            <Link to={ROUTES.explore} className="hover:text-ink">
              Explore
            </Link>
            <Link to={ROUTES.register} className="hover:text-ink">
              Get started
            </Link>
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Social</p>
          <div className="flex gap-3">
            {[
              { Icon: Globe, label: 'Website' },
              { Icon: Share2, label: 'Share' },
              { Icon: Users, label: 'Community' },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border hover:bg-surface-2"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {env.appName}. Built with intention.
      </div>
    </footer>
  )
}
