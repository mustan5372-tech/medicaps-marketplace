import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useListingStore } from '../store/listingStore'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { FiMapPin, FiClock, FiMessageSquare, FiHeart, FiFlag, FiEdit, FiTrash2, FiChevronLeft, FiChevronRight, FiCheckCircle } from 'react-icons/fi'
import api from '../utils/api'
import AnimatedPage from '../components/AnimatedPage'
import { analytics } from '../utils/analytics'

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { listing, loading, fetchListing, deleteListing, reportListing } = useListingStore()
  const { user } = useAuthStore()
  const { startConversation } = useChatStore()
  const [imgIdx, setImgIdx] = useState(0)
  const [saved, setSaved] = useState(false)
  const [reportModal, setReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')

  useEffect(() => { fetchListing(id) }, [id])
  useEffect(() => {
    if (listing) {
      setSaved(listing.savedBy?.includes(user?._id))
      analytics.viewListing(listing._id, listing.title, listing.price)
    }
  }, [listing])

  const handleContact = async () => {
    if (!user) { toast.error('Login to contact seller'); return }
    analytics.startChat(listing._id, listing.seller._id)
    await startConversation(listing.seller._id, listing._id)
    navigate(`/chat/${listing.seller._id}?listing=${listing._id}`)
  }

  const handleSave = async () => {
    if (!user) { toast.error('Login to save'); return }
    await api.post(`/listings/${id}/save`)
    setSaved(!saved)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this listing?')) return
    await deleteListing(id)
    toast.success('Listing deleted')
    navigate('/')
  }

  const handleReport = async () => {
    await reportListing(id, reportReason)
    toast.success('Reported successfully')
    setReportModal(false)
  }

  if (loading || !listing) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square skeleton rounded-2xl" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-6 skeleton rounded-lg" />)}
        </div>
      </div>
    </div>
  )

  const images = listing.images?.length
    ? listing.images
    : [`https://placehold.co/600x400/e2e8f0/94a3b8?text=${encodeURIComponent(listing.category || 'Item')}`]
  const isOwner = user?._id === listing.seller?._id

  return (
    <AnimatedPage className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img src={images[imgIdx]} alt={listing.title} className="w-full h-full object-cover"
              onError={e => { e.target.src = 'https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image' }} />
            {/* Watermark */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1.5 rounded-xl">
              <img src="/logo.png" alt="" className="w-4 h-4 object-contain mix-blend-screen" />
              <span className="text-white text-xs font-semibold">MediCaps Market</span>
            </div>
            {images.length > 1 && (
              <>
                <button onClick={() => setImgIdx((imgIdx - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-900/80 rounded-full shadow">
                  <FiChevronLeft />
                </button>
                <button onClick={() => setImgIdx((imgIdx + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-900/80 rounded-full shadow">
                  <FiChevronRight />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${i === imgIdx ? 'border-blue-500' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{listing.title}</h1>
            <div className="flex gap-2 items-center">
              {listing.status === 'sold' && (
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-bold">SOLD</span>
              )}
              <button onClick={handleSave} className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-400 transition">
                <FiHeart className={`w-5 h-5 ${saved ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
              </button>
              {!isOwner && (
                <button onClick={() => setReportModal(true)} className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-400 transition">
                  <FiFlag className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">₹{listing.price?.toLocaleString()}</p>

          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">{listing.category}</span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">{listing.condition}</span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{listing.description}</p>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><FiMapPin className="w-4 h-4" />{listing.location}</span>
            <span className="flex items-center gap-1"><FiClock className="w-4 h-4" />{formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</span>
          </div>

          {/* Seller */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold overflow-hidden">
              {listing.seller?.avatar
                ? <img src={listing.seller.avatar} alt="" className="w-full h-full object-cover" />
                : listing.seller?.name?.[0]?.toUpperCase()
              }
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{listing.seller?.name}</p>
              <Link to={`/profile/${listing.seller?._id}`} className="text-xs text-blue-600 hover:underline">View profile</Link>
            </div>
          </div>

          {isOwner ? (
            <div className="flex gap-3 flex-wrap">
              {listing.status !== 'sold' && (
                <motion.button whileTap={{ scale: 0.97 }} onClick={async () => {
                  if (!confirm('Mark this item as sold?')) return
                  await api.patch(`/listings/${listing._id}/mark-sold`)
                  toast.success('Marked as sold!')
                  fetchListing(listing._id)
                }} className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition">
                  <FiCheckCircle className="w-4 h-4" /> Mark as Sold
                </motion.button>
              )}
              <Link to={`/edit-listing/${listing._id}`} className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition">
                <FiEdit className="w-4 h-4" /> Edit
              </Link>
              <button onClick={handleDelete} className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 rounded-xl font-medium transition">
                <FiTrash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          ) : listing.status === 'sold' ? (
            <div className="w-full flex items-center justify-center gap-2 py-3 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl font-semibold">
              <FiCheckCircle className="w-5 h-5" /> This item has been sold
            </div>
          ) : (
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleContact}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition">
              <FiMessageSquare className="w-5 h-5" /> Chat with Seller
            </motion.button>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {reportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Report Listing</h3>
            <select value={reportReason} onChange={e => setReportReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white mb-4 focus:outline-none">
              <option value="">Select reason</option>
              <option value="spam">Spam</option>
              <option value="fake">Fake listing</option>
              <option value="inappropriate">Inappropriate content</option>
              <option value="wrong_price">Wrong price</option>
            </select>
            <div className="flex gap-3">
              <button onClick={() => setReportModal(false)} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">Cancel</button>
              <button onClick={handleReport} disabled={!reportReason} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50">Report</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatedPage>
  )
}
