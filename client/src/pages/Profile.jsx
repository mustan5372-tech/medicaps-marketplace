import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'
import ListingCard from '../components/ListingCard'
import toast from 'react-hot-toast'

export default function Profile() {
  const { id } = useParams()
  const { user, updateProfile } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const isOwn = user?._id === id

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [pRes, lRes] = await Promise.all([api.get(`/users/${id}`), api.get(`/listings?seller=${id}&limit=20`)])
      setProfile(pRes.data.user)
      setListings(lRes.data.listings)
      setName(pRes.data.user.name)
      setLoading(false)
    }
    load()
  }, [id])

  const handleSave = async () => {
    await updateProfile({ name })
    setProfile({ ...profile, name })
    setEditing(false)
    toast.success('Profile updated')
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="h-32 skeleton rounded-2xl mb-6" /></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {profile?.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          {editing ? (
            <div className="flex gap-2">
              <input value={name} onChange={e => setName(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500" />
              <button onClick={handleSave} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg">Save</button>
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm rounded-lg">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{profile?.name}</h1>
              {isOwn && <button onClick={() => setEditing(true)} className="text-xs text-blue-600 hover:underline">Edit</button>}
            </div>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{profile?.email}</p>
          <p className="text-xs text-gray-400 mt-1">{listings.length} listings</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {isOwn ? 'My Listings' : `${profile?.name}'s Listings`}
      </h2>
      {listings.length === 0
        ? <p className="text-gray-400 text-center py-12">No listings yet</p>
        : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map(l => <ListingCard key={l._id} listing={l} />)}
          </div>
      }
    </motion.div>
  )
}
