import React, { useState, useEffect } from "react"
import { FiUpload, FiTrash2, FiPlus, FiX } from "react-icons/fi"
import toast from "react-hot-toast"
import api from "../utils/api"

const BRANCHES = ["Computer Science","Mechanical","Electrical","Electronics","Automobile","Robotics","Civil","First Year"]

function UploadModal({ onClose, onSaved }) {
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [branch, setBranch] = useState("Computer Science")
  const [isImportant, setIsImportant] = useState(false)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    const autoTitle = f.name
      .replace(/\.pdf$/i, "")
      .replace(/[-_]/g, " ")
      .replace(/\(.*?\)/g, "")
      .replace(/\bfinal\b|\blatest\b|\bnew\b/gi, "")
      .replace(/\s+/g, " ")
      .trim()
    setTitle(autoTitle)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !file) return toast.error("Title and PDF required")
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("title", title)
      fd.append("subject", subject)
      fd.append("branch", branch)
      fd.append("isImportant", isImportant)
      const res = await api.post("/admin/ebooks/upload", fd, {
        onUploadProgress: p => {
          const pct = p.total ? Math.round((p.loaded * 100) / p.total) : 0
          toast.loading("Uploading... " + pct + "%", { id: "upload" })
        }
      })
      toast.dismiss("upload")
      toast.success("Uploaded!")
      onSaved(res.data.ebook)
      onClose()
    } catch (err) {
      toast.dismiss("upload")
      toast.error(err.response?.data?.message || "Upload failed")
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Upload Ebook</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-white/50 mb-1 block">PDF File *</label>
            <label className="flex items-center gap-3 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 cursor-pointer hover:border-indigo-500/50">
              <FiUpload className="text-white/40 shrink-0" />
              <span className="text-sm text-white/40 truncate">{file ? file.name : "Select PDF (max 50MB)"}</span>
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Auto-filled from filename"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-500/50" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Subject</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Operating Systems"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-500/50" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Branch</label>
            <select value={branch} onChange={e => setBranch(e.target.value)}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none">
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isImportant} onChange={e => setIsImportant(e.target.checked)} className="accent-red-500" />
            <span className="text-sm text-white/70">Mark as Important</span>
          </label>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-50">
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminEbooks() {
  const [ebooks, setEbooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    api.get("/admin/ebooks").then(r => setEbooks(r.data.ebooks || [])).finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm("Delete?")) return
    await api.delete("/admin/ebooks/" + id)
    setEbooks(p => p.filter(e => e._id !== id))
    toast.success("Deleted")
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-white font-semibold">Ebook Library ({ebooks.length})</p>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium">
          <FiPlus size={15} /> Add Ebook
        </button>
      </div>
      {loading
        ? <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        : ebooks.length === 0
          ? <p className="text-white/30 text-center py-12">No ebooks yet.</p>
          : (
            <div className="space-y-2">
              {ebooks.map(e => (
                <div key={e._id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium text-sm truncate">{e.title}</p>
                      {e.isImportant && <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full shrink-0">MST</span>}
                    </div>
                    <p className="text-white/40 text-xs mt-0.5">{e.subject} · {e.branch}</p>
                  </div>
                  <button onClick={() => handleDelete(e._id)} className="p-2 rounded-xl hover:bg-red-500/20 text-white/50 hover:text-red-400">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )
      }
      {showModal && <UploadModal onClose={() => setShowModal(false)} onSaved={e => setEbooks(p => [e, ...p])} />}
    </div>
  )
}