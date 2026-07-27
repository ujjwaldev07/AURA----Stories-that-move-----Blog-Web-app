import { useRef, type MouseEvent, type RefObject } from 'react'
import { useMotionValue, useSpring, type MotionValue } from 'framer-motion'

export function useMagnetic(strength = 0.35) {
  const ref = useRef<HTMLElement | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 280, damping: 20 })
  const springY = useSpring(y, { stiffness: 280, damping: 20 })

  const handlers = {
    onMouseMove: (e: MouseEvent) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const dx = e.clientX - (rect.left + rect.width / 2)
      const dy = e.clientY - (rect.top + rect.height / 2)
      x.set(dx * strength)
      y.set(dy * strength)
    },
    onMouseLeave: () => {
      x.set(0)
      y.set(0)
    },
  }

  return {
    ref: ref as RefObject<HTMLElement | null>,
    style: { x: springX as MotionValue<number>, y: springY as MotionValue<number> },
    handlers,
  }
}
