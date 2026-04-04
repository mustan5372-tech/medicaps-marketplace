import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useListingStore } from '../store/listingStore'
import { useAuthStore } from '../store/authStore'
import ListingCard from '../components/ListingCard'
import SkeletonCard from '../components/SkeletonCard'
import FilterSidebar from '../components/FilterSidebar'
import AnimatedPage from '../components/AnimatedPage'
import DeveloperSection from '../components/DeveloperSection'
import ScrollReveal from '../components/ScrollReveal'
import WordReveal from '../components/WordReveal'
import HeroCTA from '../components/HeroCTA'
import HeroListingPreview from '../components/HeroListingPreview'
import { staggerContainer, fadeUp } from '../utils/animations'
import { trackEvent } from '../utils/analytics'
import { FiFilter, FiPlus, FiTrendingUp, FiBook, FiMonitor, FiHome, FiTruck, FiShoppingBag, FiUsers, FiZap, FiClock } from 'react-icons/fi'
import api from '../utils/api'

const CATEGORIES = [
  { label: 'All', icon: FiShoppingBag },
  { label: 'Books', icon: FiBook },
  { label: 'Electronics', icon: FiMonitor },
  { label: 'Furniture', icon: FiHome },
  { label: 'Vehicles', icon: FiTruck },
  { label: 'Clothing', icon: null },
  { label: 'Sports', icon: null },
  { label: 'Others', icon: null },
]

