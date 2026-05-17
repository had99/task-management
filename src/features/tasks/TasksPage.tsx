import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetProjectsQuery } from '@/features/projects/projectsApi'
import { useGetTasksQuery } from '@/features/tasks/tasksApi'
import { TasksTable } from '@/features/tasks/TasksTable'
import { DeleteConfirmDialog } from '@/features/tasks/DeleteConfirmDialog'
import { Button } from '@/components/ui/Button'
import type { Task, TaskStatus } from '@/types'

function AllProjectsTasksLoader({
  projectIds,
  children,
}: {
  projectIds: string[]
  children: (tasks: Task[], isLoading: boolean) => React.ReactNode
}) {
  const r0 = useGetTasksQuery(projectIds[0] ?? '', { skip: !projectIds[0] })
  const r1 = useGetTasksQuery(projectIds[1] ?? '', { skip: !projectIds[1] })
  const r2 = useGetTasksQuery(projectIds[2] ?? '', { skip: !projectIds[2] })

  const tasks = useMemo(
    () => [...(r0.data ?? []), ...(r1.data ?? []), ...(r2.data ?? [])],
    [r0.data, r1.data, r2.data]
  )
  const isLoading = r0.isLoading || r1.isLoading || r2.isLoading

  return <>{children(tasks, isLoading)}</>
}

function SingleProjectTasks({
  projectId,
  children,
}: {
  projectId: string
  children: (tasks: Task[], isLoading: boolean) => React.ReactNode
}) {
  const { data: tasks = [], isLoading } = useGetTasksQuery(projectId)
  return <>{children(tasks, isLoading)}</>
}

export function TasksPage() {
  const navigate = useNavigate()
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [filterProjectId, setFilterProjectId] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: projects = [] } = useGetProjectsQuery()

  const filterTasks = (tasks: Task[]) =>
    tasks.filter((t) => {
      if (filterStatus !== 'all' && t.status !== filterStatus) return false
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })

  const renderContent = (allTasks: Task[], isLoading: boolean) => {
    const filtered = filterTasks(allTasks)
    return (
      <TasksTable
        tasks={filtered}
        projects={projects}
        isLoading={isLoading}
        onEdit={(taskId) => navigate(`/dashboard/tasks/${taskId}/edit`)}
        onDelete={(task) => setDeletingTask(task)}
      />
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
        <Button onClick={() => navigate('/dashboard/tasks/new')}>+ New Task</Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-52"
        />

        <select
          value={filterProjectId}
          onChange={(e) => setFilterProjectId(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Projects</option>
          {projects.length === 0 ? (
            <option disabled>No projects</option>
          ) : (
            projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))
          )}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        {(searchQuery || filterProjectId !== 'all' || filterStatus !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('')
              setFilterProjectId('all')
              setFilterStatus('all')
            }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      {filterProjectId === 'all' ? (
        <AllProjectsTasksLoader projectIds={projects.map((p) => p.id)}>
          {renderContent}
        </AllProjectsTasksLoader>
      ) : (
        <SingleProjectTasks projectId={filterProjectId}>
          {renderContent}
        </SingleProjectTasks>
      )}

      {/* Delete confirm */}
      <DeleteConfirmDialog
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
      />
    </div>
  )
}
