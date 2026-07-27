import type { Variants, Transition } from 'framer-motion'

export const easeOutExpo: Transition = {
  duration: 0.55,
  ease: [0.16, 1, 0.3, 1],
}

export const springSoft: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 28,
}

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 480,
  damping: 32,
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: easeOutExpo },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: easeOutExpo },
  exit: { opacity: 0, y: 12, transition: { duration: 0.2 } },
}

export const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: easeOutExpo },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.18 } },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: easeOutExpo },
  exit: { opacity: 0, x: 16 },
}

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: 'blur(10px)' },
  visible: { opacity: 1, filter: 'blur(0px)', transition: easeOutExpo },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
}

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: 'blur(4px)',
    transition: { duration: 0.22 },
  },
}

export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.01, transition: springSoft },
  tap: { scale: 0.985, transition: springSnappy },
}
