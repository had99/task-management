import { useAppSelector } from '@/app/hooks'
import { selectIsAuthenticated, selectUser, selectToken } from '@/features/auth/authSlice'

export function useAuth() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectUser)
  const token = useAppSelector(selectToken)
  return { isAuthenticated, user, token }
}
