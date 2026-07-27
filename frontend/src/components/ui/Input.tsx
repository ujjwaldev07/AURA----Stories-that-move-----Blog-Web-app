import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  floating?: boolean
  success?: boolean
  rightSlot?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      type = 'text',
      id,
      floating = false,
      success = false,
      rightSlot,
      value,
      defaultValue,
      placeholder,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [show, setShow] = useState(false)
    const [focused, setFocused] = useState(false)
    const [internalValue, setInternalValue] = useState(
      typeof defaultValue === 'string' ? defaultValue : typeof value === 'string' ? value : '',
    )
    const reactId = useId()
    const isPassword = type === 'password'
    const inputId = id || props.name || reactId
    const currentValue = typeof value === 'string' ? value : internalValue
    const hasValue = currentValue.length > 0
    const floated = floating && (focused || hasValue)

    return (
      <label className="relative flex w-full flex-col gap-1.5" htmlFor={inputId}>
        {label && !floating ? (
          <span className="text-sm font-medium text-ink/90">{label}</span>
        ) : null}

        <div className="relative">
          {label && floating ? (
            <motion.span
              className={cn(
                'pointer-events-none absolute left-4 z-10 origin-left text-muted transition-colors',
                floated ? 'text-accent' : 'text-muted',
              )}
              animate={{
                y: floated ? 8 : 18,
                scale: floated ? 0.78 : 1,
              }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            >
              {label}
            </motion.span>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            type={isPassword && show ? 'text' : type}
            value={value}
            defaultValue={defaultValue}
            placeholder={floating ? ' ' : placeholder}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              'h-12 w-full rounded-2xl border bg-surface/80 text-ink outline-none backdrop-blur-sm transition-all',
              'placeholder:text-muted/60',
              'focus:border-accent focus:shadow-[0_0_0_4px_var(--accent-soft)]',
              error
                ? 'border-danger focus:shadow-[0_0_0_4px_rgb(229_72_77_/_0.15)]'
                : success
                  ? 'border-success'
                  : 'border-border',
              floating ? 'px-4 pt-4 pb-1' : 'px-4',
              (isPassword || rightSlot || success) && 'pr-12',
              className,
            )}
            {...props}
            onFocus={(e) => {
              setFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              onBlur?.(e)
            }}
            onChange={(e) => {
              setInternalValue(e.target.value)
              onChange?.(e)
            }}
          />

          <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
            {success && !error ? (
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-success"
                aria-hidden
              >
                <Check className="h-4 w-4" />
              </motion.span>
            ) : null}
            {rightSlot}
            {isPassword ? (
              <button
                type="button"
                className="rounded-lg p-1 text-muted hover:text-ink"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            ) : null}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {error ? (
            <motion.span
              id={`${inputId}-error`}
              key={error}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              className="text-xs text-danger"
              role="alert"
            >
              {error}
            </motion.span>
          ) : hint ? (
            <span className="text-xs text-muted">{hint}</span>
          ) : null}
        </AnimatePresence>
      </label>
    )
  },
)

Input.displayName = 'Input'
