import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const ADMIN_ROLES = ['admin', 'super_admin', 'ebook_uploader']

export default function AdminRoute() {
  const { user } = useAuthStore()
  return ADMIN_ROLES.includes(user?.role) ? <Outlet /> : <Navigate to="/" replace />
}
