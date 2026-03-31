import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useListingStore } from '../store/listingStore'
import toast from 'react-hot-toast'
import api from '../utils/api'

const CATEGORIES = ['Books', 'Electronics', 'Furniture', 'Vehicles', 'Clothing', 'Sports', 'Others']
const CONDITIONS = ['New', 'Like New', 'Used']
const LOCATIONS = ['Boys Hostel', 'Girls Hostel', 'Main Block', 'Library', 'Canteen Area', 'Sports Ground', 'Other']

export default function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchListing, listing } = useListingStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', price: '', category: 'Books', condition: 'Used', location: 'Main Block' })

  useEffect(() => { fetchListing(id) }, [id])
  useEffect(() => {
    if (listing) setForm({ title: listing.title, description: listing.description, price: listing.price, category: listing.category, condition: listing.condition, location: listing.location })
  }, [listing])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put(`/listings/${id}`, form)
      toast.success('Listing updated!')
      navigate(`/listing/${id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally { setLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Title</label>
          <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Description</label>
          <textarea required rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition resize-none" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Price (₹)</label>
          <input type="number" required min={0} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Condition</label>
            <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition">
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Location</label>
          <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition">
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition">
          {loading ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </form>
    </motion.div>
  )
}
