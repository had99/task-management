import type { TaskStatus } from '@/types'

interface BadgeProps {
  status: TaskStatus
}

const badgeConfig: Record<TaskStatus, { label: string; className: string }> = {
  'todo':        { label: 'Todo',        className: 'bg-gray-100 text-gray-700' },
  'in-progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  'done':        { label: 'Done',        className: 'bg-green-100 text-green-700' },
}

export function Badge({ status }: BadgeProps) {
  const { label, className } = badgeConfig[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
