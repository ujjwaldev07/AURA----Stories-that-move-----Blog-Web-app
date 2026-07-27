import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { ROUTES } from '@/constants/routes'
import { fadeScale } from '@/animations/variants'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
})

type FormValues = z.infer<typeof schema>

/**
 * UI-only flow — backend has no forgot-password endpoint (see config/api.ts).
 */
export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    setLoading(false)
    setSent(true)
  })

  return (
    <motion.div variants={fadeScale} initial="hidden" animate="visible">
      <GlassCard className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="ok"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-6 text-center"
            >
              <CheckCircle2 className="mb-3 h-12 w-12 text-success" />
              <h1 className="font-display text-2xl font-bold">Check your inbox</h1>
              <p className="mt-2 text-sm text-muted">
                If an account exists for that email, reset instructions would be sent.
                (Demo UI — backend reset route not available yet.)
              </p>
              <Link to={ROUTES.login} className="mt-6">
                <Button>Back to login</Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="font-display text-2xl font-bold">Reset password</h1>
              <p className="mt-1 text-sm text-muted">
                Enter your email and we&apos;ll send a reset link.
              </p>
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <Input
                  label="Email"
                  type="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button type="submit" className="w-full" loading={loading}>
                  Send reset link
                </Button>
              </form>
              <p className="mt-5 text-center text-sm">
                <Link to={ROUTES.login} className="text-accent hover:underline">
                  Back to login
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  )
}
