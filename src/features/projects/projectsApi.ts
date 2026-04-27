import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '@/lib/axiosBaseQuery'
import type { Project } from '@/types'

export const projectsApi = createApi({
  reducerPath: 'projectsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Project'],
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => ({ url: '/projects' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Project' as const, id })),
              { type: 'Project' as const, id: 'LIST' },
            ]
          : [{ type: 'Project' as const, id: 'LIST' }],
    }),

    getProjectById: builder.query<Project, string>({
      query: (id) => ({ url: `/projects/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Project' as const, id }],
    }),
  }),
})

export const { useGetProjectsQuery, useGetProjectByIdQuery } = projectsApi
