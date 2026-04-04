import { motion } from 'framer-motion'
import { listingCardVariant } from '../utils/animations'
import { Link } from 'react-router-dom'
import { FiHeart, FiMapPin, FiClock, FiEye, FiMoreVertical, FiTrash2, FiFlag } from 'react-icons/fi'
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
  const [adminMenu, setAdminMenu] = useState(false)
  const isAdmin = user?.role === 'admin'

  const adminDelete = async (e) => {
    e.preventDefault()
    if (!confirm('Delete this listing?')) return
    await api.delete(`/admin/listings/${listing._id}`)
    toast.success('Deleted')
    window.location.reload()
  }

  const adminFlag = async (e) => {
    e.preventDefault()
    await api.patch(`/admin/listings/${listing._id}/flag`, { reason: 'Flagged by admin' })
    toast.success('Flagged')
    setAdminMenu(false)
  }

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
        variants={listingCardVariant}
        whileHover={{ scale: 1.03, y: -4, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)' }}
        className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors duration-300 cursor-pointer"
      >
        <Link to={`/listing/${listing._id}`} onClick={handleClick}>
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
            {!imgLoaded && <div className="absolute inset-0 skeleton" />}
            <motion.img
              src={listing.images?.[0] || `https://placehold.co/400x300/e2e8f0/94a3b8?text=${encodeURIComponent(listing.category || 'Item')}`}
              alt={listing.title}
              onLoad={() => setImgLoaded(true)}
              onError={e => { e.target.src = `https://placehold.co/400x300/e2e8f0/94a3b8?text=${encodeURIComponent(listing.category || 'Item')}`; setImgLoaded(true) }}
              className={`w-full h-full object-cover transition-transform duration-[300ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Watermark */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <img src="/logo.png" alt="" className="w-3.5 h-3.5 object-contain" />
            <span className="text-white text-[10px] font-medium">MediCaps</span>
          </div>

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
            {listing.isBoosted && new Date(listing.boostExpiresAt) > new Date() && (
              <span className="absolute top-3 left-3 mt-7 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-yellow-400/90 text-yellow-900 backdrop-blur-sm">
                ⚡ Boosted
              </span>
            )}
            {listing.tags?.includes('urgent') && (
              <span className="absolute bottom-10 left-3 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-red-500/90 text-white backdrop-blur-sm">
                🔥 Urgent
              </span>
            )}
            {listing.tags?.includes('best-deal') && (
              <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-green-500/90 text-white backdrop-blur-sm">
                💰 Best Deal
              </span>
            )}

            {/* Admin controls */}
            {isAdmin && (
              <div className="absolute bottom-3 left-3" onClick={e => e.preventDefault()}>
                <button onClick={e => { e.preventDefault(); setAdminMenu(!adminMenu) }}
                  className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition">
                  <FiMoreVertical className="w-3.5 h-3.5" />
                </button>
                {adminMenu && (
                  <div className="absolute bottom-8 left-0 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden w-36 z-20">
                    <button onClick={adminDelete} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                      <FiTrash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                    <button onClick={adminFlag} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition">
                      <FiFlag className="w-3.5 h-3.5" /> Flag as Fake
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Flagged badge */}
            {listing.isFlagged && (
              <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center pointer-events-none">
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">⚠ FLAGGED</span>
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm mb-1">
              {listing.title}
            </h3>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              ₹{listing.price?.toLocaleString()}
              {listing.negotiable && <span className="ml-2 text-xs font-medium text-green-600 dark:text-green-400">· negotiable</span>}
            </p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                  {listing.seller?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[70px]">{listing.seller?.name?.split(' ')[0]}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <FiClock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</span>
              </div>
              {listing.views > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-gray-400">
                  <FiEye className="w-3 h-3" />{listing.views}
                </span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>

      {quickView && <QuickViewModal listing={listing} onClose={() => setQuickView(false)} />}
    </>
  )
}
