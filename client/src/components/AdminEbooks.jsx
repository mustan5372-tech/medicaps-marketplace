import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBook, FiUpload, FiEye, FiClock, FiCheckCircle, FiX, FiUsers, FiList, FiAlertCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import api from '../utils/api'

// ── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({ request, onClose, onDone }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef()

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    if (f.type !== 'application/pdf') return toast.error('Only PDF files allowed')
    if (f.size > 20 * 1024 * 1024) return toast.error('File too large (max 20MB)')
    setFile(f)
  }

  const handleUpload = async () => {
    if (!file) return toast.error('Select a PDF first')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('pdf', file)
      const res = await api.post(`/admin/ebooks/${request._id}/upload`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Ebook uploaded & fulfilled ✅')
      onDone(res.data.request)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    }
    setUploading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <FiUpload className="text-blue-400" /> Upload PDF
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <div className="bg-white/5 rounded-xl p-3 mb-4">
          <p className="text-white font-medium text-sm">{request.bookName}</p>
          <p className="text-white/40 text-xs mt-0.5">{request.subject}{request.author ? ` · ${request.author}` : ''}</p>
          <p className="text-white/30 text-xs mt-1">Requested by {request.requestedBy?.name}</p>
        </div>

        <div
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            file ? 'border-green-500/40 bg-green-500/5' : 'border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5'
          }`}
        >
          <input ref={inputRef} type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
          {file ? (
            <>
              <FiCheckCircle className="text-green-400 mx-auto mb-2" size={28} />
              <p className="text-green-400 text-sm font-medium">{file.name}</p>
              <p className="text-white/30 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </>
          ) : (
            <>
              <FiUpload className="text-white/30 mx-auto mb-2" size={28} />
              <p className="text-white/50 text-sm">Click to select PDF</p>
              <p className="text-white/30 text-xs mt-1">Max 20MB</p>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload & Fulfill'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminEbooks() {
  const [requests, setRequests] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0, fulfilled: 0 })
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [uploadTarget, setUploadTarget] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/admin/ebooks?status=${filter}`)
      setRequests(res.data.requests)
      setStats(res.data.stats)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  const handleDone = (updated) => {
    setRequests(prev => prev.map(r => r._id === updated._id ? updated : r))
    setStats(prev => ({ ...prev, pending: prev.pending - 1, fulfilled: prev.fulfilled + 1 }))
  }

  const statCards = [
    { label: 'Total', value: stats.total, icon: FiList, color: 'text-blue-400' },
    { label: 'Pending', value: stats.pending, icon: FiClock, color: 'text-yellow-400' },
    { label: 'Fulfilled', value: stats.fulfilled, icon: FiCheckCircle, color: 'text-green-400' },
  ]

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <Icon className={`${color} mx-auto mb-1`} size={20} />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-white/40 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5">
        {['all', 'pending', 'fulfilled'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition-all ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <FiBook size={36} className="mx-auto mb-2 opacity-30" />
          <p>No {filter !== 'all' ? filter : ''} requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <motion.div
              key={req._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{req.bookName}</p>
                <p className="text-white/50 text-sm">{req.subject}{req.author ? ` · ${req.author}` : ''}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-white/30 text-xs flex items-center gap-1">
                    <FiUsers size={11} /> {req.requestedBy?.name || 'Unknown'}
                  </span>
                  <span className="text-white/30 text-xs flex items-center gap-1">
                    <FiClock size={11} />
                    {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
                  req.status === 'fulfilled'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {req.status === 'fulfilled' ? <FiCheckCircle size={11} /> : <FiClock size={11} />}
                  {req.status}
                </span>
                {req.status === 'pending' ? (
                  <button
                    onClick={() => setUploadTarget(req)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-sm transition-all"
                  >
                    <FiUpload size={13} /> Upload PDF
                  </button>
                ) : (
                  <a
                    href={req.ebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-all"
                  >
                    <FiEye size={13} /> View PDF
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {uploadTarget && (
          <UploadModal
            request={uploadTarget}
            onClose={() => setUploadTarget(null)}
            onDone={handleDone}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
