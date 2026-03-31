import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://medicaps-backend-production.up.railway.app/api'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

export default api
