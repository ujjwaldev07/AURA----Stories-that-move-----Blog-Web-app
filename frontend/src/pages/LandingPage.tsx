import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Feather,
  Layers,
  Sparkles,
  Zap,
  Quote,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { FloatingOrbs, MouseParallax } from '@/components/common/VisualEffects'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { GlassCard } from '@/components/ui/GlassCard'
import { ScrollProgress } from '@/components/common/ScrollProgress'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { fadeUp, staggerContainer } from '@/animations/variants'
import { ROUTES } from '@/constants/routes'
import { env } from '@/config/env'
import { useRef } from 'react'

const features = [
  {
    icon: Sparkles,
    title: 'Alive interactions',
    desc: 'Micro-motion, optimistic UI, and glass surfaces that feel intentional — never noisy.',
  },
  {
    icon: Layers,
    title: 'Editorial feed',
    desc: 'Publish covers, captions, and conversations with Instagram-grade polish.',
  },
  {
    icon: Zap,
    title: 'Built for speed',
    desc: 'Route splitting, lazy images, caching, and skeletons keep every scroll buttery.',
  },
  {
    icon: Feather,
    title: 'Write beautifully',
    desc: 'Drag-and-drop uploads, compression, and realtime validation for a calm create flow.',
  },
]

const testimonials = [
  {
    quote: 'Looks like a funded startup product, not a campus CRUD demo.',
    name: 'Priya N.',
    role: 'Product Designer',
  },
  {
    quote: 'The motion language is restrained and premium — recruiters notice that.',
    name: 'Marcus L.',
    role: 'Frontend Engineer',
  },
  {
    quote: 'Dark mode, search, and infinite feed feel production-ready.',
    name: 'Aisha K.',
    role: 'Founder',
  },
]

export default function LandingPage() {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 120])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div className="mesh-bg min-h-screen">
      <ScrollProgress />
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <ThemeToggle />
      </div>
      <Navbar />

      <section ref={heroRef} className="relative overflow-hidden px-4 pt-16 pb-24 md:pt-24">
        <FloatingOrbs />
        <motion.div style={{ y, opacity }} className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 font-display text-sm font-semibold tracking-[0.2em] text-accent uppercase"
          >
            {env.appName}
          </motion.p>
          <MouseParallax strength={14}>
            <motion.h1
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-5xl leading-[1.05] font-extrabold tracking-tight md:text-7xl"
            >
              Stories that
              <span className="gradient-text"> move</span>
            </motion.h1>
          </MouseParallax>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-6 max-w-xl text-base text-muted md:text-lg"
          >
            A premium social writing platform — glass, motion, and craft inspired by Linear,
            Notion, and Instagram.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Link to={ROUTES.register}>
              <Button size="lg">Start creating</Button>
            </Link>
            <Link to={ROUTES.login}>
              <Button size="lg" variant="outline">
                Log in
              </Button>
            </Link>
          </motion.div>

          <MouseParallax strength={28}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="relative mx-auto mt-16 max-w-3xl"
            >
              <div className="glass relative overflow-hidden rounded-[2rem] p-3 shadow-[var(--shadow-lift)]">
                <div className="rounded-[1.5rem] bg-gradient-to-br from-surface-2 via-surface to-accent-soft p-6 md:p-10">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent/30" />
                    <div className="space-y-2">
                      <div className="h-3 w-28 rounded-full bg-ink/15" />
                      <div className="h-2 w-16 rounded-full bg-ink/10" />
                    </div>
                  </div>
                  <div className="aspect-[16/9] rounded-2xl bg-[linear-gradient(135deg,var(--mesh-1),var(--mesh-2),var(--mesh-3))] opacity-90" />
                  <div className="mt-5 flex gap-4">
                    <div className="h-8 w-16 rounded-xl bg-ink/10" />
                    <div className="h-8 w-16 rounded-xl bg-ink/10" />
                    <div className="h-8 w-16 rounded-xl bg-ink/10" />
                  </div>
                </div>
                <div className="animate-float absolute -top-4 -right-3 rounded-2xl bg-warm px-3 py-2 text-xs font-semibold text-white shadow-lg">
                  Live feed
                </div>
                <div className="animate-float absolute -bottom-3 -left-2 rounded-2xl bg-ink px-3 py-2 text-xs font-semibold text-accent shadow-lg [animation-delay:1s]">
                  Soft glass UI
                </div>
              </div>
            </motion.div>
          </MouseParallax>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-4 md:grid-cols-4"
        >
          {[
            { label: 'Creators', value: 12840 },
            { label: 'Stories', value: 94200 },
            { label: 'Comments', value: 410000 },
            { label: 'Avg. read', value: 4 },
          ].map((stat) => (
            <motion.div key={stat.label} variants={fadeUp} className="glass rounded-3xl p-6 text-center">
              <p className="font-display text-3xl font-bold">
                <AnimatedCounter value={stat.value} />
                {stat.label === 'Avg. read' ? 'm' : '+'}
              </p>
              <p className="mt-1 text-sm text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-10 max-w-xl">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Designed to feel alive</h2>
          <p className="mt-3 text-muted">
            One composition. Purposeful motion. Enterprise architecture under the hood.
          </p>
        </div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-4 md:grid-cols-2"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeUp}>
              <GlassCard hover className="h-full p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-8 font-display text-3xl font-bold">Loved by builders</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-3xl p-6"
            >
              <Quote className="mb-3 h-5 w-5 text-accent" />
              <p className="text-sm leading-relaxed">{t.quote}</p>
              <footer className="mt-4 text-sm">
                <span className="font-semibold">{t.name}</span>
                <span className="text-muted"> · {t.role}</span>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="glass mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink to-[color-mix(in_oklab,var(--ink)_80%,var(--accent))] p-8 text-white md:flex-row md:items-center md:p-12">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Ready to publish?</h2>
            <p className="mt-2 max-w-md text-white/70">
              Join Aura and ship a portfolio-grade social experience.
            </p>
          </div>
          <Link to={ROUTES.register}>
            <Button size="lg" className="bg-white text-ink hover:bg-white/90">
              Create account
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
