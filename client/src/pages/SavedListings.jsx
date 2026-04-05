import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import ListingCard from '../components/ListingCard'
import SkeletonCard from '../components/SkeletonCard'
import AnimatedPage from '../components/AnimatedPage'
import { staggerContainer } from '../utils/animations'
import { FiHeart } from 'react-icons/fi'

export default function SavedListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/listings/saved').then(res => {
      setListings(res.data.listings)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <AnimatedPage className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <FiHeart className="w-4 h-4 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Listings</h1>
        {!loading && listings.length > 0 && (
          <span className="text-sm text-gray-400 ml-1">{listings.length} items</span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : listings.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-24 px-8 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
          <div className="text-5xl mb-4">🤍</div>
          <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-2">Nothing saved yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
            Tap the heart on any listing to save it here for later.
          </p>
          <Link to="/">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition">
              Browse listings
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map(l => <ListingCard key={l._id} listing={l} />)}
        </motion.div>
      )}
    </AnimatedPage>
  )
}
