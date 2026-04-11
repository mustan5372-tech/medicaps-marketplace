import { useRef } from 'react'
import { useMotionValue } from 'framer-motion'

// Parallax removed for performance — returns static no-op values
export function useParallax() {
  const ref = useRef(null)
  const y = useMotionValue(0)
  return { ref, y }
}
