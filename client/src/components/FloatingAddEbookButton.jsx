import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBook, FiX, FiLink } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'

const BRANCHES = ['Computer Science','Mechanical','Electrical','Electronics','Automobile','Robotics','Civil','First Year']
const ADMIN_ROLES = ['admin', 'ebook_uploader']

function AddEbookModal({ onClose, onSaved }) {
  const [driveLink, setDriveLink] = useState('')
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [branch, setBranch] = useState('Computer Science')
  const [isImportant, setIsImportant] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLinkChange = (e) => {
    const val = e.target.value
    setDriveLink(val)
    if (!title) {
      const m = val.match(/\/d\/([a-zA-Z0-9_-]+)/)
      if (m) setTitle('Ebook ' + m[1].substring(0, 8))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!driveLink || !title) return toast.error('Drive link and title required')
    setLoading(true)
    try {
      const res = await api.post('/admin/ebooks/add', { driveLink, title, subject, branch, isImportant })
      toast.success('Ebook added!')
      onSaved?.(res.data.ebook)
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2"><FiBook className="text-indigo-400" /> Add Ebook</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Google Drive Link *</label>
            <input value={driveLink} onChange={handleLinkChange} placeholder="https://drive.google.com/file/d/..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-500/50" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Auto-filled from link"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-500/50" />
          </div>
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-500/50" />
          <select value={branch} onChange={e => setBranch(e.target.value)}
            className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none">
            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isImportant} onChange={e => setIsImportant(e.target.checked)} className="accent-red-500" />
            <span className="text-sm text-white/70">Mark as Important</span>
          </label>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-50">
              {loading ? 'Adding...' : 'Add Ebook'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function FloatingAddEbookButton() {
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)

  if (!user || !ADMIN_ROLES.includes(user.role)) return null

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 hover:scale-110 transition-transform"
        title="Add Ebook"
      >
        <FiBook className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {open && <AddEbookModal onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
