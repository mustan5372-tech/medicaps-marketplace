import axios from 'axios'

// Hardcoded Railway URL - no env var dependency
const BASE_URL = 'https://medicaps-backend-production.up.railway.app/api'

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
