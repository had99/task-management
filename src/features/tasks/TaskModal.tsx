import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useModalState } from '@/stores/uiStore'
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from '@/features/tasks/tasksApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import type { TaskStatus } from '@/types'

interface TaskFormValues {
  title: string
  description: string
  status: TaskStatus
}

interface TaskModalProps {
  projectId: string
}

export function TaskModal({ projectId }: TaskModalProps) {
  const { isModalOpen, editingTaskId, closeModal } = useModalState()
  const { data: tasks = [] } = useGetTasksQuery(projectId)
  const editingTask = editingTaskId ? tasks.find((t) => t.id === editingTaskId) : null

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation()
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation()
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    defaultValues: { title: '', description: '', status: 'todo' },
  })

  // Pre-fill form khi chuyển sang edit mode
  useEffect(() => {
    if (editingTask) {
      reset({
        title: editingTask.title,
        description: editingTask.description ?? '',
        status: editingTask.status,
      })
    } else {
      reset({ title: '', description: '', status: 'todo' })
    }
  }, [editingTask, reset])

  if (!isModalOpen) return null

  const onSubmit = async (data: TaskFormValues) => {
    if (editingTask) {
      await updateTask({ id: editingTask.id, projectId, ...data })
    } else {
      await createTask({ projectId, ...data })
    }
    closeModal()
  }

  const handleDelete = async () => {
    if (!editingTask) return
    await deleteTask({ id: editingTask.id, projectId })
    closeModal()
  }

  const isLoading = isCreating || isUpdating

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-base font-semibold text-gray-900">
            {editingTask ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={closeModal}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-5">
          <Input
            label="Title"
            placeholder="Task title"
            autoFocus
            error={errors.title?.message}
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 2, message: 'Title must be at least 2 characters' },
              maxLength: { value: 100, message: 'Title must be under 100 characters' },
            })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              placeholder="Optional description..."
              rows={3}
              className={[
                'w-full rounded-md border px-3 py-2 text-sm outline-none',
                'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
                errors.description
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300',
              ].join(' ')}
              {...register('description', {
                maxLength: { value: 500, message: 'Description must be under 500 characters' },
              })}
            />
            {errors.description && (
              <p className="text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Status — dùng Controller vì là custom button group, không phải native input */}
          <Controller
            name="status"
            control={control}
            rules={{ required: 'Status is required' }}
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="flex gap-2">
                  {(['todo', 'in-progress', 'done'] as TaskStatus[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => field.onChange(s)}
                      className={[
                        'rounded-full px-3 py-1 text-xs transition-all',
                        field.value === s
                          ? 'ring-2 ring-blue-500 ring-offset-1'
                          : 'opacity-60',
                      ].join(' ')}
                    >
                      <Badge status={s} />
                    </button>
                  ))}
                </div>
                {errors.status && (
                  <p className="text-xs text-red-600">{errors.status.message}</p>
                )}
              </div>
            )}
          />

          <div className="flex items-center justify-between pt-2">
            <div>
              {editingTask && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  isLoading={isDeleting}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isLoading}>
                {editingTask ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
