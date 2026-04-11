import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBook, FiEye, FiSearch, FiX, FiMessageSquare } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'
import AnimatedPage from '../components/AnimatedPage'
import SecurePdfViewer from '../components/SecurePdfViewer'

const BRANCHES = ['All', 'First Year', 'Computer Science', 'Mechanical', 'Electrical', 'Electronics', 'Automobile', 'Robotics', 'Civil']

const BRANCH_COLORS = {
  'Computer Science': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Mechanical':       'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'Electrical':       'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  'Electronics':      'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'Automobile':       'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'Robotics':         'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  'Civil':            'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'First Year':       'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
}

function isNew(date) {
  return Date.now() - new Date(date).getTime() < 7 * 24 * 60 * 60 * 1000
}

function EbookCard({ ebook, onView }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md flex flex-col"
    >
      {/* Cover */}
      <div className="relative h-32 bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-600 flex items-center justify-center shrink-0">
        {ebook.coverUrl
          ? <img src={ebook.coverUrl} alt={ebook.title} className="w-full h-full object-cover" />
          : <FiBook className="text-white/50" size={36} />
        }
        <div className="absolute top-2 left-2 flex gap-1">
          {ebook.isImportant && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">🔥 Popular</span>
          )}
          {isNew(ebook.createdAt) && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">New</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 mb-1">{ebook.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{ebook.subject}</p>
        <div className="flex items-center justify-between mb-3 mt-auto">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${BRANCH_COLORS[ebook.branch] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
            {ebook.branch}
          </span>
          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
            <FiEye size={9} /> {ebook.views || 0}
          </span>
        </div>
        <button
          onClick={() => onView(ebook)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
        >
          <FiEye size={12} /> View Ebook
        </button>
      </div>
    </motion.div>
  )
}

function Section({ title, ebooks, onView }) {
  if (!ebooks.length) return null
  return (
    <div className="mb-10">
      <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        <AnimatePresence mode="popLayout">
          {ebooks.map(e => <EbookCard key={e._id} ebook={e} onView={onView} />)}
        </AnimatePresence>
      </div>
    </div>
  )
}

function RequestModal({ onClose }) {
  const [form, setForm] = useState({ bookName: '', subject: '' })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.bookName.trim() || !form.subject.trim()) return toast.error('Fill all fields')
    setLoading(true)
    try {
      await api.post('/ebooks/request', form)
      toast.success('Request submitted!')
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Request a Missing Book</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><FiX size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={form.bookName} onChange={e => set('bookName', e.target.value)} placeholder="Book name *"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500" />
          <input value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Subject *"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500" />
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default function Ebooks() {
  const [ebooks, setEbooks] = useState([])
  const [branch, setBranch] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [viewer, setViewer] = useState(null)
  const [showRequest, setShowRequest] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/ebooks', { params: branch !== 'All' ? { branch } : {} })
      setEbooks(res.data.ebooks || [])
    } catch { toast.error('Failed to load library') }
    setLoading(false)
  }, [branch])

  useEffect(() => { load() }, [load])

  const filtered = search
    ? ebooks.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.subject.toLowerCase().includes(search.toLowerCase())
      )
    : ebooks

  const important = filtered.filter(e => e.isImportant)
  const recent    = filtered.filter(e => isNew(e.createdAt))

  return (
    <AnimatedPage>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-full px-4 py-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-3">
            <FiBook size={12} /> Instant Access Library
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
            📚 MST Ebook Library
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-5 text-sm">
            Access important books instantly for your exams
          </p>
          <button
            onClick={() => setShowRequest(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <FiMessageSquare size={13} /> Request Missing Book
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm mx-auto mb-5">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title or subject..."
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FiX size={13} />
            </button>
          )}
        </div>

        {/* Branch filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {BRANCHES.map(b => (
            <button key={b} onClick={() => setBranch(b)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                branch === b
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-100 dark:bg-gray-800 h-52 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FiBook size={44} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">{search ? `No results for "${search}"` : 'No ebooks in this category yet'}</p>
          </div>
        ) : (
          <>
            <Section title="🔥 Most Important for MST" ebooks={important} onView={setViewer} />
            <Section title="⚡ Recently Added" ebooks={recent} onView={setViewer} />
            <Section title="📚 All Books" ebooks={filtered} onView={setViewer} />
          </>
        )}
      </div>

      {/* Secure PDF viewer */}
      <AnimatePresence>
        {viewer && (
          <SecurePdfViewer
            key={viewer._id}
            ebookId={viewer._id}
            title={viewer.title}
            onClose={() => setViewer(null)}
          />
        )}
      </AnimatePresence>

      {/* Request modal */}
      <AnimatePresence>
        {showRequest && <RequestModal onClose={() => setShowRequest(false)} />}
      </AnimatePresence>
    </AnimatedPage>
  )
}