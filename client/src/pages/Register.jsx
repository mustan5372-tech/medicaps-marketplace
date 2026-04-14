import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const { register, loading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const redirect = new URLSearchParams(location.search).get('redirect') || '/'
  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await register(form)
    if (res.success) { toast.success('Account created!'); navigate('/login' + (redirect !== '/' ? '?redirect=' + encodeURIComponent(redirect) : '')) }
    else toast.error(res.message || 'Failed')
  }
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" required placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500" />
          <input type="email" required placeholder="you@medicaps.ac.in" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500" />
          <input type="password" required minLength={6} placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500" />
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl">{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">Already have an account? <Link to="/login" className="text-blue-600">Sign in</Link></p>
      </div>
    </motion.div>
  )
}
