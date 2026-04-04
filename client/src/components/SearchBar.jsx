import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiClock, FiTrendingUp, FiX } from 'react-icons/fi'
import { useListingStore } from '../store/listingStore'

const TRENDING = ['Engineering Books', 'Laptop', 'Cycle', 'Calculator', 'Hostel essentials']

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recentSearches') || '[]') } catch { return [] }
  })
  const { setFilters, fetchListings } = useListingStore()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (!wrapperRef.current?.contains(e.target)) setFocused(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (term) => {
    const q = term || query
    if (!q.trim()) return
    const updated = [q, ...recent.filter(r => r !== q)].slice(0, 5)
    setRecent(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
    setFilters({ search: q })
    fetchListings()
    setFocused(false)
    navigate('/')
  }

  const clearRecent = (e, item) => {
    e.stopPropagation()
    const updated = recent.filter(r => r !== item)
    setRecent(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const showDropdown = focused && (recent.length > 0 || TRENDING.length > 0)

  return (
    <div ref={wrapperRef} className="flex-1 max-w-xl relative">
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        animate={{
          y: focused ? -2 : hovered ? -1 : 0,
          scale: focused ? 1.02 : 1,
        }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{
          boxShadow: focused
            ? '0 0 0 2px rgba(99,102,241,0.5), 0 12px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)'
            : hovered
              ? '0 10px 36px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.12)'
              : '0 6px 24px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.08)',
          background: focused
            ? 'rgba(255,255,255,0.13)'
            : hovered
              ? 'rgba(255,255,255,0.10)'
              : 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: focused
            ? '1px solid rgba(99,102,241,0.45)'
            : hovered
              ? '1px solid rgba(255,255,255,0.22)'
              : '1px solid rgba(255,255,255,0.12)',
          borderRadius: '9999px',
        }}
        className="relative"
      >
        {/* Top highlight line */}
        <span
          aria-hidden
          className="absolute top-0 left-6 right-6 h-px rounded-full pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }}
        />

        <FiSearch
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 z-10 transition-colors duration-200"
          style={{ color: focused ? 'rgba(129,140,248,0.9)' : 'rgba(255,255,255,0.45)' }}
        />

        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search books, gadgets, cycles..."
          className="w-full pl-10 pr-4 py-2.5 bg-transparent outline-none text-sm text-white placeholder-white/40 rounded-full"
        />
      </motion.div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 right-0 mt-3 rounded-2xl overflow-hidden z-50"
            style={{
              background: 'rgba(15,15,30,0.85)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {recent.length > 0 && (
              <div className="p-3">
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-2 mb-2">Recent</p>
                {recent.map(item => (
                  <button key={item} onClick={() => { setQuery(item); handleSearch(item) }}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl hover:bg-white/8 transition group">
                    <div className="flex items-center gap-2.5 text-sm text-white/70">
                      <FiClock className="w-3.5 h-3.5 text-white/30 shrink-0" /> {item}
                    </div>
                    <button onClick={e => clearRecent(e, item)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-lg transition">
                      <FiX className="w-3 h-3 text-white/40" />
                    </button>
                  </button>
                ))}
              </div>
            )}
            <div className="p-3 border-t border-white/6">
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-2 mb-2">Trending</p>
              {TRENDING.filter(t => !query || t.toLowerCase().includes(query.toLowerCase())).map(item => (
                <button key={item} onClick={() => { setQuery(item); handleSearch(item) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/8 transition text-sm text-white/70">
                  <FiTrendingUp className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
