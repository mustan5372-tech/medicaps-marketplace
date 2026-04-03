import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiAlertTriangle, FiX } from 'react-icons/fi'

export default function FakeListingWarning({ onConfirm, onCancel }) {
  const [checked, setChecked] = useState(false)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        />
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-2xl"
        >
          <button onClick={onCancel} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition">
            <FiX className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <FiAlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Important Notice</h2>
          </div>

          <ul className="space-y-2 mb-5 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> Please post genuine listings only</li>
            <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> Fake or misleading ads will be removed</li>
            <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> Repeated violations may result in account restriction</li>
          </ul>

          <label className="flex items-center gap-3 cursor-pointer mb-5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition">
            <input
              type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">I confirm this listing is genuine</span>
          </label>

          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Cancel
            </button>
            <motion.button
              whileHover={checked ? { boxShadow: '0 0 20px rgba(59,130,246,0.4)' } : {}}
              whileTap={checked ? { scale: 0.97 } : {}}
              onClick={() => checked && onConfirm()}
              disabled={!checked}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition"
            >
              Continue
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
