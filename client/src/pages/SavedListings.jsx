import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../utils/api'
import ListingCard from '../components/ListingCard'
import SkeletonCard from '../components/SkeletonCard'

export default function SavedListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/listings/saved').then(res => {
      setListings(res.data.listings)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Saved Listings</h1>
      {loading
        ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
        : listings.length === 0
          ? <div className="text-center py-20 text-gray-400">No saved listings yet</div>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{listings.map(l => <ListingCard key={l._id} listing={l} />)}</div>
      }
    </motion.div>
  )
}
