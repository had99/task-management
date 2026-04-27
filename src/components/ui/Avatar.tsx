import type { User } from '@/types'

interface AvatarProps {
  user: User | null
  size?: 'sm' | 'md'
}

const sizeClasses = { sm: 'size-6', md: 'size-8' }

export function Avatar({ user, size = 'sm' }: AvatarProps) {
  if (!user) return null
  return (
    <img
      src={user.avatar}
      alt={user.name}
      title={user.name}
      className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white`}
    />
  )
}
