import { motion, useScroll, useTransform } from 'framer-motion'
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
      transition={{ delay: 0.8, type: 'spring', stiffness: 300, damping: 20 }}
      className="fixed bottom-6 right-6 z-40 md:hidden"
    >
      <Link to="/create-listing">
        <motion.button
          whileHover={{ scale: 1.12, boxShadow: '0 20px 40px rgba(99,102,241,0.5)' }}
          whileTap={{ scale: 0.88 }}
          className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40"
        >
          <motion.div animate={{ rotate: [0, 90, 0] }} transition={{ duration: 0.3, delay: 1 }}>
            <FiPlus className="w-6 h-6" />
          </motion.div>
        </motion.button>
      </Link>
    </motion.div>
  )
}
