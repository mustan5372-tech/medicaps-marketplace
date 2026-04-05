import { useEffect, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const spring = useSpring(progress, { stiffness: 200, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    const update = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop || document.body.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? scrolled / total : 0)
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[9999] origin-left pointer-events-none"
      style={{
        scaleX: spring,
        background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
      }}
    />
  )
}
