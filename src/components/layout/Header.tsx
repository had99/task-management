import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { logout, selectUser } from '@/features/auth/authSlice'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'

export function Header() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">Task Management</h1>
      <div className="flex items-center gap-3">
        {user && <Avatar user={user} size="md" />}
        <Button variant="ghost" size="sm" onClick={() => dispatch(logout())}>
          Logout
        </Button>
      </div>
    </header>
  )
}
