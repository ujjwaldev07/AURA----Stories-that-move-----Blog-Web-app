import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'

export function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="animate-pulse-glow absolute -top-24 -left-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,var(--mesh-1),transparent_70%)] blur-2xl" />
      <div className="animate-float absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,var(--mesh-2),transparent_70%)] blur-2xl" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[radial-gradient(circle,var(--mesh-3),transparent_70%)] blur-3xl opacity-70" />
    </div>
  )
}

export function MouseParallax({ children, strength = 20 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(useTransform(mx, [-0.5, 0.5], [-strength, strength]), {
    stiffness: 100,
    damping: 20,
  })
  const y = useSpring(useTransform(my, [-0.5, 0.5], [-strength, strength]), {
    stiffness: 100,
    damping: 20,
  })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      mx.set((e.clientX - rect.left) / rect.width - 0.5)
      my.set((e.clientY - rect.top) / rect.height - 0.5)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [mx, my])

  return (
    <motion.div ref={ref} style={{ x, y }}>
      {children}
    </motion.div>
  )
}
