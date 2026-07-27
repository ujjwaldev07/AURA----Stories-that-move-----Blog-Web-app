import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { PasswordStrength } from '@/components/ui/PasswordStrength'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { fadeScale } from '@/animations/variants'
import { getErrorMessage } from '@/utils/errors'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'

const schema = z
  .object({
    email: z.string().trim().email('Enter a valid email'),
    password: z
      .string()
      .min(6, 'At least 6 characters')
      .regex(/[A-Za-z]/, 'Include at least one letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirm: z.string().min(6, 'Confirm your password'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

type FormValues = z.infer<typeof schema>

function RegisterPage() {
  const { register: signUp, loginWithGoogle } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { email: '', password: '', confirm: '' },
  })

  const email = watch('email')
  const password = watch('password')
  const confirm = watch('confirm')

  const onSubmit = handleSubmit(async (values) => {
    if (submitting) return
    setSubmitting(true)
    try {
      await signUp({ email: values.email.trim(), password: values.password })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to create account'))
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <motion.div variants={fadeScale} initial="hidden" animate="visible">
      <GlassCard className="border border-white/10 p-6 shadow-[var(--shadow-lift)] md:p-8">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight">Join Aura</h1>
          <p className="mt-1 text-sm text-muted">Create your space in under a minute.</p>
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

          <div className="space-y-2">
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              floating
              success={!!password && !errors.password && !!touchedFields.password}
              error={errors.password?.message}
              {...register('password')}
            />
            <PasswordStrength password={password || ''} />
          </div>

          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            floating
            success={
              !!confirm && !errors.confirm && password === confirm && !!touchedFields.confirm
            }
            error={errors.confirm?.message}
            {...register('confirm')}
          />

          <Button
            type="submit"
            className="w-full"
            loading={submitting}
            loadingText="Creating account..."
            disabled={!isValid}
          >
            Create account
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
              Already have an account?{' '}
              <Link to={ROUTES.login} className="font-medium text-accent hover:underline">
                Sign in
              </Link>
            </motion.p>
          ) : null}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  )
}

export default memo(RegisterPage)
