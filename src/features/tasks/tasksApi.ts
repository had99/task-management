import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@/lib/axiosBaseQuery'
import type { Task, CreateTaskDto, UpdateTaskDto } from '@/types'

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], string>({
      query: (projectId) => ({ url: `/projects/${projectId}/tasks` }),
      providesTags: (result, _error, projectId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Task' as const, id })),
              { type: 'Task' as const, id: `LIST-${projectId}` },
            ]
          : [{ type: 'Task' as const, id: `LIST-${projectId}` }],
    }),

    createTask: builder.mutation<Task, CreateTaskDto>({
      query: (body) => ({ url: '/tasks', method: 'post', data: body }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Task' as const, id: `LIST-${arg.projectId}` },
      ],
    }),

    // WHY: optimistic update cho trải nghiệm tức thì khi đổi status task
    // UI phản hồi ngay, undo nếu server fail thay vì chờ round-trip
    updateTask: builder.mutation<Task, UpdateTaskDto>({
      query: ({ id, projectId: _projectId, ...body }) => ({
        url: `/tasks/${id}`,
        method: 'patch',
        data: body,
      }),
      async onQueryStarted({ id, projectId, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          tasksApi.util.updateQueryData('getTasks', projectId, (draft) => {
            const task = draft.find((t) => t.id === id)
            if (task) {
              Object.assign(task, patch)
              task.updatedAt = new Date().toISOString()
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Task' as const, id }],
    }),

    deleteTask: builder.mutation<void, { id: string; projectId: string }>({
      query: ({ id }) => ({ url: `/tasks/${id}`, method: 'delete' }),
      invalidatesTags: (_result, _error, { id, projectId }) => [
        { type: 'Task' as const, id },
        { type: 'Task' as const, id: `LIST-${projectId}` },
      ],
    }),
  }),
})

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi
