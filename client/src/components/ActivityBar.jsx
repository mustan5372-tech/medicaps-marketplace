import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'

const FALLBACK = [
  { icon: '🔥', text: 'Active campus marketplace' },
  { icon: '💬', text: 'Students chatting right now' },
  { icon: '⚡', text: 'New listings added daily' },
]

export default function ActivityBar() {
  const [stats, setStats] = useState(null)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    api.get('/listings?limit=1').then(r => {
      setStats({ total: r.data.total })
    }).catch(() => {})
  }, [])

  const items = stats ? [
    { icon: '🔥', text: `${stats.total} listings on campus` },
    { icon: '💬', text: 'Students chatting right now' },
    { icon: '⚡', text: 'New items added daily' },
    { icon: '🎓', text: 'MediCaps students only' },
  ] : FALLBACK

  // Rotate through items on mobile
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), 3000)
    return () => clearInterval(t)
  }, [items.length])

  return (
    <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60 px-4 py-1.5">
      {/* Desktop: all items */}
      <div className="hidden sm:flex max-w-7xl mx-auto items-center justify-center gap-6">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <span>{item.icon}</span> {item.text}
          </span>
        ))}
      </div>
      {/* Mobile: rotating single item */}
      <div className="sm:hidden flex items-center justify-center h-5 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={idx}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium"
          >
            <span>{items[idx].icon}</span> {items[idx].text}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}
