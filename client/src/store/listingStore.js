import { create } from 'zustand'
import api from '../utils/api'

export const useListingStore = create((set, get) => ({
  listings: [],
  listing: null,
  loading: false,
  total: 0,
  page: 1,
  filters: { category: '', condition: '', minPrice: '', maxPrice: '', search: '', sort: 'latest' },

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters }, page: 1 }),
  setPage: (page) => set({ page }),

  fetchListings: async () => {
    set({ loading: true })
    const { filters, page } = get()
    const params = new URLSearchParams({ ...filters, page, limit: 12 })
    try {
      const res = await api.get(`/listings?${params}`)
      set({ listings: res.data.listings, total: res.data.total, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchListing: async (id) => {
    set({ loading: true })
    try {
      const res = await api.get(`/listings/${id}`)
      set({ listing: res.data.listing, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  createListing: async (data) => {
    const res = await api.post('/listings', data)
    return res.data
  },

  updateListing: async (id, data) => {
    const res = await api.put(`/listings/${id}`, data)
    return res.data
  },

  deleteListing: async (id) => {
    await api.delete(`/listings/${id}`)
    set({ listings: get().listings.filter(l => l._id !== id) })
  },

  reportListing: async (id, reason) => {
    await api.post(`/listings/${id}/report`, { reason })
  }
}))
