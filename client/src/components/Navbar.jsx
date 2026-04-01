import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { useListingStore } from '../store/listingStore'
import { FiSearch, FiSun, FiMoon, FiPlus, FiMessageSquare, FiHeart, FiUser, FiLogOut, FiShield, FiMenu, FiX } from 'react-icons/fi'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { dark, toggle } = useThemeStore()
  const { setFilters, fetchListings } = useListingStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const h = (e) => { if (!profileRef.current?.contains(e.target)) setProfileOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setFilters({ search })
    fetchListings()
    navigate('/')
  }

  const handleLogout = async () => { await logout(); navigate('/login') }

  return (
    <motion.nav initial={{ y: -64, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm' : 'bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800'}`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30">M</div>
          <span className="font-bold text-gray-900 dark:text-white hidden sm:block text-sm">MediCaps<span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Market</span></span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search books, electronics, cycles..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200" />
          </div>
        </form>

        <div className="hidden md:flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={toggle} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition">
            {dark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </motion.button>

          {user ? (
            <>
              <Link to="/create-listing">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all">
                  <FiPlus className="w-4 h-4" /> Sell
                </motion.button>
              </Link>
              <Link to="/chat" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition"><FiMessageSquare className="w-5 h-5" /></Link>
              <Link to="/saved" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition"><FiHeart className="w-5 h-5" /></Link>
              <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-xl" /> : user.name?.[0]?.toUpperCase()}
                  </div>
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <Link to={`/profile/${user._id}`} onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition"><FiUser className="w-4 h-4" /> My Profile</Link>
                      {user.role === 'admin' && <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition"><FiShield className="w-4 h-4" /> Admin Panel</Link>}
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition"><FiLogOut className="w-4 h-4" /> Logout</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">Login</Link>
              <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all">Sign Up</Link>
            </div>
          )}
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
          {menuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
            <div className="px-4 py-3 flex flex-col gap-1">
              <button onClick={toggle} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                {dark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />} {dark ? 'Light Mode' : 'Dark Mode'}
              </button>
              {user ? (
                <>
                  <Link to="/create-listing" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold"><FiPlus className="w-4 h-4" /> Sell Item</Link>
                  <Link to="/chat" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"><FiMessageSquare className="w-4 h-4" /> Messages</Link>
                  <Link to="/saved" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"><FiHeart className="w-4 h-4" /> Saved</Link>
                  <Link to={`/profile/${user._id}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"><FiUser className="w-4 h-4" /> Profile</Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"><FiLogOut className="w-4 h-4" /> Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Login</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-xl text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold">Sign Up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
