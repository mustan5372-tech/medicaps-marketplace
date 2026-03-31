import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiHeart, FiMapPin, FiClock } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ListingCard({ listing }) {
  const { user } = useAuthStore()
  const [saved, setSaved] = useState(listing.savedBy?.includes(user?._id))
  const [imgLoaded, setImgLoaded] = useState(false)

  const toggleSave = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Login to save listings'); return }
    try {
      await api.post(`/listings/${listing._id}/save`)
      setSaved(!saved)
      toast.success(saved ? 'Removed from saved' : 'Saved!')
    } catch { toast.error('Failed to save') }
  }

  const conditionColor = {
    'New': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    'Like New': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    'Used': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 group cursor-pointer transition-shadow hover:shadow-xl hover:shadow-black/8 dark:hover:shadow-black/30"
    >
      <Link to={`/listing/${listing._id}`}>
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
          {!imgLoaded && <div className="absolute inset-0 skeleton" />}
          <motion.img
            src={listing.images?.[0] || `https://placehold.co/400x300/e2e8f0/94a3b8?text=${encodeURIComponent(listing.category || 'Item')}`}
            alt={listing.title}
            onLoad={() => setImgLoaded(true)}
            onError={e => { e.target.src = 'https://placehold.co/400x300/e2e8f0/94a3b8?text=No+Image'; setImgLoaded(true) }}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
          {/* Save button */}
          <motion.button
            onClick={toggleSave}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-md"
          >
            <FiHeart className={`w-4 h-4 transition-colors ${saved ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </motion.button>
          {/* Condition badge */}
          <span className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm ${conditionColor[listing.condition] || 'bg-gray-100 text-gray-600'}`}>
            {listing.condition}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">₹{listing.price?.toLocaleString()}</p>
          <h3 className="font-semibold text-gray-900 dark:text-white mt-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {listing.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">{listing.description}</p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <FiMapPin className="w-3 h-3" />
              <span>{listing.location}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <FiClock className="w-3 h-3" />
              <span>{formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
          <span className="inline-block mt-2 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full">
            {listing.category}
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
