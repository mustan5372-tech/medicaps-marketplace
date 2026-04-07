import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import { useEffect, lazy, Suspense } from 'react'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import { trackPageView } from './utils/analytics'

import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import FloatingPostButton from './components/FloatingPostButton'
import ScrollProgress from './components/ScrollProgress'

// Lazy load all pages — splits into separate chunks
const Home           = lazy(() => import('./pages/Home'))
const Login          = lazy(() => import('./pages/Login'))
const Register       = lazy(() => import('./pages/Register'))
const ListingDetail  = lazy(() => import('./pages/ListingDetail'))
const CreateListing  = lazy(() => import('./pages/CreateListing'))
const EditListing    = lazy(() => import('./pages/EditListing'))
const Profile        = lazy(() => import('./pages/Profile'))
const Chat           = lazy(() => import('./pages/Chat'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const SavedListings  = lazy(() => import('./pages/SavedListings'))
const Leaderboard    = lazy(() => import('./pages/Leaderboard'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword  = lazy(() => import('./pages/ResetPassword'))
const VerifyEmail    = lazy(() => import('./pages/VerifyEmail'))
const Ebooks         = lazy(() => import('./pages/Ebooks'))

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  useEffect(() => { 
    trackPageView(location.pathname)
    window.scrollTo(0, 0)
  }, [location])
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<PageLoader />}>
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
            <Route path="/ebooks" element={<Ebooks />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Suspense>
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
    <div className="min-h-screen transition-colors duration-300">
      <BrowserRouter>
        <ScrollProgress />
        <Navbar />
        <Toaster position="top-right" toastOptions={{ duration: 3000,
          style: {
            borderRadius: '12px',
            background: glass ? 'rgba(255,255,255,0.65)' : dark ? '#1f2937' : '#fff',
            color: dark && !glass ? '#f9fafb' : '#111827',
            backdropFilter: glass ? 'blur(20px)' : 'none',
            border: glass ? '1px solid rgba(255,255,255,0.3)' : 'none',
            boxShadow: glass ? '0 8px 32px rgba(99,102,241,0.15)' : undefined,
          }
        }} />
        <AnimatedRoutes />
        <FloatingPostButton />
      </BrowserRouter>
    </div>
  )
}
