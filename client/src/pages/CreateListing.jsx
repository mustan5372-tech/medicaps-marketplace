import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { useListingStore } from '../store/listingStore'
import toast from 'react-hot-toast'
import { FiUpload, FiX } from 'react-icons/fi'
import api from '../utils/api'

const CATEGORIES = ['Books', 'Electronics', 'Furniture', 'Vehicles', 'Clothing', 'Sports', 'Others']
const CONDITIONS = ['New', 'Like New', 'Used']
const LOCATIONS = ['Boys Hostel', 'Girls Hostel', 'Main Block', 'Library', 'Canteen Area', 'Sports Ground', 'Other']

import AnimatedPage from '../components/AnimatedPage'

export default function CreateListing() {
  const navigate = useNavigate()
  const { createListing } = useListingStore()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [form, setForm] = useState({ title: '', description: '', price: '', category: 'Books', condition: 'Used', location: 'Main Block' })

  const onDrop = useCallback((files) => {
    const newFiles = files.slice(0, 5 - images.length)
    setImages(prev => [...prev, ...newFiles])
    setPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))])
  }, [images])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, maxFiles: 5 })

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (images.length === 0) { toast.error('Add at least one image'); return }
    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, v))
      images.forEach(img => formData.append('images', img))
      const res = await api.post('/listings', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Listing created!')
      navigate(`/listing/${res.data.listing._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing')
    } finally { setLoading(false) }
  }

  return (
    <AnimatedPage className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Post a Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image Upload */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Photos (up to 5)</label>
          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'}`}>
            <input {...getInputProps()} />
            <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Drag & drop or click to upload</p>
          </div>
          {previews.length > 0 && (
            <div className="flex gap-3 mt-3 flex-wrap">
              {previews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 p-0.5 bg-red-500 rounded-full text-white">
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Title</label>
          <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Engineering Mathematics Book"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Description</label>
          <textarea required rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your item..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition resize-none" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Price (₹)</label>
          <input type="number" required min={0} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0"
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
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Location on Campus</label>
          <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition">
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition">
          {loading ? 'Posting...' : 'Post Listing'}
        </motion.button>
      </form>
    </AnimatedPage>
  )
}
