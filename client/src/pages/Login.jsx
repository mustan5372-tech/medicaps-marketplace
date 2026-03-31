import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import AnimatedPage from '../components/AnimatedPage'
import { staggerContainer, fadeUp } from '../utils/animations'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const { login, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await login(form.email, form.password)
    if (res.success) { toast.success('Welcome back!'); navigate('/') }
    else toast.error(res.message || 'Login failed')
  }

  return (
    <AnimatedPage className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <motion.div
        variants={staggerContainer(0.08, 0.1)}
        initial="hidden"
        animate="show"
        className="w-full max-w-md"
      >
        <motion.div variants={fadeUp} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
          <motion.div variants={fadeUp} className="text-center mb-8">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 shadow-lg shadow-blue-500/25"
            >M</motion.div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Sign in to MediCaps Marketplace</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div variants={fadeUp}>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">College Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@medicaps.ac.in"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
            </motion.div>

            <motion.div variants={fadeUp}>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-60 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-500/25"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </motion.button>
            </motion.div>
          </form>

          <motion.p variants={fadeUp} className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account? <Link to="/register" className="text-blue-600 font-medium hover:underline">Sign up</Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatedPage>
  )
}
