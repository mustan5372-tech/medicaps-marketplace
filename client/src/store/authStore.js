import { create } from 'zustand'
import api from '../utils/api'

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) return set({ user: null })
    try {
      const res = await api.get('/auth/me')
      set({ user: res.data.user })
    } catch {
      localStorage.removeItem('token')
      set({ user: null })
    }
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const res = await api.post('/auth/login', { email, password })
      // Save token to localStorage for cross-origin auth
      if (res.data.token) localStorage.setItem('token', res.data.token)
      set({ user: res.data.user, loading: false })
      return { success: true }
    } catch (err) {
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
