import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import toast from 'react-hot-toast'
import AnimatedPage from '../components/AnimatedPage'
import AdminEbooks from '../components/AdminEbooks'
import { FiTrash2, FiUserX, FiFlag, FiUsers, FiList, FiAlertTriangle, FiCheckCircle, FiEye, FiShield, FiEdit2, FiZap, FiBook } from 'react-icons/fi'

export default function AdminDashboard() {
  const [tab, setTab] = useState('listings')
  const [listings, setListings] = useState([])
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [flagModal, setFlagModal] = useState(null)
  const [flagReason, setFlagReason] = useState('')
  const [announcements, setAnnouncements] = useState([])
  const [newAnnouncement, setNewAnnouncement] = useState('')
  const [annType, setAnnType] = useState('info')
  const [editModal, setEditModal] = useState(false)
  const [editData, setEditData] = useState({})
  const [boostModal, setBoostModal] = useState(null)
  const [boostDuration, setBoostDuration] = useState(30)

  const load = async () => {
    setLoading(true)
    try {
      const [sRes, lRes, uRes, rRes, aRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/listings'),
        api.get('/admin/users'),
        api.get('/admin/reports'),
        api.get('/admin/announcements'),
      ])
      setStats(sRes.data)
      setListings(lRes.data.listings)
      setUsers(uRes.data.users)
      setReports(rRes.data.reports)
      setAnnouncements(aRes.data.announcements || [])
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

  const openEditModal = (listing) => {
    setEditData({
      _id: listing._id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      category: listing.category,
      condition: listing.condition,
      location: listing.location,
      negotiable: listing.negotiable,
    })
    setEditModal(true)
  }

  const saveListing = async () => {
    try {
      const res = await api.put(`/admin/listings/${editData._id}`, editData)
      setListings(prev => prev.map(l => l._id === editData._id ? res.data.listing : l))
      setEditModal(false)
      toast.success('Listing updated')
    } catch (err) {
      toast.error('Failed to update listing')
    }
  }

  const boostListing = async (id) => {
    try {
      const res = await api.patch(`/admin/listings/${id}/boost`, { duration: boostDuration })
      setListings(prev => prev.map(l => l._id === id ? res.data.listing : l))
      setBoostModal(null)
      setBoostDuration(30)
      toast.success(res.data.message)
    } catch (err) {
      toast.error('Failed to boost listing')
    }
  }

  const removeBoost = async (id) => {
    try {
      const res = await api.patch(`/admin/listings/${id}/remove-boost`)
      setListings(prev => prev.map(l => l._id === id ? res.data.listing : l))
      toast.success('Boost removed')
    } catch (err) {
      toast.error('Failed to remove boost')
    }
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
          { id: 'announcements', label: 'Announcements', icon: FiShield, count: announcements.length },
          { id: 'ebooks', label: 'Ebooks', icon: FiBook, count: null },
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{l.title}</p>
                      {l.isFlagged && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium shrink-0">⚠ Flagged</span>}
                      {l.isBoosted && <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full font-medium shrink-0 flex items-center gap-1"><FiZap className="w-3 h-3" /> Boosted</span>}
                    </div>
                    <p className="text-sm text-gray-500">₹{l.price} · {l.category} · {l.seller?.name}</p>
                    {l.flaggedReason && <p className="text-xs text-red-500 mt-0.5">Reason: {l.flaggedReason}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => openEditModal(l)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl hover:bg-blue-100 transition">
                      <FiEdit2 className="w-3.5 h-3.5" /> Edit
                    </motion.button>
                    {l.isBoosted ? (
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => removeBoost(l._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 rounded-xl hover:bg-yellow-100 transition">
                        <FiZap className="w-3.5 h-3.5" /> Remove Boost
                      </motion.button>
                    ) : (
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setBoostModal(l._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 rounded-xl hover:bg-yellow-100 transition">
                        <FiZap className="w-3.5 h-3.5" /> Boost
                      </motion.button>
                    )}
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
                      {u.unlimitedBoost && <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full flex items-center gap-1"><FiZap className="w-3 h-3" /> Unlimited Boost</span>}
                      {u.banned && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Banned</span>}
                    </div>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                  {u.role !== 'admin' && (
                    <div className="flex gap-2 flex-wrap">
                      {!u.isSellerVerified && (
                        <motion.button whileTap={{ scale: 0.9 }} onClick={async () => {
                          await api.patch(`/admin/users/${u._id}/verify-seller`)
                          setUsers(prev => prev.map(x => x._id === u._id ? { ...x, isSellerVerified: true } : x))
                          toast.success('Seller verified')
                        }} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl hover:bg-blue-100 transition">
                          ✓ Verify
                        </motion.button>
                      )}
                      <motion.button whileTap={{ scale: 0.9 }} onClick={async () => {
                        await api.patch(`/admin/users/${u._id}/unlimited-boost`, { enabled: !u.unlimitedBoost })
                        setUsers(prev => prev.map(x => x._id === u._id ? { ...x, unlimitedBoost: !x.unlimitedBoost } : x))
                        toast.success(u.unlimitedBoost ? 'Unlimited boost disabled' : 'Unlimited boost enabled')
                      }} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl transition ${u.unlimitedBoost ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 hover:bg-yellow-100' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}>
                        <FiZap className="w-4 h-4" /> {u.unlimitedBoost ? 'Disable' : 'Enable'} Boost
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => toggleBan(u)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl transition ${u.banned ? 'bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100' : 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100'}`}>
                        <FiUserX className="w-4 h-4" /> {u.banned ? 'Unban' : 'Ban'}
                      </motion.button>
                    </div>
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

          {/* Announcements */}
          {tab === 'announcements' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Post Announcement</h3>
                <textarea value={newAnnouncement} onChange={e => setNewAnnouncement(e.target.value)}
                  placeholder="Write your announcement..." rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white mb-3 focus:outline-none resize-none" />
                <div className="flex gap-2">
                  {['info','warning','success'].map(t => (
                    <button key={t} onClick={() => setAnnType(t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition ${annType === t ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                      {t}
                    </button>
                  ))}
                  <motion.button whileTap={{ scale: 0.97 }} disabled={!newAnnouncement.trim()}
                    onClick={async () => {
                      const res = await api.post('/admin/announcements', { message: newAnnouncement, type: annType })
                      setAnnouncements(prev => [res.data.announcement, ...prev])
                      setNewAnnouncement('')
                      toast.success('Announcement posted')
                    }}
                    className="ml-auto px-4 py-1.5 bg-blue-600 text-white text-xs rounded-xl disabled:opacity-50">
                    Post
                  </motion.button>
                </div>
              </div>
              {announcements.map(a => (
                <div key={a._id} className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${a.type === 'warning' ? 'bg-amber-100 text-amber-600' : a.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{a.type}</span>
                  <p className="flex-1 text-sm text-gray-700 dark:text-gray-300">{a.message}</p>
                  <button onClick={async () => {
                    await api.delete(`/admin/announcements/${a._id}`)
                    setAnnouncements(prev => prev.filter(x => x._id !== a._id))
                    toast.success('Removed')
                  }} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Ebooks */}
          {tab === 'ebooks' && <AdminEbooks />}
        </>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 overflow-y-auto"
            onClick={() => setEditModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl my-8">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Edit Listing</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Title</label>
                  <input type="text" value={editData.title || ''} onChange={e => setEditData({...editData, title: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Description</label>
                  <textarea value={editData.description || ''} onChange={e => setEditData({...editData, description: e.target.value})} rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Price</label>
                    <input type="number" value={editData.price || ''} onChange={e => setEditData({...editData, price: Number(e.target.value)})}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Category</label>
                    <select value={editData.category || ''} onChange={e => setEditData({...editData, category: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
                      <option value="">Select</option>
                      {['Books', 'Electronics', 'Furniture', 'Vehicles', 'Clothing', 'Sports', 'Others'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Condition</label>
                    <select value={editData.condition || ''} onChange={e => setEditData({...editData, condition: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
                      <option value="">Select</option>
                      {['New', 'Like New', 'Used'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Location</label>
                    <input type="text" value={editData.location || ''} onChange={e => setEditData({...editData, location: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editData.negotiable || false} onChange={e => setEditData({...editData, negotiable: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Negotiable</span>
                </label>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setEditModal(false)} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">Cancel</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={saveListing}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition">
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boost Modal */}
      <AnimatePresence>
        {boostModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            onClick={() => setBoostModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiZap className="w-5 h-5 text-yellow-500" /> Boost Listing
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select boost duration (unlimited for admins)</p>
              <div className="space-y-2 mb-4">
                {[7, 14, 30, 60, 90].map(days => (
                  <button key={days} onClick={() => setBoostDuration(days)}
                    className={`w-full py-2.5 rounded-xl text-sm font-medium transition ${boostDuration === days ? 'bg-yellow-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                    {days} Days
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setBoostModal(null)} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">Cancel</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => boostListing(boostModal)}
                  className="flex-1 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold transition">
                  Boost Now
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
