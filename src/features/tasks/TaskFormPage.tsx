import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, type TaskFormValues } from '@/lib/validations/taskSchema'
import { useGetProjectsQuery } from '@/features/projects/projectsApi'
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUploadAttachmentMutation,
  useDeleteAttachmentMutation,
} from '@/features/tasks/tasksApi'
import { TaskBasicInfoFields } from '@/features/tasks/components/TaskBasicInfoFields'
import { TaskAttachmentField } from '@/features/tasks/components/TaskAttachmentField'
import { TaskFormActions } from '@/features/tasks/components/TaskFormActions'
import type { Attachment } from '@/types'

export function TaskFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const { data: projects = [] } = useGetProjectsQuery()
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation()
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation()
  const [uploadAttachment] = useUploadAttachmentMutation()
  const [deleteAttachment] = useDeleteAttachmentMutation()

  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>([])

  const {
    handleSubmit,
    control,
    reset,
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

  // Find the task being edited — search across all projects
  const { data: p1Tasks = [], isLoading: l1 } = useGetTasksQuery(projects[0]?.id ?? '', { skip: !isEdit || !projects[0] })
  const { data: p2Tasks = [], isLoading: l2 } = useGetTasksQuery(projects[1]?.id ?? '', { skip: !isEdit || !projects[1] })
  const { data: p3Tasks = [], isLoading: l3 } = useGetTasksQuery(projects[2]?.id ?? '', { skip: !isEdit || !projects[2] })

  const isLoadingTask = l1 || l2 || l3
  const editingTask = id ? [...p1Tasks, ...p2Tasks, ...p3Tasks].find((t) => t.id === id) : null

  useEffect(() => {
    if (editingTask) {
      reset({
        title: editingTask.title,
        description: editingTask.description ?? '',
        status: editingTask.status,
        projectId: editingTask.projectId,
        assigneeId: editingTask.assignee?.id ?? '',
      })
    }
  }, [editingTask, reset])

  // Existing attachments minus the ones marked for removal
  const existingAttachments: Attachment[] = (editingTask?.attachments ?? []).filter(
    (a) => !removedAttachmentIds.includes(a.id)
  )

  const isLoading = isCreating || isUpdating

  const onSubmit = async (data: TaskFormValues) => {
    let taskId: string

    if (isEdit && editingTask) {
      const { projectId: _ignored, ...fields } = data
      await updateTask({ id: editingTask.id, projectId: editingTask.projectId, ...fields })
      taskId = editingTask.id

      // Delete removed attachments
      await Promise.all(
        removedAttachmentIds.map((attachmentId) =>
          deleteAttachment({ taskId, attachmentId, projectId: editingTask.projectId })
        )
      )
    } else {
      const result = await createTask(data)
      if ('error' in result) return
      taskId = result.data.id
    }

    // Upload pending files sequentially to avoid race conditions in MSW
    for (const file of pendingFiles) {
      await uploadAttachment({ taskId, file })
    }

    navigate('/dashboard/tasks')
  }

  if (isEdit && isLoadingTask && !editingTask) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="size-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/tasks')}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          title="Back"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          {isEdit ? 'Edit Task' : 'New Task'}
        </h1>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <TaskBasicInfoFields
            control={control}
            errors={errors}
            projects={projects}
            isEdit={isEdit}
          />

          <TaskAttachmentField
            pendingFiles={pendingFiles}
            existingAttachments={existingAttachments}
            onAddFiles={(files) => setPendingFiles((prev) => [...prev, ...files])}
            onRemovePending={(index) =>
              setPendingFiles((prev) => prev.filter((_, i) => i !== index))
            }
            onRemoveExisting={(attachmentId) =>
              setRemovedAttachmentIds((prev) => [...prev, attachmentId])
            }
          />

          <TaskFormActions
            isEdit={isEdit}
            isLoading={isLoading}
            onCancel={() => navigate('/dashboard/tasks')}
          />
        </form>
      </div>
    </div>
  )
}
