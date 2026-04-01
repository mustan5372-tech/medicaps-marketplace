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
import { FiFilter, FiPlus, FiTrendingUp, FiBook, FiMonitor, FiHome, FiTruck, FiShoppingBag } from 'react-icons/fi'

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
  const totalPages = Math.ceil(total / 12)

  useEffect(() => { fetchListings() }, [filters, page])

  return (
    <AnimatedPage>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Hero */}
        <div className="relative mb-10 text-center overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 animate-gradient p-10 md:p-14">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
          <motion.div variants={staggerContainer(0.1)} initial="hidden" animate="show" className="relative z-10">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-4 border border-white/30">
              <FiTrendingUp className="w-3.5 h-3.5" /> MediCaps University Marketplace
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-3">
              Buy & Sell Within Campus
            </motion.h1>
            <motion.p variants={fadeUp} className="text-blue-100 text-base max-w-md mx-auto mb-6">
              Books, electronics, cycles and more — trusted by MediCaps students.
            </motion.p>
            {!user && (
              <motion.div variants={fadeUp} className="flex items-center justify-center gap-3">
                <Link to="/register" className="px-6 py-2.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition shadow-lg">Get Started</Link>
                <Link to="/login" className="px-6 py-2.5 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition border border-white/30">Login</Link>
              </motion.div>
            )}
            {user && (
              <motion.div variants={fadeUp}>
                <Link to="/create-listing" className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition shadow-lg">
                  <FiPlus className="w-4 h-4" /> Post a Listing
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Category pills */}
        <motion.div variants={staggerContainer(0.05, 0.1)} initial="hidden" animate="show"
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-8">
          {CATEGORIES.map(({ label, icon: Icon }) => (
            <motion.button key={label} variants={fadeUp} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { setFilters({ category: label === 'All' ? '' : label }); fetchListings() }}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                (label === 'All' && !filters.category) || filters.category === label
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:text-blue-600'
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
                    <motion.div variants={fadeUp} className="col-span-full text-center py-24">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔍</span>
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">No listings found</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Try adjusting your filters</p>
                      <button onClick={() => { setFilters({ category: '', condition: '', minPrice: '', maxPrice: '', search: '' }); fetchListings() }}
                        className="btn-primary text-sm">Clear Filters</button>
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
