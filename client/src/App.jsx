import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import { trackPageView } from './utils/analytics'

import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ListingDetail from './pages/ListingDetail'
import CreateListing from './pages/CreateListing'
import EditListing from './pages/EditListing'
import Profile from './pages/Profile'
import Chat from './pages/Chat'
import AdminDashboard from './pages/AdminDashboard'
import SavedListings from './pages/SavedListings'
import Leaderboard from './pages/Leaderboard'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'

import FloatingPostButton from './components/FloatingPostButton'

function AnimatedRoutes() {
  const location = useLocation()
  useEffect(() => { trackPageView(location.pathname) }, [location])
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/edit-listing/:id" element={<EditListing />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:userId" element={<Chat />} />
          <Route path="/saved" element={<SavedListings />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  const { checkAuth, initialized } = useAuthStore()
  const { dark, glass } = useThemeStore()

  useEffect(() => { checkAuth().catch(() => {}) }, [])

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [dark])

  useEffect(() => {
    if (glass) document.documentElement.setAttribute('data-glass', 'true')
    else document.documentElement.removeAttribute('data-glass')
  }, [glass])

  if (!initialized) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <BrowserRouter>
        <Navbar />
        <Toaster position="top-right" toastOptions={{ duration: 3000,
          style: { borderRadius: '12px', background: dark ? '#1f2937' : '#fff', color: dark ? '#f9fafb' : '#111827' }
        }} />
        <AnimatedRoutes />
        <FloatingPostButton />
      </BrowserRouter>
    </div>
  )
}
