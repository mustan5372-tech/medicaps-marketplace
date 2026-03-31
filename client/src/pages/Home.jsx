import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useListingStore } from '../store/listingStore'
import ListingCard from '../components/ListingCard'
import SkeletonCard from '../components/SkeletonCard'
import FilterSidebar from '../components/FilterSidebar'
import AnimatedPage from '../components/AnimatedPage'
import ScrollReveal from '../components/ScrollReveal'
import { staggerContainer, fadeUp } from '../utils/animations'
import { FiFilter, FiTrendingUp, FiBook, FiMonitor, FiHome, FiTruck } from 'react-icons/fi'

const CATEGORIES = [
  { label: 'All', icon: null },
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
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => { fetchListings() }, [filters, page])

  const totalPages = Math.ceil(total / 12)

  return (
    <AnimatedPage>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Hero */}
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          animate="show"
          className="mb-10 text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-4">
            <FiTrendingUp className="w-3.5 h-3.5" />
            Campus Marketplace
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            Buy & Sell at{' '}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              MediCaps
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-500 dark:text-gray-400 mt-3 text-lg max-w-xl mx-auto">
            The trusted marketplace for MediCaps University students
          </motion.p>
        </motion.div>

        {/* Category pills */}
        <motion.div
          variants={staggerContainer(0.05, 0.2)}
          initial="hidden"
          animate="show"
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-8"
        >
          {CATEGORIES.map(({ label, icon: Icon }) => (
            <motion.button
              key={label}
              variants={fadeUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setFilters({ category: label === 'All' ? '' : label }); fetchListings() }}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                (label === 'All' && !filters.category) || filters.category === label
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {label}
            </motion.button>
          ))}
        </motion.div>

        <div className="flex gap-6">
          {/* Sidebar desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <ScrollReveal direction="left">
              <FilterSidebar />
            </ScrollReveal>
          </aside>

          {/* Main */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-500 dark:text-gray-400"
              >
                {loading ? 'Loading...' : `${total} listing${total !== 1 ? 's' : ''} found`}
              </motion.p>
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:border-blue-400 transition"
              >
                <FiFilter className="w-4 h-4" /> Filters
              </button>
            </div>

            {showFilter && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden mb-4 overflow-hidden"
              >
                <FilterSidebar onClose={() => setShowFilter(false)} />
              </motion.div>
            )}

            {/* Grid */}
            <motion.div
              variants={staggerContainer(0.07)}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
            >
              {loading
                ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
                : listings.length === 0
                  ? (
                    <motion.div variants={fadeUp} className="col-span-full text-center py-24 text-gray-400">
                      <div className="text-5xl mb-4">🔍</div>
                      <p className="font-medium">No listings found</p>
                      <p className="text-sm mt-1">Try adjusting your filters</p>
                    </motion.div>
                  )
                  : listings.map(l => (
                    <motion.div key={l._id} variants={fadeUp}>
                      <ListingCard listing={l} />
                    </motion.div>
                  ))
              }
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <ScrollReveal className="flex justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <motion.button
                    key={p}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition ${
                      page === p
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400'
                    }`}
                  >
                    {p}
                  </motion.button>
                ))}
              </ScrollReveal>
            )}
          </div>
        </div>
      </div>
    </AnimatedPage>
  )
}
