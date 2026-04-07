import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { FiBook } from 'react-icons/fi'
import { useAuthStore } from '../store/authStore'

export default function FloatingEbookButton() {
  const { user } = useAuthStore()
  const location = useLocation()

  // Hide on the ebooks page itself
  if (!user || location.pathname === '/ebooks') return null

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 20 }}
      className="fixed bottom-6 left-6 z-40"
    >
      <Link to="/ebooks">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex items-center gap-2 bg-gradient-to-br from-purple-600 to-blue-600 text-white px-4 py-3 rounded-2xl shadow-2xl shadow-purple-500/40"
        >
          <FiBook className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">Ebooks</span>
        </motion.div>
      </Link>
    </motion.div>
  )
}
