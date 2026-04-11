import React, { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../utils/api"

export default function EbookReader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
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

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="flex items-center gap-4 px-4 py-3 bg-gray-900 border-b border-white/10 shrink-0">
        <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white text-sm">← Back</button>
        <span className="text-white/40 text-sm">View Only</span>
      </div>
      <div ref={ref} className="flex-1" style={{ userSelect: "none" }}>
        {error && <p className="text-red-400 text-center mt-20">{error}</p>}
        {!error && !previewUrl && (
          <div className="flex justify-center mt-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {previewUrl && (
          <iframe
            src={previewUrl}
            className="w-full h-full"
            style={{ height: "calc(100vh - 52px)", border: "none" }}
            allow="autoplay"
            title="Ebook Viewer"
          />
        )}
      </div>
    </div>
  )
}