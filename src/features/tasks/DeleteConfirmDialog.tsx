import { useDeleteTaskMutation } from '@/features/tasks/tasksApi'
import { Button } from '@/components/ui/Button'
import type { Task } from '@/types'

interface DeleteConfirmDialogProps {
  task: Task | null
  onClose: () => void
}

export function DeleteConfirmDialog({ task, onClose }: DeleteConfirmDialogProps) {
  const [deleteTask, { isLoading }] = useDeleteTaskMutation()

  if (!task) return null

  const handleDelete = async () => {
    await deleteTask({ id: task.id, projectId: task.projectId })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Delete Task</h2>
            <p className="mt-1 text-sm text-gray-600">
              Are you sure you want to delete{' '}
              <span className="font-medium">"{task.title}"</span>?{' '}
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" isLoading={isLoading} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
