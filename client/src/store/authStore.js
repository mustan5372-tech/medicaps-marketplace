import { create } from 'zustand'
import api from '../utils/api'

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,

  checkAuth: async () => {
    try {
      const res = await api.get('/auth/me')
      set({ user: res.data.user })
    } catch {
      set({ user: null })
    }
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const res = await api.post('/auth/login', { email, password })
      set({ user: res.data.user, loading: false })
      return { success: true }
    } catch (err) {
      set({ loading: false })
      return { success: false, message: err.response?.data?.message }
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
      return { success: false, message: err.response?.data?.message }
    }
  },

  logout: async () => {
    await api.post('/auth/logout')
    set({ user: null })
  },

  updateProfile: async (data) => {
    const res = await api.put('/auth/profile', data)
    set({ user: res.data.user })
  },
}))
