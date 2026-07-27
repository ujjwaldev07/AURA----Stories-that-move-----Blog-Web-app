import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/cn'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'
  > {
  variant?: Variant
  size?: Size
  loading?: boolean
  loadingText?: string
  magnetic?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-accent to-[color-mix(in_oklab,var(--accent)_70%,var(--warm))] text-white shadow-[0_10px_30px_rgb(15_159_138_/_0.28)] hover:brightness-110',
  secondary:
    'bg-surface-2 text-ink hover:bg-[color-mix(in_oklab,var(--surface-2)_80%,var(--accent))]',
  ghost: 'bg-transparent text-ink hover:bg-surface-2',
  danger: 'bg-danger/15 text-danger hover:bg-danger/25',
  outline: 'border border-border bg-transparent text-ink hover:bg-surface-2',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-xl gap-1.5',
  md: 'h-11 px-4 text-sm rounded-2xl gap-2',
  lg: 'h-12 px-6 text-base rounded-2xl gap-2',
  icon: 'h-10 w-10 rounded-2xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps & HTMLMotionProps<'button'>>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading,
      loadingText = 'Loading...',
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={loading || disabled ? undefined : { scale: 0.97 }}
        whileHover={loading || disabled ? undefined : { y: -1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors disabled:pointer-events-none disabled:opacity-55',
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            <span>{loadingText}</span>
          </>
        ) : (
          children
        )}
      </motion.button>
    )
  },
)

Button.displayName = 'Button'
