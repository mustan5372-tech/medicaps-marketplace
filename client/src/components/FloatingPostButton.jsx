import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiPlus } from 'react-icons/fi'
import { useAuthStore } from '../store/authStore'

export default function FloatingPostButton() {
  const { user } = useAuthStore()
  if (!user) return null

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
      className="fixed bottom-6 right-6 z-40 md:hidden"
    >
      <Link to="/create-listing">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40"
        >
          <FiPlus className="w-6 h-6" />
        </motion.button>
      </Link>
    </motion.div>
  )
}
