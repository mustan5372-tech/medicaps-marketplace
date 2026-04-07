import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const raw = useMotionValue(0)
  const scaleX = useSpring(raw, { stiffness: 300, damping: 40, restDelta: 0.001 })

  useEffect(() => {
    let rafId
    const update = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop || document.body.scrollTop
      const total = el.scrollHeight - el.clientHeight
      raw.set(total > 0 ? scrolled / total : 0)
    }
    const onScroll = () => { 
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(update) 
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { 
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId) 
    }
  }, [raw])

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[9999] origin-left pointer-events-none"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    />
  )
}

