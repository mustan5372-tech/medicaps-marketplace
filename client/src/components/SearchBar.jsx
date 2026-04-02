import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiClock, FiTrendingUp, FiX } from 'react-icons/fi'
import { useListingStore } from '../store/listingStore'

const TRENDING = ['Engineering Books', 'Laptop', 'Cycle', 'Calculator', 'Hostel Items']

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
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
        animate={{ scale: focused ? 1.02 : 1, boxShadow: focused ? '0 0 0 3px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.2)' : 'none' }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-xl"
      >
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search books, electronics, cycles..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 border border-transparent focus:border-blue-500 focus:outline-none transition-all duration-200"
        />
      </motion.div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {recent.length > 0 && (
              <div className="p-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 mb-2">Recent</p>
                {recent.map(item => (
                  <button key={item} onClick={() => { setQuery(item); handleSearch(item) }}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition group">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <FiClock className="w-3.5 h-3.5 text-gray-400" /> {item}
                    </div>
                    <button onClick={e => clearRecent(e, item)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">
                      <FiX className="w-3 h-3 text-gray-400" />
                    </button>
                  </button>
                ))}
              </div>
            )}
            <div className="p-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 mb-2">Trending</p>
              {TRENDING.filter(t => !query || t.toLowerCase().includes(query.toLowerCase())).map(item => (
                <button key={item} onClick={() => { setQuery(item); handleSearch(item) }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm text-gray-700 dark:text-gray-300">
                  <FiTrendingUp className="w-3.5 h-3.5 text-blue-500" /> {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
