import { useRef, useCallback } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

/**
 * Magnetic button effect — element subtly follows cursor on hover.
 * Usage:
 *   const { ref, x, y, handlers } = useMagnet({ strength: 0.3 })
 *   <motion.button ref={ref} style={{ x, y }} {...handlers}>
 */
export function useMagnet({ strength = 0.25 } = {}) {
  const ref = useRef(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 300, damping: 22, mass: 0.5 })
  const y = useSpring(rawY, { stiffness: 300, damping: 22, mass: 0.5 })

  const onMouseMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    rawX.set((e.clientX - cx) * strength)
    rawY.set((e.clientY - cy) * strength)
  }, [rawX, rawY, strength])

  const onMouseLeave = useCallback(() => {
    rawX.set(0)
    rawY.set(0)
  }, [rawX, rawY])

  return { ref, x, y, handlers: { onMouseMove, onMouseLeave } }
}
