import React, { useState, useEffect } from "react"
import { FiLink, FiTrash2, FiPlus, FiX } from "react-icons/fi"
import toast from "react-hot-toast"
import api from "../utils/api"

const BRANCHES = ["Computer Science","Mechanical","Electrical","Electronics","Automobile","Robotics","Civil","First Year"]

function extractId(link) {
  const m = link.match(/\/d\/([a-zA-Z0-9_-]+)/)
  return m ? m[1] : null
}

function AddModal({ onClose, onSaved }) {
  const [driveLink, setDriveLink] = useState("")
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [branch, setBranch] = useState("Computer Science")
  const [isImportant, setIsImportant] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLinkChange = (e) => {
    const val = e.target.value
    setDriveLink(val)
    if (!title) {
      const id = extractId(val)
      if (id) setTitle("Ebook " + id.substring(0, 8))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!driveLink || !title) return toast.error("Drive link and title required")
    setLoading(true)
    try {
      const res = await api.post("/admin/ebooks/add", { driveLink, title, subject, branch, isImportant })
      toast.success("Ebook added!")
      onSaved(res.data.ebook)
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || "Failed") }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Add Ebook</h3>
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
              {loading ? "Saving..." : "Add Ebook"}
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
      {loading ? <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        : ebooks.length === 0 ? <p className="text-white/30 text-center py-12">No ebooks yet.</p>
        : <div className="space-y-2">{ebooks.map(e => (
            <div key={e._id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium text-sm truncate">{e.title}</p>
                  {e.isImportant && <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full shrink-0">MST</span>}
                </div>
                <p className="text-white/40 text-xs mt-0.5">{e.subject} · {e.branch} · <FiLink size={10} className="inline" /> Drive</p>
              </div>
              <button onClick={() => handleDelete(e._id)} className="p-2 rounded-xl hover:bg-red-500/20 text-white/50 hover:text-red-400"><FiTrash2 size={14} /></button>
            </div>
          ))}</div>
      }
      {showModal && <AddModal onClose={() => setShowModal(false)} onSaved={e => setEbooks(p => [e, ...p])} />}
    </div>
  )
}