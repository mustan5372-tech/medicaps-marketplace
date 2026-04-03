import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import toast from 'react-hot-toast'
import AnimatedPage from '../components/AnimatedPage'
import { FiTrash2, FiUserX, FiFlag, FiUsers, FiList, FiAlertTriangle, FiCheckCircle, FiEye, FiEyeOff, FiShield } from 'react-icons/fi'

const TABS = [
  { id: 'listings', label: 'All Listings', icon: FiList },
  { id: 'flagged', label: 'Flagged', icon: FiFlag },
  { id: 'users', label: 'Users', icon: FiUsers },
  { id: 'reports', label: 'Reports', icon: FiAlertTriangle },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState('listings')
  const [listings, setListings] = useState([])
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [flagModal, setFlagModal] = useState(null)
  const [flagReason, setFlagReason] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [sRes, lRes, uRes, rRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/listings'),
        api.get('/admin/users'),
        api.get('/admin/reports'),
      ])
      setStats(sRes.data)
      setListings(lRes.data.listings)
      setUsers(uRes.data.users)
      setReports(rRes.data.reports)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const deleteListing = async (id) => {
    if (!confirm('Delete this listing permanently?')) return
    await api.delete(`/admin/listings/${id}`)
    setListings(prev => prev.filter(l => l._id !== id))
    toast.success('Listing deleted')
  }

  const flagListing = async () => {
    await api.patch(`/admin/listings/${flagModal}/flag`, { reason: flagReason })
    setListings(prev => prev.map(l => l._id === flagModal ? { ...l, isFlagged: true, isActive: false } : l))
    setFlagModal(null)
    setFlagReason('')
    toast.success('Listing flagged')
  }

  const unflagListing = async (id) => {
    await api.patch(`/admin/listings/${id}/unflag`)
    setListings(prev => prev.map(l => l._id === id ? { ...l, isFlagged: false, isActive: true } : l))
    toast.success('Listing unflagged')
  }

  const toggleBan = async (user) => {
    const endpoint = user.banned ? `/admin/users/${user._id}/unban` : `/admin/users/${user._id}/ban`
    await api.patch(endpoint)
    setUsers(prev => prev.map(u => u._id === user._id ? { ...u, banned: !u.banned } : u))
    toast.success(user.banned ? 'User unbanned' : 'User banned')
  }

  const resolveReport = async (id) => {
    await api.put(`/admin/reports/${id}/resolve`)
    setReports(prev => prev.filter(r => r._id !== id))
    toast.success('Report resolved')
  }

  const displayedListings = tab === 'flagged' ? listings.filter(l => l.isFlagged) : listings

  return (
    <AnimatedPage className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
          <FiShield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Moderate content and manage users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Users', value: stats.totalUsers, color: 'blue' },
          { label: 'Listings', value: stats.totalListings, color: 'indigo' },
          { label: 'Reports', value: stats.totalReports, color: 'orange' },
          { label: 'Flagged', value: stats.flaggedListings, color: 'red' },
          { label: 'Banned', value: stats.bannedUsers, color: 'gray' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{s.value ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {[
          { id: 'listings', label: 'Listings', icon: FiList, count: listings.length },
          { id: 'flagged', label: 'Flagged', icon: FiFlag, count: listings.filter(l => l.isFlagged).length },
          { id: 'users', label: 'Users', icon: FiUsers, count: users.length },
          { id: 'reports', label: 'Reports', icon: FiAlertTriangle, count: reports.length },
        ].map(t => (
          <motion.button key={t.id} whileTap={{ scale: 0.95 }} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition shrink-0 ${tab === t.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400'}`}>
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                {t.count}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {loading ? <div className="h-40 skeleton rounded-2xl" /> : (
        <>
          {/* Listings & Flagged */}
          {(tab === 'listings' || tab === 'flagged') && (
            <div className="space-y-3">
              {displayedListings.length === 0 && <p className="text-center text-gray-400 py-12">No listings</p>}
              {displayedListings.map(l => (
                <motion.div key={l._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl border p-4 ${l.isFlagged ? 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-800'}`}>
                  <img src={l.images?.[0] || 'https://placehold.co/60x60/e2e8f0/94a3b8?text=?'} alt=""
                    className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{l.title}</p>
                      {l.isFlagged && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium shrink-0">⚠ Flagged</span>}
                    </div>
                    <p className="text-sm text-gray-500">₹{l.price} · {l.category} · {l.seller?.name}</p>
                    {l.flaggedReason && <p className="text-xs text-red-500 mt-0.5">Reason: {l.flaggedReason}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {l.isFlagged ? (
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => unflagListing(l._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl hover:bg-green-100 transition">
                        <FiEye className="w-3.5 h-3.5" /> Unflag
                      </motion.button>
                    ) : (
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setFlagModal(l._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl hover:bg-orange-100 transition">
                        <FiFlag className="w-3.5 h-3.5" /> Flag
                      </motion.button>
                    )}
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => deleteListing(l._id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition">
                      <FiTrash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div className="space-y-3">
              {users.map(u => (
                <div key={u._id} className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shrink-0 overflow-hidden">
                    {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white">{u.name}</p>
                      {u.role === 'admin' && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Admin</span>}
                      {u.banned && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Banned</span>}
                    </div>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                  {u.role !== 'admin' && (
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => toggleBan(u)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl transition ${u.banned ? 'bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100' : 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100'}`}>
                      <FiUserX className="w-4 h-4" /> {u.banned ? 'Unban' : 'Ban'}
                    </motion.button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reports */}
          {tab === 'reports' && (
            <div className="space-y-3">
              {reports.length === 0 && <p className="text-center text-gray-400 py-12">No pending reports</p>}
              {reports.map(r => (
                <div key={r._id} className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                  <FiAlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{r.listing?.title || 'Deleted listing'}</p>
                    <p className="text-sm text-gray-500">Reason: {r.reason} · By: {r.reporter?.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={async () => {
                      if (r.listing?._id) {
                        await api.patch(`/admin/listings/${r.listing._id}/flag`, { reason: r.reason })
                        setListings(prev => prev.map(l => l._id === r.listing._id ? { ...l, isFlagged: true } : l))
                      }
                      resolveReport(r._id)
                    }}
                      className="px-3 py-1.5 text-sm bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl hover:bg-orange-100 transition">
                      Flag & Resolve
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => resolveReport(r._id)}
                      className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl hover:bg-green-100 transition">
                      <FiCheckCircle className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Flag Modal */}
      <AnimatePresence>
        {flagModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            onClick={() => setFlagModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Flag Listing</h3>
              <select value={flagReason} onChange={e => setFlagReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none cursor-pointer">
                <option value="">Select reason</option>
                <option value="Fake listing">Fake listing</option>
                <option value="Spam">Spam</option>
                <option value="Inappropriate content">Inappropriate content</option>
                <option value="Wrong category">Wrong category</option>
                <option value="Misleading price">Misleading price</option>
              </select>
              <div className="flex gap-3">
                <button onClick={() => setFlagModal(null)} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">Cancel</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={flagListing} disabled={!flagReason}
                  className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-50 transition">
                  Flag Listing
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  )
}
