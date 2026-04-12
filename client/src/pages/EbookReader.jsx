import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../utils/api"

export default function EbookReader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
  const [zoom, setZoom] = useState(100)
  const ref = useRef(null)

  useEffect(() => {
    api.get("/ebooks/" + id + "/view")
      .then(r => setPreviewUrl(r.data.previewUrl))
      .catch(() => setError("Failed to load ebook."))
  }, [id])

  useEffect(() => {
    const block = e => {
      if ((e.ctrlKey && ["s","p"].includes(e.key.toLowerCase())) || e.key === "F12") e.preventDefault()
    }
    window.addEventListener("keydown", block, true)
    return () => window.removeEventListener("keydown", block, true)
  }, [])

  useEffect(() => {
    const el = ref.current; if (!el) return
    const block = e => e.preventDefault()
    el.addEventListener("contextmenu", block)
    return () => el.removeEventListener("contextmenu", block)
  })

  const zoomIn  = () => setZoom(z => Math.min(z + 10, 200))
  const zoomOut = () => setZoom(z => Math.max(z - 10, 50))

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-900 border-b border-white/10 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-white/10 transition">← Back</button>
        <span className="text-white/30 text-xs">View Only</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={zoomOut} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg font-bold transition">−</button>
          <span className="text-white/60 text-xs w-12 text-center">{zoom}%</span>
          <button onClick={zoomIn}  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg font-bold transition">+</button>
        </div>
      </div>

      {/* Viewer */}
      <div ref={ref} className="flex-1 relative overflow-hidden bg-gray-950" style={{ userSelect: "none" }}>
        {error && <p className="text-red-400 text-center mt-20">{error}</p>}
        {!error && !previewUrl && (
          <div className="flex justify-center mt-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {previewUrl && (
          <>
            <iframe
              src={previewUrl}
              style={{
                width: `${zoom}%`,
                height: "calc(100vh - 52px)",
                border: "none",
                marginLeft: zoom > 100 ? `${(zoom - 100) / 2}%` : "auto",
                display: "block",
              }}
              allow="autoplay"
              sandbox="allow-scripts allow-same-origin"
              title="Ebook Viewer"
            />
            {/* Overlay to hide Drive's open-in-new-tab button (bottom-right corner) */}
            <div style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "60px",
              height: "60px",
              background: "#0f172a",
              zIndex: 10,
              pointerEvents: "none",
            }} />
          </>
        )}
      </div>
    </div>
  )
}