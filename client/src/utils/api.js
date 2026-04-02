import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://medicaps-backend-7cwm.onrender.com/api'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

// Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
