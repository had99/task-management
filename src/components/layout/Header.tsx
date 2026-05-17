import { NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { logout, selectUser } from '@/features/auth/authSlice'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'

export function Header() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-6">
        <h1 className="text-lg font-semibold text-gray-900">Task Management</h1>
        <nav className="flex items-center gap-1">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            Board
          </NavLink>
          <NavLink
            to="/dashboard/tasks"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            Tasks
          </NavLink>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {user && <Avatar user={user} size="md" />}
        <Button variant="ghost" size="sm" onClick={() => dispatch(logout())}>
          Logout
        </Button>
      </div>
    </header>
  )
}
