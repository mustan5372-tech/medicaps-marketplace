import { useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

/**
 * Returns a ref and a motionValue `y` that shifts the element
 * at `speed` fraction of its scroll progress.
 * speed = 0.15 → subtle; speed = 0.4 → noticeable
 */
export function useParallax(speed = 0.15, outputRange = [-40, 40]) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], outputRange.map(v => v * speed / 0.15))
  return { ref, y }
}
