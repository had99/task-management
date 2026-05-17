import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import type { Task } from '@/types'

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-gray-100 animate-pulse" style={{ width: i === 0 ? '60%' : '80%' }} />
        </td>
      ))}
    </tr>
  )
}

interface TasksTableProps {
  tasks: Task[]
  projects: { id: string; name: string; color: string }[]
  isLoading?: boolean
  onEdit: (taskId: string) => void
  onDelete: (task: Task) => void
}

export function TasksTable({ tasks, projects, isLoading, onEdit, onDelete }: TasksTableProps) {
  const projectMap = new Map(projects.map((p) => [p.id, p]))

  return (
    <div className="overflow-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 w-36">Project</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 w-32">Status</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 w-36">Assignee</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 w-28">Updated</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 w-20">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
          ) : tasks.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-16 text-center text-sm text-gray-400">
                No tasks found. Try adjusting your filters.
              </td>
            </tr>
          ) : (
            tasks.map((task) => {
              const project = projectMap.get(task.projectId)
              return (
                <tr
                  key={task.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <button
                      className="text-left font-medium text-gray-900 hover:text-blue-600 transition-colors"
                      onClick={() => onEdit(task.id)}
                    >
                      {task.title}
                    </button>
                    {task.description && (
                      <p className="mt-0.5 text-xs text-gray-400 truncate max-w-xs">
                        {task.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {project ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="size-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="text-gray-700 truncate">{project.name}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={task.status} />
                  </td>
                  <td className="px-4 py-3">
                    {task.assignee ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Avatar user={task.assignee} size="sm" />
                        <span className="text-gray-700 truncate">{task.assignee.name}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {formatRelativeTime(task.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEdit(task.id)}
                        title="Edit"
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDelete(task)}
                        title="Delete"
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
