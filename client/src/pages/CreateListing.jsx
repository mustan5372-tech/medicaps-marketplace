import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { FiUpload, FiX, FiLoader } from 'react-icons/fi'
import api from '../utils/api'
import AnimatedPage from '../components/AnimatedPage'
import { compressImage } from '../utils/imageCompress'
import { analytics } from '../utils/analytics'
import FakeListingWarning from '../components/FakeListingWarning'

const CATEGORIES = ['Books', 'Electronics', 'Furniture', 'Vehicles', 'Clothing', 'Sports', 'Others']
const CONDITIONS = ['New', 'Like New', 'Used']
const LOCATIONS = ['Boys Hostel', 'Girls Hostel', 'Main Block', 'Library', 'Canteen Area', 'Sports Ground', 'Other']

export default function CreateListing() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [showWarning, setShowWarning] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const [hashtags, setHashtags] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', price: '',
    category: 'Books', condition: 'Used',
    location: 'Main Block', negotiable: false
  })

  const onDrop = useCallback(async (files) => {
    const newFiles = files.slice(0, 5 - images.length)
    setCompressing(true)
    try {
      const compressed = await Promise.all(newFiles.map(f => compressImage(f)))
      setImages(prev => [...prev, ...compressed])
      setPreviews(prev => [...prev, ...compressed.map(f => URL.createObjectURL(f))])
    } finally {
      setCompressing(false)
    }
  }, [images])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 5
  })

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (images.length === 0) { toast.error('Add at least one image'); return }
    setShowWarning(true)
  }

  const doSubmit = async () => {
    setShowWarning(false)
    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, v))
      images.forEach(img => formData.append('images', img))
      selectedTags.forEach(tag => formData.append('tags', tag))
      hashtags.split(/[\s,]+/).filter(h => h.startsWith('#')).forEach(h => formData.append('hashtags', h.replace('#', '')))
      const res = await api.post('/listings', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      analytics.postListing(form.category, form.price)
      toast.success('Listing posted!')
      navigate(`/listing/${res.data.listing._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing')
    } finally { setLoading(false) }
  }

  return (
    <AnimatedPage className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Sell something</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Fill in the details and your listing goes live instantly.</p>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Image Upload */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Photos (up to 5) <span className="text-gray-400 font-normal">— auto compressed</span>
          </label>
          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'}`}>
            <input {...getInputProps()} />
            {compressing
              ? <div className="flex items-center justify-center gap-2 text-blue-500"><FiLoader className="w-5 h-5 animate-spin" /> Compressing...</div>
              : <><FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" /><p className="text-sm text-gray-500 dark:text-gray-400">Drag & drop or click to upload</p></>
            }
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
          <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Engineering Mathematics Book" className="input" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Description</label>
          <textarea required rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your item..." className="input resize-none" />
        </div>

        {/* Price + Negotiable */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Price (₹)</label>
          <div className="flex gap-3 items-center">
            <input type="number" required min={0} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
              placeholder="0" className="input flex-1" />
            <label className="flex items-center gap-2 cursor-pointer shrink-0 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 transition">
              <div className={`w-10 h-5 rounded-full transition-colors relative ${form.negotiable ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                onClick={() => setForm({ ...form, negotiable: !form.negotiable })}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.negotiable ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Negotiable</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Condition</label>
            <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} className="input">
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Location on Campus</label>
          <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input">
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Tags <span className="text-gray-400 font-normal">(optional)</span></label>
          <div className="flex gap-2 flex-wrap">
            {[{ value: 'urgent', label: '🔥 Urgent', color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' },
              { value: 'best-deal', label: '💰 Best Deal', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' }
            ].map(tag => (
              <button key={tag.value} type="button"
                onClick={() => setSelectedTags(prev => prev.includes(tag.value) ? prev.filter(t => t !== tag.value) : [...prev, tag.value])}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition ${selectedTags.includes(tag.value) ? tag.color : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}>
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Hashtags <span className="text-gray-400 font-normal">(optional)</span></label>
          <input value={hashtags} onChange={e => setHashtags(e.target.value)}
            placeholder="#hostel #semester5 #urgent"
            className="input" />
          <p className="text-xs text-gray-400 mt-1">Separate with spaces. Start each with #</p>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading || compressing}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-500/25">
          {loading ? 'Posting...' : 'Post listing'}
        </motion.button>
      </form>
      {showWarning && <FakeListingWarning onConfirm={doSubmit} onCancel={() => setShowWarning(false)} />}
    </AnimatedPage>
  )
}
