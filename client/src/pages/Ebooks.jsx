import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FiShare2, FiX, FiBook } from "react-icons/fi"
import toast from "react-hot-toast"
import api from "../utils/api"

const BRANCHES = ["All","Computer Science","Mechanical","Electrical","Civil","Electronics","Automobile","Robotics","First Year"]

function RequestModal({ onClose }) {
  const [form, setForm] = useState({ bookName: "", subject: "", branch: "Computer Science" })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.bookName || !form.subject) return toast.error("All fields required")
    setLoading(true)
    try {
      await api.post("/ebooks/request", form)
      toast.success("Request submitted! Admin will be notified.")
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || "Failed") }
    setLoading(false)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><FiBook size={16} /> Request a Book</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><FiX size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={form.bookName} onChange={e => set("bookName", e.target.value)} placeholder="Book name *"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500" />
          <input value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="Subject *"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500" />
          <select value={form.branch} onChange={e => set("branch", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none">
            {BRANCHES.filter(b => b !== "All").map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition disabled:opacity-50">
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

function shareEbook(id) {
  const url = window.location.origin + "/reader/" + id
  if (navigator.share) {
    navigator.share({ title: "Check out this ebook", url }).catch(() => {})
  } else {
    navigator.clipboard.writeText(url)
    toast.success("Link copied!")
  }
}

export default function Ebooks() {
  const [ebooks, setEbooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [branch, setBranch] = useState("All")
  const [showRequest, setShowRequest] = useState(false)

  useEffect(() => {
    api.get("/ebooks", { params: branch !== "All" ? { branch } : {} })
      .then(r => setEbooks(r.data.ebooks || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [branch])

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📚 MST Ebook Library</h1>
        <button onClick={() => setShowRequest(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition">
          📩 Request Book
        </button>
      </div>

      {/* Branch filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {BRANCHES.map(b => (
          <button key={b} onClick={() => setBranch(b)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              branch === b ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}>
            {b}
          </button>
        ))}
      </div>

      {ebooks.length === 0 ? (
        <p className="text-gray-500">No ebooks in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ebooks.map(e => (
            <div key={e._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col gap-3">
              {e.isImportant && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full w-fit">�� Important</span>}
              <p className="font-semibold text-gray-900 dark:text-white">{e.title}</p>
              <p className="text-xs text-gray-500">{e.subject} · {e.branch}{e.author ? ` · ${e.author}` : ""}</p>
              <div className="flex gap-2 mt-auto">
                <Link to={`/reader/${e._id}`}
                  className="flex-1 text-center py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition">
                  Read Now
                </Link>
                <button onClick={() => shareEbook(e._id)}
                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-600 hover:border-indigo-400 transition">
                  <FiShare2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showRequest && <RequestModal onClose={() => setShowRequest(false)} />}
      </AnimatePresence>
    </div>
  )
}