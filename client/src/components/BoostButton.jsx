import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiZap } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'

export default function BoostButton({ listing, onBoosted }) {
  const { user, checkAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const boostsLeft = Math.max(0, 5 - (user?.freeBoostUsed || 0))
  const alreadyBoosted = listing?.isBoosted && listing?.boostExpiresAt && new Date(listing.boostExpiresAt) > new Date()
  const noBoostsLeft = boostsLeft === 0

  const handleBoost = async () => {
    if (noBoostsLeft || alreadyBoosted) return
    setLoading(true)
    try {
      await api.post(`/listings/${listing._id}/boost`)
      await checkAuth() // refresh user to update freeBoostUsed
      toast.success('Listing boosted for 24 hours!')
      onBoosted?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Boost failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <motion.button
        whileHover={!noBoostsLeft && !alreadyBoosted ? { boxShadow: '0 0 18px rgba(234,179,8,0.5)' } : {}}
        whileTap={!noBoostsLeft && !alreadyBoosted ? { scale: 0.97 } : {}}
        onClick={handleBoost}
        disabled={loading || noBoostsLeft || alreadyBoosted}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition
          ${alreadyBoosted
            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 cursor-default'
            : noBoostsLeft
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-white shadow-lg shadow-yellow-500/20'
          }`}
      >
        <FiZap className={`w-4 h-4 ${alreadyBoosted ? '' : 'fill-current'}`} />
        {loading ? 'Boosting...' : alreadyBoosted ? 'Boosted (Active)' : noBoostsLeft ? 'No Free Boosts Left' : 'Boost Ad (Free)'}
      </motion.button>

      {!alreadyBoosted && (
        <p className={`text-xs text-center ${noBoostsLeft ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
          {noBoostsLeft ? 'Free boost limit reached (5/5 used)' : `Free Boosts Left: ${boostsLeft}/5`}
        </p>
      )}
    </div>
  )
}
