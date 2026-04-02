import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import AnimatedPage from '../components/AnimatedPage'
import { staggerContainer, fadeUp } from '../utils/animations'

const MEDALS = {
  0: { emoji: '🥇', color: 'from-yellow-400 to-amber-500', text: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', label: '1st' },
  1: { emoji: '🥈', color: 'from-gray-300 to-gray-400', text: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800/50', border: 'border-gray-200 dark:border-gray-700', label: '2nd' },
  2: { emoji: '🥉', color: 'from-orange-400 to-amber-600', text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', label: '3rd' },
}

export default function Leaderboard() {
  const [data, setData] = useState([])
  const [month, setMonth] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/leaderboard/monthly').then(res => {
      setData(res.data.leaderboard)
      setMonth(res.data.month)
    }).finally(() => setLoading(false))
  }, [])

  const top3 = data.slice(0, 3)
  const rest = data.slice(3)

  return (
    <AnimatedPage className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="show" className="text-center mb-10">
        <motion.div variants={fadeUp} className="text-5xl mb-3">🏆</motion.div>
        <motion.h1 variants={fadeUp} className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
          Monthly Leaderboard
        </motion.h1>
        <motion.p variants={fadeUp} className="text-gray-500 dark:text-gray-400 text-sm">
          Top sellers for <span className="font-semibold text-blue-600 dark:text-blue-400">{month}</span>
        </motion.p>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">No listings this month yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Be the first to post and claim the #1 spot!</p>
          <Link to="/create-listing" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25">
            Post a Listing
          </Link>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {top3.length > 0 && (
            <motion.div variants={staggerContainer(0.1)} initial="hidden" animate="show"
              className="grid grid-cols-1 gap-4 mb-6">
              {top3.map((entry, i) => {
                const medal = MEDALS[i]
                return (
                  <motion.div key={entry.userId} variants={fadeUp}
                    whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                    transition={{ duration: 0.2 }}
                    className={`relative flex items-center gap-4 p-5 rounded-2xl border ${medal.bg} ${medal.border} overflow-hidden`}>
                    {/* Rank glow */}
                    <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${medal.color} rounded-l-2xl`} />

                    {/* Rank */}
                    <div className="text-3xl shrink-0 ml-2">{medal.emoji}</div>

                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${medal.color} flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0 overflow-hidden`}>
                      {entry.avatar
                        ? <img src={entry.avatar} alt="" className="w-full h-full object-cover" />
                        : entry.name?.[0]?.toUpperCase()
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/profile/${entry.userId}`}
                        className="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition truncate block">
                        {entry.name}
                      </Link>
                      <p className={`text-sm font-medium ${medal.text}`}>{medal.label} Place</p>
                    </div>

                    {/* Count */}
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{entry.listingCount}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">listing{entry.listingCount !== 1 ? 's' : ''}</p>
                    </div>

                    {/* Crown for #1 */}
                    {i === 0 && (
                      <div className="absolute top-2 right-3 text-xl">👑</div>
                    )}
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* Rest of leaderboard */}
          {rest.length > 0 && (
            <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="show" className="space-y-2">
              {rest.map((entry, i) => (
                <motion.div key={entry.userId} variants={fadeUp}
                  whileHover={{ x: 4 }} transition={{ duration: 0.15 }}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <span className="w-8 text-center font-bold text-gray-400 dark:text-gray-500 text-sm shrink-0">
                    #{i + 4}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                    {entry.avatar
                      ? <img src={entry.avatar} alt="" className="w-full h-full object-cover" />
                      : entry.name?.[0]?.toUpperCase()
                    }
                  </div>
                  <Link to={`/profile/${entry.userId}`}
                    className="flex-1 font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition truncate">
                    {entry.name}
                  </Link>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-gray-900 dark:text-white">{entry.listingCount}</span>
                    <span className="text-xs text-gray-400 ml-1">listings</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-10 text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Want to climb the leaderboard? Post more listings! 🚀
            </p>
            <Link to="/create-listing">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 text-sm">
                Post a Listing
              </motion.button>
            </Link>
          </motion.div>
        </>
      )}
    </AnimatedPage>
  )
}
