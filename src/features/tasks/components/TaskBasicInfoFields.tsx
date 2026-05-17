import { Controller } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import type { TaskFormValues } from '@/lib/validations/taskSchema'
import type { Project, TaskStatus } from '@/types'

const MOCK_USERS = [
  { id: 'u1', name: 'Alice Nguyen' },
  { id: 'u2', name: 'Bob Tran' },
  { id: 'u3', name: 'Carol Le' },
]

interface TaskBasicInfoFieldsProps {
  control: Control<TaskFormValues>
  errors: FieldErrors<TaskFormValues>
  projects: Project[]
  isEdit: boolean
}

export function TaskBasicInfoFields({
  control,
  errors,
  projects,
  isEdit,
}: TaskBasicInfoFieldsProps) {
  return (
    <>
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <Input
            label="Title"
            placeholder="Task title"
            autoFocus
            error={errors.title?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              placeholder="Optional description..."
              rows={4}
              className={[
                'w-full rounded-md border px-3 py-2 text-sm outline-none resize-none',
                'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
                errors.description
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300',
              ].join(' ')}
              {...field}
            />
            {errors.description && (
              <p className="text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        name="projectId"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Project</label>
            <select
              disabled={isEdit}
              className={[
                'w-full rounded-md border px-3 py-2 text-sm outline-none bg-white',
                'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
                isEdit ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : '',
                errors.projectId
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300',
              ].join(' ')}
              {...field}
            >
              <option value="">Select a project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {isEdit && (
              <p className="text-xs text-gray-400">Project cannot be changed after creation.</p>
            )}
            {errors.projectId && (
              <p className="text-xs text-red-600">{errors.projectId.message}</p>
            )}
          </div>
        )}
      />

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
                    field.value === s
                      ? 'ring-2 ring-blue-500 ring-offset-1'
                      : 'opacity-60 hover:opacity-80',
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

      <Controller
        name="assigneeId"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Assignee</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              {...field}
            >
              <option value="">Unassigned</option>
              {MOCK_USERS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        )}
      />
    </>
  )
}
