import { useState, useEffect, useRef, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut,
  FiX, FiMaximize2, FiMinimize2, FiBook,
} from 'react-icons/fi'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import toast from 'react-hot-toast'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

const BASE_URL = import.meta.env.VITE_API_URL || 'https://medicaps-backend-7cwm.onrender.com/api'

export default function SecurePdfViewer({ ebookId, title = 'Ebook', onClose }) {
  const { user } = useAuthStore()
  const [token, setToken] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [page, setPage] = useState(1)
  const [scale, setScale] = useState(1.2)
  const [error, setError] = useState(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [tabHidden, setTabHidden] = useState(false)
  const containerRef = useRef(null)
  const refreshRef = useRef(null)

  const fetchToken = useCallback(async () => {
    try {
      const res = await api.post(`/ebooks/${ebookId}/token`)
      setToken(res.data.token)
      // Refresh 2 min before expiry
      clearTimeout(refreshRef.current)
      refreshRef.current = setTimeout(fetchToken, 8 * 60 * 1000)
    } catch (err) {
      setError(err.response?.data?.message || 'Access denied')
    }
  }, [ebookId])

  useEffect(() => {
    fetchToken()
    return () => clearTimeout(refreshRef.current)
  }, [fetchToken])

  // Block Ctrl+S / Ctrl+P / Ctrl+U / F12 / Ctrl+Shift+I
  useEffect(() => {
    const handler = (e) => {
      const blocked =
        (e.ctrlKey && ['s', 'p', 'u'].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) ||
        e.key === 'F12'
      if (blocked) {
        e.preventDefault()
        e.stopPropagation()
        toast('🔒 Disabled in reader mode')
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [])

  // Disable right-click inside viewer
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const block = (e) => e.preventDefault()
    el.addEventListener('contextmenu', block)
    return () => el.removeEventListener('contextmenu', block)
  }, [token])

  // Blur when tab hidden
  useEffect(() => {
    const handler = () => setTabHidden(document.hidden)
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  const pdfUrl = token ? `${BASE_URL}/ebooks/${ebookId}/view?token=${token}` : null
  const ts = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  const watermark = `${user?.name || 'User'} • MediCaps • ${ts}`

  if (error) return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <div className="text-center text-white p-8">
        <p className="text-red-400 text-lg mb-4">🔒 {error}</p>
        <button onClick={onClose} className="px-6 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition">Close</button>
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gray-950 flex flex-col"
    >
      {/* Tab-hidden blur */}
      <AnimatePresence>
        {tabHidden && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 backdrop-blur-2xl bg-black/80 flex items-center justify-center"
          >
            <p className="text-white/60 text-lg">Return to tab to continue reading</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition shrink-0">
            <FiX size={18} />
          </button>
          <FiBook className="text-indigo-400 shrink-0" size={16} />
          <span className="text-white text-sm font-medium truncate">{title}</span>
          <span className="text-white/40 text-xs shrink-0">· {page}/{numPages || '—'}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setScale(s => Math.max(0.6, +(s - 0.2).toFixed(1)))}
            className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition">
            <FiZoomOut size={15} />
          </button>
          <span className="text-white/40 text-xs w-9 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3, +(s + 0.2).toFixed(1)))}
            className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition">
            <FiZoomIn size={15} />
          </button>
          <button onClick={() => setFullscreen(f => !f)}
            className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition ml-1">
            {fullscreen ? <FiMinimize2 size={15} /> : <FiMaximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* PDF canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex justify-center bg-gray-950 relative"
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        {/* Watermark grid */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden" aria-hidden>
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-white/[0.035] text-xs font-medium whitespace-nowrap select-none"
              style={{
                top: `${(i % 5) * 22 + 4}%`,
                left: `${Math.floor(i / 5) * 36 + 4}%`,
                transform: 'rotate(-28deg)',
              }}
            >
              {watermark}
            </div>
          ))}
        </div>

        {!pdfUrl ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="py-6">
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={() => setError('Failed to load PDF. Please try again.')}
              loading={
                <div className="flex items-center justify-center h-64 w-64">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <Page
                pageNumber={page}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-2xl"
              />
            </Document>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-center gap-3 py-3 bg-gray-900 border-t border-white/10 shrink-0">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
        >
          <FiChevronLeft size={15} /> Prev
        </button>
        <div className="flex items-center gap-2">
          <input
            type="number" min={1} max={numPages || 1} value={page}
            onChange={e => { const v = +e.target.value; if (v >= 1 && v <= (numPages || 1)) setPage(v) }}
            className="w-14 text-center bg-white/5 border border-white/10 rounded-xl py-1.5 text-white text-sm focus:outline-none focus:border-indigo-500/50"
          />
          <span className="text-white/30 text-sm">/ {numPages || '—'}</span>
        </div>
        <button
          onClick={() => setPage(p => Math.min(numPages || 1, p + 1))}
          disabled={page >= (numPages || 1)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
        >
          Next <FiChevronRight size={15} />
        </button>
      </div>
    </motion.div>
  )
}
