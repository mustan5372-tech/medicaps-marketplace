import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../utils/api"

export default function EbookReader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [baseUrl, setBaseUrl] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [pageInput, setPageInput] = useState("1")
  const [error, setError] = useState(null)
  const iframeRef = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    api.get("/ebooks/" + id + "/view")
      .then(r => {
        setBaseUrl(r.data.previewUrl)
        setTotalPages(r.data.totalPages || 0)
      })
      .catch(() => setError("Failed to load ebook."))
  }, [id])

  useEffect(() => {
    const block = e => {
      if ((e.ctrlKey && ["s","p"].includes(e.key.toLowerCase())) || e.key === "F12") e.preventDefault()
    }
    window.addEventListener("keydown", block, true)
    return () => window.removeEventListener("keydown", block, true)
  }, [])

  const goToPage = (p) => {
    const max = totalPages || 9999
    const clamped = Math.max(1, Math.min(p, max))
    setPage(clamped)
    setPageInput(String(clamped))
  }

  const handlePageInput = (e) => {
    setPageInput(e.target.value)
  }

  const handlePageSubmit = (e) => {
    e.preventDefault()
    const n = parseInt(pageInput)
    if (!isNaN(n)) goToPage(n)
  }

  // Drive preview supports #page=N
  const iframeSrc = baseUrl ? baseUrl + "&rm=minimal#page=" + page : null

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-white/10 shrink-0 flex-wrap">
        <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-white/10 transition shrink-0">← Back</button>

        {/* Page navigation */}
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => goToPage(page - 1)} disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm disabled:opacity-30 transition">‹ Prev</button>

          <form onSubmit={handlePageSubmit} className="flex items-center gap-1">
            <input
              value={pageInput}
              onChange={handlePageInput}
              className="w-14 text-center bg-white/10 border border-white/20 rounded-lg py-1.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
            {totalPages > 0 && <span className="text-white/40 text-xs">/ {totalPages}</span>}
            <button type="submit" className="px-2 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs transition">Go</button>
          </form>

          <button onClick={() => goToPage(page + 1)} disabled={totalPages > 0 && page >= totalPages}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm disabled:opacity-30 transition">Next ›</button>
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1 relative overflow-hidden bg-gray-950" style={{ userSelect: "none" }}>
        {error && <p className="text-red-400 text-center mt-20">{error}</p>}
        {!error && !iframeSrc && (
          <div className="flex justify-center mt-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {iframeSrc && (
          <>
            <iframe
              ref={iframeRef}
              key={iframeSrc}
              src={iframeSrc}
              style={{ width: "100%", height: "calc(100vh - 52px)", border: "none", display: "block" }}
              allow="autoplay"
              title="Ebook Viewer"
            />
            {/* Cover Drive open-in-new-tab button */}
            <div style={{
              position: "absolute", bottom: 0, right: 0,
              width: "80px", height: "80px",
              background: "#030712", zIndex: 10, pointerEvents: "all", cursor: "default"
            }} />
          </>
        )}
      </div>
    </div>
  )
}