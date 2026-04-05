import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiInfo, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'
import api from '../utils/api'

const ICONS = { info: FiInfo, warning: FiAlertTriangle, success: FiCheckCircle }
const COLORS = {
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
  warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([])
  const [dismissed, setDismissed] = useState([])

  useEffect(() => {
    api.get('/announcements').then(r => setAnnouncements(r.data.announcements || [])).catch(() => {})
  }, [])

  const visible = announcements.filter(a => !dismissed.includes(a._id))
  if (visible.length === 0) return null

  return (
    <div className="space-y-1">
      <AnimatePresence>
        {visible.map(ann => {
          const Icon = ICONS[ann.type] || FiInfo
          return (
            <motion.div key={ann._id}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
              className={`flex items-center gap-3 px-4 py-2.5 border-b text-sm ${COLORS[ann.type]}`}>
              <Icon className="w-4 h-4 shrink-0" />
              <p className="flex-1">{ann.message}</p>
              <button onClick={() => setDismissed(d => [...d, ann._id])} className="p-0.5 rounded hover:opacity-70 transition">
                <FiX className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
