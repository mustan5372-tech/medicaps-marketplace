import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBook, FiPlus, FiTrash2, FiEdit2, FiX, FiEye } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../utils/api'

const BRANCHES = ['Computer Science','Mechanical','Electrical','Electronics','Automobile','Robotics','Civil','First Year']
const EMPTY = { title: '', subject: '', branch: 'Computer Science', fileUrl: '', isImportant: false }

function EbookFormModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || EMPTY)
  const [loading, setLoading] = useState(false)
  const isEdit = !!initial?._id
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.subject || !form.branch || !form.fileUrl) return toast.error('All fields required')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (k !== '_id') fd.append(k, v) })
      const res = isEdit
        ? await api.patch(`/admin/ebooks/${initial._id}`, fd)
        : await api.post('/admin/ebooks', fd)
      toast.success(isEdit ? 'Updated' : 'Ebook added')
      onSaved(res.data.ebook, isEdit)
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <FiBook className="text-indigo-400" /> {isEdit ? 'Edit Ebook' : 'Add Ebook'}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Engineering Mathematics"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-indigo-500/50" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Subject *</label>
            <input value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="e.g. Mathematics, DBMS"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-indigo-500/50" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Branch *</label>
            <select value={form.branch} onChange={e => set('branch', e.target.value)}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/50">
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">PDF URL *</label>
            <input value={form.fileUrl} onChange={e => set('fileUrl', e.target.value)} placeholder="https://drive.google.com/file/d/..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-indigo-500/50" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={form.isImportant} onChange={e => set('isImportant', e.target.checked)} className="w-4 h-4 accent-red-500" />
            <span className="text-sm text-white/70">Mark as Important for MST</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition disabled:opacity-50">
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Add Ebook'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function AdminEbooks() {
  const [ebooks, setEbooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  const load = async () => {
    setLoading(true)
    try { const res = await api.get('/admin/ebooks'); setEbooks(res.data.ebooks) } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSaved = (ebook, isEdit) =>
    setEbooks(prev => isEdit ? prev.map(e => e._id === ebook._id ? ebook : e) : [ebook, ...prev])

  const handleDelete = async (id) => {
    if (!confirm('Delete this ebook?')) return
    try { await api.delete(`/admin/ebooks/${id}`); setEbooks(prev => prev.filter(e => e._id !== id)); toast.success('Deleted') }
    catch { toast.error('Failed') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-white font-semibold">Ebook Library</p>
          <p className="text-white/40 text-xs">{ebooks.length} ebooks</p>
        </div>
        <button onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition">
          <FiPlus size={15} /> Add Ebook
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : ebooks.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <FiBook size={36} className="mx-auto mb-2 opacity-30" />
          <p>No ebooks yet. Add the first one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ebooks.map(e => (
            <motion.div key={e._id} layout className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium text-sm truncate">{e.title}</p>
                  {e.isImportant && <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full shrink-0">MST</span>}
                </div>
                <p className="text-white/40 text-xs mt-0.5">{e.subject} - {e.branch}</p>
                <p className="text-white/20 text-xs mt-0.5 flex items-center gap-1"><FiEye size={10} /> {e.views || 0} views</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setModal(e)} className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition"><FiEdit2 size={14} /></button>
                <button onClick={() => handleDelete(e._id)} className="p-2 rounded-xl hover:bg-red-500/20 text-white/50 hover:text-red-400 transition"><FiTrash2 size={14} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <EbookFormModal
            initial={modal === 'add' ? null : modal}
            onClose={() => setModal(null)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
