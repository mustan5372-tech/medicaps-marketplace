import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useListingStore } from '../store/listingStore'
import { useAuthStore } from '../store/authStore'
import ListingCard from '../components/ListingCard'
import SkeletonCard from '../components/SkeletonCard'
import FilterSidebar from '../components/FilterSidebar'
import AnimatedPage from '../components/AnimatedPage'
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
        <div className="relative mb-10 overflow-hidden rounded-3xl">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 animate-gradient" />
          {/* Glow orbs */}
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-300/20 rounded-full blur-2xl" />

          <div className="relative z-10 p-10 md:p-16 text-center">
            <motion.div variants={staggerContainer(0.1)} initial="hidden" animate="show">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-5 border border-white/30">
                <FiTrendingUp className="w-3.5 h-3.5" /> MediCaps University Marketplace
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
                Buy & Sell<br />
                <span className="text-blue-200">Within Campus</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-blue-100 text-lg max-w-lg mx-auto mb-3">
                The trusted marketplace for MediCaps students.
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
                  <Link to="/create-listing" onClick={() => trackEvent('post_listing_click', { source: 'hero' })}>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-7 py-3 bg-white text-blue-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                      <FiPlus className="w-4 h-4" /> Post a Listing
                    </motion.button>
                  </Link>
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
            </motion.div>
          </div>
        </div>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FiClock className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recently Viewed</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recentlyViewed.map(l => <ListingCard key={l._id} listing={l} />)}
            </div>
          </div>
        )}

        {/* Category pills */}
        <motion.div variants={staggerContainer(0.05, 0.1)} initial="hidden" animate="show"
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-8">
          {CATEGORIES.map(({ label, icon: Icon }) => (
            <motion.button key={label} variants={fadeUp}
              whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.94 }}
              onClick={() => { setFilters({ category: label === 'All' ? '' : label }); fetchListings() }}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                (label === 'All' && !filters.category) || filters.category === label
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:text-blue-600 hover:shadow-md'
              }`}>
              {Icon && <Icon className="w-3.5 h-3.5" />} {label}
            </motion.button>
          ))}
        </motion.div>

        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 shrink-0">
            <FilterSidebar />
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {loading ? 'Loading...' : `${total} listing${total !== 1 ? 's' : ''}`}
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
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-5">
                          <span className="text-5xl">🛍️</span>
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-2">No listings yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Be the first to sell something 🚀</p>
                        {user ? (
                          <Link to="/create-listing">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25">
                              <FiPlus className="w-4 h-4" /> Post First Listing
                            </motion.button>
                          </Link>
                        ) : (
                          <Link to="/register">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25">
                              Join & Sell Now
                            </motion.button>
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )
                  : listings.map(l => (
                    <motion.div key={l._id} variants={fadeUp}>
                      <ListingCard listing={l} />
                    </motion.div>
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
    </AnimatedPage>
  )
}
