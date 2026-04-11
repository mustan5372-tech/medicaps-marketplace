import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const BASE = import.meta.env.VITE_API_URL || "https://medicaps-backend-7cwm.onrender.com/api"

export default function EbookReader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [numPages, setNumPages] = useState(null)
  const [page, setPage] = useState(1)
  const [scale, setScale] = useState(1.2)
  const ref = useRef(null)
  const token = localStorage.getItem("token") || ""
  const pdfUrl = `${BASE}/ebooks/${id}/view`

  // Block shortcuts
  useEffect(() => {
    const block = e => {
      if ((e.ctrlKey && ["s","p","u"].includes(e.key.toLowerCase())) || e.key === "F12") e.preventDefault()
    }
    window.addEventListener("keydown", block, true)
    return () => window.removeEventListener("keydown", block, true)
  }, [])

  // Block right click
  useEffect(() => {
    const el = ref.current; if (!el) return
    const block = e => e.preventDefault()
    el.addEventListener("contextmenu", block)
    return () => el.removeEventListener("contextmenu", block)
  })

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 py-3 bg-gray-900 border-b border-white/10 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white text-sm">← Back</button>
        <span className="text-white/40 text-sm">Page {page} / {numPages || "—"}</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setScale(s => Math.max(0.6, +(s - 0.2).toFixed(1)))}
            className="px-2 py-1 rounded-lg bg-white/10 text-white text-sm">−</button>
          <span className="text-white/40 text-xs w-10 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3, +(s + 0.2).toFixed(1)))}
            className="px-2 py-1 rounded-lg bg-white/10 text-white text-sm">+</button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm disabled:opacity-30 ml-2">Prev</button>
          <button onClick={() => setPage(p => Math.min(numPages || 1, p + 1))} disabled={page >= (numPages || 1)}
            className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm disabled:opacity-30">Next</button>
        </div>
      </div>

      {/* PDF */}
      <div ref={ref} className="flex-1 overflow-auto flex justify-center py-6 bg-gray-950" style={{ userSelect: "none" }}>
        <Document
          file={{ url: pdfUrl, httpHeaders: { Authorization: `Bearer ${token}` } }}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<p className="text-white/40 mt-20">Loading PDF...</p>}
          error={<p className="text-red-400 mt-20 text-center px-4">Failed to load PDF.<br/>Make sure the Drive file is set to "Anyone with link can view".</p>}
        >
          <Page pageNumber={page} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} />
        </Document>
      </div>
    </div>
  )
}