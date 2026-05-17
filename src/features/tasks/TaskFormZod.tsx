import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, type TaskFormValues } from '@/lib/validations/taskSchema'
import { useGetProjectsQuery } from '@/features/projects/projectsApi'
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from '@/features/tasks/tasksApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import type { TaskStatus } from '@/types'

const MOCK_USERS = [
  { id: 'u1', name: 'Alice Nguyen' },
  { id: 'u2', name: 'Bob Tran' },
  { id: 'u3', name: 'Carol Le' },
]

interface TaskFormZodProps {
  taskId: string | null
  onSuccess: () => void
}

export function TaskFormZod({ taskId, onSuccess }: TaskFormZodProps) {
  const { data: projects = [] } = useGetProjectsQuery()
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation()
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation()

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      projectId: '',
      assigneeId: '',
    },
  })

  const selectedProjectId = watch('projectId')
  const { data: projectTasks = [] } = useGetTasksQuery(selectedProjectId, {
    skip: !selectedProjectId || !taskId,
  })
  const editingTask = taskId ? projectTasks.find((t) => t.id === taskId) : null

  useEffect(() => {
    if (editingTask) {
      reset({
        title: editingTask.title,
        description: editingTask.description ?? '',
        status: editingTask.status,
        projectId: editingTask.projectId,
        assigneeId: editingTask.assignee?.id ?? '',
      })
    } else if (!taskId) {
      reset({ title: '', description: '', status: 'todo', projectId: '', assigneeId: '' })
    }
  }, [editingTask, taskId, reset])

  const isLoading = isCreating || isUpdating

  const onSubmit = async (data: TaskFormValues) => {
    if (taskId && editingTask) {
      const { projectId: _ignored, ...fields } = data
      await updateTask({ id: taskId, projectId: editingTask.projectId, ...fields })
    } else {
      await createTask(data)
    }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Input
        label="Title"
        placeholder="Task title"
        autoFocus
        error={errors.title?.message}
        {...register('title')}
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
          {...register('description')}
        />
        {errors.description && (
          <p className="text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Project</label>
        <select
          className={[
            'w-full rounded-md border px-3 py-2 text-sm outline-none bg-white',
            'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
            errors.projectId
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300',
          ].join(' ')}
          {...register('projectId')}
        >
          <option value="">Select a project...</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {errors.projectId && (
          <p className="text-xs text-red-600">{errors.projectId.message}</p>
        )}
      </div>

      <Controller
        name="status"
        control={control}
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
                    field.value === s ? 'ring-2 ring-blue-500 ring-offset-1' : 'opacity-60',
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

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Assignee</label>
        <select
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          {...register('assigneeId')}
        >
          <option value="">Unassigned</option>
          {MOCK_USERS.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" isLoading={isLoading}>
          {taskId ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  )
}
