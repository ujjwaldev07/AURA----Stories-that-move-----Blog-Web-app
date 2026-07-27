import { memo, useState } from 'react'
import { cn } from '@/lib/cn'
import { getInitials } from '@/utils/format'

interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  ring?: boolean
}

const sizes = {
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-14 w-14 text-sm',
  xl: 'h-24 w-24 text-xl',
}

export const Avatar = memo(function Avatar({
  src,
  alt,
  name = 'User',
  size = 'md',
  className,
  ring,
}: AvatarProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 font-semibold text-ink',
        sizes[size],
        ring && 'ring-2 ring-accent/40 ring-offset-2 ring-offset-bg',
        className,
      )}
      aria-hidden={!alt}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={alt || name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  )
})
