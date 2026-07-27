import { memo, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { REMEMBER_EMAIL_KEY } from '@/constants/storage'
import { fadeScale } from '@/animations/variants'
import { getErrorMessage } from '@/utils/errors'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'

const schema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

function LoginPage() {
  const { login, loginWithGoogle } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, touchedFields, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { email: '', password: '', remember: true },
  })

  const email = watch('email')
  const password = watch('password')

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_EMAIL_KEY)
    if (saved) setValue('email', saved, { shouldValidate: true })
  }, [setValue])

  const onSubmit = handleSubmit(async (values) => {
    if (submitting) return
    setSubmitting(true)
    try {
      if (values.remember) localStorage.setItem(REMEMBER_EMAIL_KEY, values.email)
      else localStorage.removeItem(REMEMBER_EMAIL_KEY)
      await login({ email: values.email.trim(), password: values.password })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to sign in'))
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <motion.div variants={fadeScale} initial="hidden" animate="visible">
      <GlassCard className="border border-white/10 p-6 shadow-[var(--shadow-lift)] md:p-8">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted">Sign in to continue your stories.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            floating
            success={!!email && !errors.email && !!touchedFields.email}
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            floating
            success={!!password && !errors.password && !!touchedFields.password}
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="inline-flex cursor-pointer items-center gap-2 text-muted">
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-[var(--accent)]"
                {...register('remember')}
              />
              Remember me
            </label>
            <Link to={ROUTES.forgotPassword} className="text-accent hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={submitting}
            loadingText="Signing in..."
            disabled={!isValid && (touchedFields.email || touchedFields.password)}
          >
            Sign in
          </Button>
        </form>
        <GoogleSignInButton onCredential={(credential) => loginWithGoogle({ credential })} />

        <AnimatePresence>
          {!submitting ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-5 text-center text-sm text-muted"
            >
              New here?{' '}
              <Link to={ROUTES.register} className="font-medium text-accent hover:underline">
                Create an account
              </Link>
            </motion.p>
          ) : null}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  )
}

export default memo(LoginPage)
