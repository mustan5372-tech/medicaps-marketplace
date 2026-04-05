import { useRef, useCallback } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

export function useMagnet({ strength = 0.25 } = {}) {
  const ref = useRef(null)
  const rafId = useRef(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 300, damping: 24, mass: 0.4 })
  const y = useSpring(rawY, { stiffness: 300, damping: 24, mass: 0.4 })

  const onMouseMove = useCallback((e) => {
    cancelAnimationFrame(rafId.current)
    rafId.current = requestAnimationFrame(() => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      rawX.set((e.clientX - (rect.left + rect.width / 2)) * strength)
      rawY.set((e.clientY - (rect.top + rect.height / 2)) * strength)
    })
  }, [rawX, rawY, strength])

  const onMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafId.current)
    rawX.set(0)
    rawY.set(0)
  }, [rawX, rawY])

  return { ref, x, y, handlers: { onMouseMove, onMouseLeave } }
}
