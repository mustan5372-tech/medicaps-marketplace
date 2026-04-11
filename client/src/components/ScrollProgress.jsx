import { useEffect, useRef } from 'react'

export default function ScrollProgress() {
  const barRef = useRef(null)

  useEffect(() => {
    const update = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop || document.body.scrollTop
      const total = el.scrollHeight - el.clientHeight
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${total > 0 ? scrolled / total : 0})`
      }
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 right-0 h-[2px] z-[9999] origin-left pointer-events-none"
      style={{
        background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
        transform: 'scaleX(0)',
        willChange: 'transform',
      }}
    />
  )
}
