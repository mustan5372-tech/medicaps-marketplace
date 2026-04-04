import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiEye, FiMessageSquare } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import api from '../utils/api'

export default function HeroListingPreview() {
  const [listings, setListings] = useState([])

  useEffect(() => {
    api.get('/listings?limit=4&sort=latest').then(r => setListings(r.data.listings || [])).catch(() => {})
  }, [])

  if (listings.length === 0) return null

  const isRecent = (date) => Date.now() - new Date(date).getTime() < 6 * 60 * 60 * 1000

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3"
    >
      {listings.map((l, i) => (
        <Link key={l._id} to={`/listing/${l._id}`}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 + i * 0.07, duration: 0.4 }}
            whileHover={{ y: -3, scale: 1.02 }}
            className="group relative rounded-2xl overflow-hidden cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.22)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}
          >
            {/* Image */}
            <div className="aspect-[4/3] overflow-hidden bg-white/10">
              <img
                src={l.images?.[0] || `https://placehold.co/200x150/6366f1/fff?text=${encodeURIComponent(l.category)}`}
                alt={l.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* Just posted badge */}
            {isRecent(l.createdAt) && (
              <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500/90 text-white backdrop-blur-sm">
                🔥 Just posted
              </span>
            )}

            {/* Info */}
            <div className="p-2.5">
              <p className="text-white font-bold text-sm">₹{l.price?.toLocaleString()}</p>
              <p className="text-white/75 text-xs truncate mt-0.5">{l.title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                {l.views > 0 && (
                  <span className="flex items-center gap-0.5 text-white/50 text-[10px]">
                    <FiEye className="w-2.5 h-2.5" />{l.views}
                  </span>
                )}
                <span className="text-white/40 text-[10px]">
                  {formatDistanceToNow(new Date(l.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </motion.div>
        </Link>
      ))}
    </motion.div>
  )
}
