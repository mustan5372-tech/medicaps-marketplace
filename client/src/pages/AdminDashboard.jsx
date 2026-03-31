import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { FiTrash2, FiUserX, FiFlag, FiUsers, FiList, FiAlertTriangle } from 'react-icons/fi'

export default function AdminDashboard() {
  const [tab, setTab] = useState('listings')
  const [listings, setListings] = useState([])
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [lRes, uRes, rRes, sRes] = await Promise.all([
        api.get('/admin/listings'),
        api.get('/admin/users'),
        api.get('/admin/reports'),
        api.get('/admin/stats'),
      ])
      setListings(lRes.data.listings)
      setUsers(uRes.data.users)
      setReports(rRes.data.reports)
      setStats(sRes.data)
      setLoading(false)
    }
    load()
  }, [])

  const deleteListing = async (id) => {
    await api.delete(`/admin/listings/${id}`)
    setListings(listings.filter(l => l._id !== id))
    toast.success('Listing removed')
  }

  const banUser = async (id) => {
    await api.put(`/admin/users/${id}/ban`)
    setUsers(users.map(u => u._id === id ? { ...u, banned: true } : u))
    toast.success('User banned')
  }

  const resolveReport = async (id) => {
    await api.put(`/admin/reports/${id}/resolve`)
    setReports(reports.filter(r => r._id !== id))
    toast.success('Report resolved')
  }

  const TABS = [
    { id: 'listings', label: 'Listings', icon: FiList, count: listings.length },
    { id: 'users', label: 'Users', icon: FiUsers, count: users.length },
    { id: 'reports', label: 'Reports', icon: FiFlag, count: reports.length },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats.totalUsers, color: 'blue' },
          { label: 'Total Listings', value: stats.totalListings, color: 'purple' },
          { label: 'Active Chats', value: stats.activeChats, color: 'green' },
          { label: 'Reports', value: stats.totalReports, color: 'red' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{s.value ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${tab === t.id ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
            <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{t.count}</span>
          </button>
        ))}
      </div>

      {loading ? <div className="h-40 skeleton rounded-2xl" /> : (
        <>
          {tab === 'listings' && (
            <div className="space-y-3">
              {listings.map(l => (
                <div key={l._id} className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <img src={l.images?.[0] || 'https://via.placeholder.com/60'} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{l.title}</p>
                    <p className="text-sm text-gray-500">₹{l.price} · {l.category} · {l.seller?.name}</p>
                  </div>
                  <button onClick={() => deleteListing(l._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'users' && (
            <div className="space-y-3">
              {users.map(u => (
                <div key={u._id} className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shrink-0">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                  {u.banned ? (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">Banned</span>
                  ) : (
                    <button onClick={() => banUser(u._id)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                      <FiUserX className="w-4 h-4" /> Ban
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'reports' && (
            <div className="space-y-3">
              {reports.length === 0 && <p className="text-center text-gray-400 py-12">No pending reports</p>}
              {reports.map(r => (
                <div key={r._id} className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <FiAlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{r.listing?.title}</p>
                    <p className="text-sm text-gray-500">Reason: {r.reason} · By: {r.reporter?.name}</p>
                  </div>
                  <button onClick={() => resolveReport(r._id)} className="px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg hover:bg-green-100 transition">
                    Resolve
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}
