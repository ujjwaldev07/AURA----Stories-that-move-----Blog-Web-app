import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'
import { formatCount } from '@/utils/format'

interface AnimatedCounterProps {
  value: number
  className?: string
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { stiffness: 80, damping: 20 })
  const display = useTransform(spring, (v) => formatCount(Math.round(v)))

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.6 })
    return controls.stop
  }, [motionValue, value])

  return <motion.span className={className}>{display}</motion.span>
}
