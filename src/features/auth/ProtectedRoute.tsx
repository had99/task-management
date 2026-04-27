import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { selectIsAuthenticated } from '@/features/auth/authSlice'

export function ProtectedRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  // WHY: replace:true ngăn user bấm Back để về trang trước sau khi redirect
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
