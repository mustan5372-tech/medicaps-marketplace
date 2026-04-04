import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { useListingStore } from '../store/listingStore'
import { FiSearch, FiSun, FiMoon, FiPlus, FiMessageSquare, FiHeart, FiUser, FiLogOut, FiShield, FiMenu, FiX, FiAward } from 'react-icons/fi'
import { RiMagicLine } from 'react-icons/ri'
import SearchBar from './SearchBar'
import NotificationBell from './NotificationBell'
import ActivityBar from './ActivityBar'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { dark, toggle, glass, toggleGlass } = useThemeStore()
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
      className={`sticky top-0 z-50 transition-all duration-300 ${glass ? 'glass-nav' : scrolled ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm' : 'bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800'}`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-1.5 shrink-0">
          <img src="/logo.png" alt="MediCaps Market" className="w-14 h-14 object-contain mix-blend-screen" />
          <span className="font-semibold text-gray-900 dark:text-white hidden sm:block text-xs">MediCaps<span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Market</span></span>
        </Link>

        <SearchBar />

        <div className="hidden md:flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggle} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition" title={dark ? 'Light mode' : 'Dark mode'}>
            {dark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleGlass}
            title={glass ? 'Default theme' : 'Liquid Glass theme'}
            className={`p-2 rounded-xl transition ${glass ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
            <RiMagicLine className="w-5 h-5" />
          </motion.button>

          {user ? (
            <>
              <Link to="/create-listing">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all">
                  <FiPlus className="w-4 h-4" /> Sell
                </motion.button>
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Link to="/chat" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition block"><FiMessageSquare className="w-5 h-5" /></Link></motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Link to="/leaderboard" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition block" title="Leaderboard"><FiAward className="w-5 h-5" /></Link></motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Link to="/saved" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition block"><FiHeart className="w-5 h-5" /></Link></motion.div>
              <NotificationBell />
              <div className="relative" ref={profileRef}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-xl" /> : user.name?.[0]?.toUpperCase()}
                  </div>
                </motion.button>
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
              <button onClick={toggleGlass} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition ${glass ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <RiMagicLine className="w-4 h-4" /> {glass ? 'Default Theme' : 'Liquid Glass'}
              </button>
              {user ? (
                <>
                  <Link to="/create-listing" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"><FiPlus className="w-4 h-4" /> Sell something</Link>
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
      <ActivityBar />
    </motion.nav>
  )
}
