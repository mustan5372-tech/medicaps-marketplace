import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiHeart, FiMapPin, FiClock, FiEye } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import { useState } from 'react'
import toast from 'react-hot-toast'
import QuickViewModal from './QuickViewModal'

const CONDITION_STYLES = {
  'New': 'bg-emerald-500/90 text-white',
  'Like New': 'bg-blue-500/90 text-white',
  'Used': 'bg-orange-500/90 text-white',
}

export default function ListingCard({ listing }) {
  const { user } = useAuthStore()
  const [saved, setSaved] = useState(listing.savedBy?.includes(user?._id))
  const [imgLoaded, setImgLoaded] = useState(false)
  const [quickView, setQuickView] = useState(false)

  const toggleSave = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Login to save listings'); return }
    try {
      await api.post(`/listings/${listing._id}/save`)
      setSaved(!saved)
    } catch { toast.error('Failed') }
  }

  // Track recently viewed
  const handleClick = () => {
    try {
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
      const filtered = viewed.filter(id => id !== listing._id)
      localStorage.setItem('recentlyViewed', JSON.stringify([listing._id, ...filtered].slice(0, 10)))
    } catch {}
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.2 }}
        className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/40 transition-all duration-300 cursor-pointer"
      >
        <Link to={`/listing/${listing._id}`} onClick={handleClick}>
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
            {!imgLoaded && <div className="absolute inset-0 skeleton" />}
            <motion.img
              src={listing.images?.[0] || `https://placehold.co/400x300/e2e8f0/94a3b8?text=${encodeURIComponent(listing.category || 'Item')}`}
              alt={listing.title}
              onLoad={() => setImgLoaded(true)}
              onError={e => { e.target.src = `https://placehold.co/400x300/e2e8f0/94a3b8?text=${encodeURIComponent(listing.category || 'Item')}`; setImgLoaded(true) }}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Action buttons */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <motion.button onClick={toggleSave} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
                className="p-2 rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg">
                <FiHeart className={`w-4 h-4 ${saved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </motion.button>
              <motion.button
                onClick={e => { e.preventDefault(); setQuickView(true) }}
                whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
                className="p-2 rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg">
                <FiEye className="w-4 h-4 text-gray-600" />
              </motion.button>
            </div>

            <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm ${CONDITION_STYLES[listing.condition] || 'bg-gray-500/90 text-white'}`}>
              {listing.condition}
            </span>
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm mb-1">
              {listing.title}
            </h3>
            <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ₹{listing.price?.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{listing.description}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <FiMapPin className="w-3 h-3" /><span className="truncate max-w-[80px]">{listing.location}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <FiClock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {quickView && <QuickViewModal listing={listing} onClose={() => setQuickView(false)} />}
    </>
  )
}