export default function Home() {
  const { listings, loading, total, page, filters, fetchListings, setFilters, setPage } = useListingStore()
  const { user } = useAuthStore()
  const [showFilter, setShowFilter] = useState(false)
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const totalPages = Math.ceil(total / 12)

  // Parallax for hero orbs
  const heroRef = useRef(null)
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const orb1Y = useTransform(heroScroll, [0, 1], [0, -60])
  const orb2Y = useTransform(heroScroll, [0, 1], [0, -40])
  const heroContentY = useTransform(heroScroll, [0, 1], [0, 30])

  useEffect(() => { fetchListings() }, [filters, page])

  useEffect(() => {
    // Load recently viewed listings
    try {
      const ids = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
      if (ids.length > 0) {
        Promise.all(ids.slice(0, 4).map(id => api.get(`/listings/${id}`).then(r => r.data.listing).catch(() => null)))
          .then(results => setRecentlyViewed(results.filter(Boolean)))
      }
    } catch {}
  }, [])

  return (
    <AnimatedPage>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Hero */}
        <div ref={heroRef} className="relative mb-10 overflow-hidden rounded-3xl">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700" />
          {/* Parallax orbs */}
          <motion.div style={{ y: orb1Y }} className="absolute -top-20 -left-20 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl pointer-events-none" />
          <motion.div style={{ y: orb2Y }} className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-300/20 rounded-full blur-2xl pointer-events-none" />

          <motion.div style={{ y: heroContentY }} className="relative z-10 p-10 md:p-16 text-center">
            <motion.div variants={staggerContainer(0.1)} initial="hidden" animate="show">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-5 border border-white/30">
                <FiTrendingUp className="w-3.5 h-3.5" /> MediCaps University Marketplace
              </motion.div>

              <WordReveal
                text="Buy & Sell Within Campus"
                as="h1"
                delay={0.15}
                className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4 justify-center"
              />

              <motion.p variants={fadeUp} className="text-blue-100 text-lg max-w-lg mx-auto mb-3">
                The trusted marketplace for MediCaps students — buy, sell, and connect on campus.
              </motion.p>

              {/* Social proof */}
              <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 mb-8">
                <div className="flex -space-x-2">
                  {['A','B','C','D'].map((l, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">{l}</div>
                  ))}
                </div>
                <p className="text-white/80 text-sm"><span className="text-white font-semibold">100+</span> students already using this platform</p>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 flex-wrap">
                {user ? (
                  <HeroCTA to="/create-listing" onClick={() => trackEvent('post_listing_click', { source: 'hero' })} />
                ) : (
                  <>
                    <Link to="/register">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="px-7 py-3 bg-white text-blue-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                        Get Started Free
                      </motion.button>
                    </Link>
                    <Link to="/login">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="px-7 py-3 bg-white/20 text-white font-semibold rounded-2xl border border-white/30 hover:bg-white/30 transition-all backdrop-blur-sm">
                        Login
                      </motion.button>
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Stats */}
              <motion.div variants={fadeUp} className="flex items-center justify-center gap-8 mt-8 pt-8 border-t border-white/20">
                {[
                  { icon: FiUsers, label: 'Students', value: '100+' },
                  { icon: FiShoppingBag, label: 'Listings', value: `${total}+` },
                  { icon: FiZap, label: 'Fast & Secure', value: '100%' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-2xl font-extrabold text-white">{s.value}</p>
                    <p className="text-blue-200 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </motion.div>

              {/* Live listings preview */}
              <HeroListingPreview />
            </motion.div>
          </motion.div>
        </div>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <ScrollReveal className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FiClock className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recently Viewed</h2>
            </div>
            <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recentlyViewed.map(l => <ListingCard key={l._id} listing={l} />)}
            </motion.div>
          </ScrollReveal>
        )}

        <motion.div variants={staggerContainer(0.05, 0.1)} initial="hidden" animate="show"
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-8 relative">
          {CATEGORIES.map(({ label, icon: Icon }) => {
            const isActive = (label === 'All' && !filters.category) || filters.category === label;
            return (
              <motion.button key={label} variants={fadeUp}
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)" }} whileTap={{ scale: 0.95 }}
                onClick={() => { setFilters({ category: label === 'All' ? '' : label }); fetchListings() }}
                className={`relative shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 border ${
                  isActive
                    ? 'border-transparent text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:text-blue-600'
                }`}>
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-500/30"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {Icon && <Icon className="w-3.5 h-3.5" />} {label}
                </span>
              </motion.button>
            )
          })}
        </motion.div>

        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 shrink-0 space-y-4">
            <ScrollReveal direction="left">
              <FilterSidebar />
            </ScrollReveal>
            {/* Mini leaderboard teaser */}
            <ScrollReveal direction="left" delay={0.1}>
              <Link to="/leaderboard" className="block bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-800 p-4 hover:shadow-md transition group">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🏆</span>
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">Monthly Leaderboard</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">See who's selling the most this month</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mt-2 group-hover:underline">View rankings →</p>
              </Link>
            </ScrollReveal>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {loading ? 'Finding listings...' : total === 0 ? 'No results' : `${total} listing${total !== 1 ? 's' : ''} found`}
              </p>
              <button onClick={() => setShowFilter(!showFilter)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:border-blue-400 transition">
                <FiFilter className="w-4 h-4" /> Filters
              </button>
            </div>

            {showFilter && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="lg:hidden mb-4 overflow-hidden">
                <FilterSidebar onClose={() => setShowFilter(false)} />
              </motion.div>
            )}

            <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {loading
                ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
                : listings.length === 0
                  ? (
                    <motion.div variants={fadeUp} className="col-span-full">
                      <div className="text-center py-20 px-8 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="text-5xl mb-4">😴</div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-2">
                          {filters.category || filters.search ? 'Nothing matches that' : 'No listings yet'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                          {filters.category || filters.search
                            ? "Try changing filters or post your own item 🚀"
                            : "Be the first seller and grab all the attention 🔥"}
                        </p>
                        {user ? (
                          <Link to="/create-listing">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 transition">
                              <FiPlus className="w-4 h-4" /> Sell something now
                            </motion.button>
                          </Link>
                        ) : (
                          <Link to="/register">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 transition">
                              Join & be the first seller
                            </motion.button>
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )
                  : listings.map(l => (
                      <ListingCard key={l._id} listing={l} />
                  ))
              }
            </motion.div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <motion.button key={p} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition ${
                      page === p ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400'
                    }`}>{p}</motion.button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Developer Section */}
      <DeveloperSection />
    </AnimatedPage>
  )
}
