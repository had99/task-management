import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import type { Task } from '@/types'

interface TaskCardProps {
  task: Task
  onClick: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full rounded-lg border border-gray-200 bg-white p-3 text-left',
        'shadow-sm transition-shadow hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
      ].join(' ')}
    >
      <p className="mb-2 line-clamp-2 text-sm font-medium text-gray-900">
        {task.title}
      </p>
      {task.description && (
        <p className="mb-2 line-clamp-2 text-xs text-gray-500">{task.description}</p>
      )}
      <div className="flex items-center justify-between">
        <Badge status={task.status} />
        <Avatar user={task.assignee} size="sm" />
      </div>
    </button>
  )
}
