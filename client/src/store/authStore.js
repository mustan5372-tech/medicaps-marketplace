import { create } from 'zustand'
import api from '../utils/api'

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  initialized: false, // prevents flash of logged-out state on refresh

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    // If no token in localStorage, still try — cookie might be valid
    if (!token) {
      // Quick check via cookie (cross-origin with credentials)
      try {
        const res = await api.get('/auth/me')
        // Cookie worked — save token if returned
        if (res.data.token) localStorage.setItem('token', res.data.token)
        set({ user: res.data.user, initialized: true })
      } catch {
        set({ user: null, initialized: true })
      }
      return
    }
    try {
      const res = await api.get('/auth/me')
      set({ user: res.data.user, initialized: true })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, initialized: true })
    }
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const res = await api.post('/auth/login', { email, password })
      if (res.data.token) localStorage.setItem('token', res.data.token)
      set({ user: res.data.user, loading: false })
      return { success: true }
    } catch (err) {
      // If network error (server cold start), retry once after 3s
      if (!err.response) {
        try {
          await new Promise(r => setTimeout(r, 3000))
          const res = await api.post('/auth/login', { email, password })
          if (res.data.token) localStorage.setItem('token', res.data.token)
          set({ user: res.data.user, loading: false })
          return { success: true }
        } catch (retryErr) {
          set({ loading: false })
          return { success: false, status: retryErr.response?.status, message: retryErr.response?.data?.message || 'Server is waking up, please try again in a moment' }
        }
      }
      set({ loading: false })
      return { success: false, status: err.response?.status, message: err.response?.data?.message || 'Login failed' }
    }
  },

  register: async (data) => {
    set({ loading: true })
    try {
      const res = await api.post('/auth/register', data)
      set({ loading: false })
      return { success: true, message: res.data.message }
    } catch (err) {
      set({ loading: false })
      return { success: false, message: err.response?.data?.message || 'Registration failed' }
    }
  },

  logout: async () => {
    try { await api.post('/auth/logout') } catch {}
    localStorage.removeItem('token')
    set({ user: null })
  },

  updateProfile: async (data) => {
    const res = await api.put('/auth/profile', data)
    set({ user: res.data.user })
  },
}))
