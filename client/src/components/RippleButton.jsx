import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Drop-in replacement for <button> that adds a click ripple effect.
 * All standard button props are forwarded.
 */
export default function RippleButton({ children, className = '', onClick, ...props }) {
  const [ripples, setRipples] = useState([])
  const ref = useRef(null)

  const handleClick = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()
    setRipples(r => [...r, { x, y, id }])
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 600)
    onClick?.(e)
  }

  return (
    <button ref={ref} className={`relative overflow-hidden ${className}`} onClick={handleClick} {...props}>
      {children}
      <AnimatePresence>
        {ripples.map(rp => (
          <motion.span
            key={rp.id}
            className="absolute rounded-full pointer-events-none"
            style={{ left: rp.x - 40, top: rp.y - 40, width: 80, height: 80,
              background: 'rgba(255,255,255,0.25)' }}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </AnimatePresence>
    </button>
  )
}
