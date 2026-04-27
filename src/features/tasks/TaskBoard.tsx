import { Suspense, useTransition, useState } from 'react'
import { useGetTasksQuery } from '@/features/tasks/tasksApi'
import {
  useSelectedProject,
  useStatusFilter,
  useSearchQuery,
  useModalState,
} from '@/stores/uiStore'
import { TaskCard } from './TaskCard'
import { TaskModal } from './TaskModal'
import { BoardSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { TaskStatus, Task } from '@/types'

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'todo',        label: 'Todo',        color: 'bg-gray-100' },
  { status: 'in-progress', label: 'In Progress', color: 'bg-blue-50' },
  { status: 'done',        label: 'Done',        color: 'bg-green-50' },
]

function KanbanColumn({ label, color, tasks, onTaskClick }: {
  label: string
  color: string
  tasks: Task[]
  onTaskClick: (id: string) => void
}) {
  return (
    <div className={`flex flex-col rounded-xl ${color} p-3`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-500">
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <p className="py-8 text-center text-xs text-gray-400">No tasks</p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task.id)} />
          ))
        )}
      </div>
    </div>
  )
}

function KanbanBoard({ projectId }: { projectId: string }) {
  const { data: tasks = [] } = useGetTasksQuery(projectId)
  const { statusFilter } = useStatusFilter()
  const { searchQuery } = useSearchQuery()
  const { openEditModal } = useModalState()

  const filteredTasks = tasks.filter((task) => {
    const matchStatus = statusFilter === 'all' || task.status === statusFilter
    const matchSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="grid h-full grid-cols-3 gap-4">
      {COLUMNS.map(({ status, label, color }) => (
        <KanbanColumn
          key={status}
          label={label}
          color={color}
          tasks={filteredTasks.filter((t) => t.status === status)}
          onTaskClick={openEditModal}
        />
      ))}
    </div>
  )
}

function FilterBar() {
  const { statusFilter, setStatusFilter } = useStatusFilter()
  const { setSearchQuery } = useSearchQuery()
  const { openCreateModal } = useModalState()
  const [isPending, startTransition] = useTransition()

  // WHY: inputValue local để input không lag khi typing
  // setSearchQuery bọc trong startTransition để board filter không block UI
  const [inputValue, setInputValue] = useState('')

  const handleSearch = (value: string) => {
    setInputValue(value)
    startTransition(() => {
      setSearchQuery(value)
    })
  }

  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex-1">
        <Input
          placeholder="Search tasks..."
          value={inputValue}
          onChange={(e) => handleSearch(e.target.value)}
          className={isPending ? 'opacity-70' : ''}
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
      >
        <option value="all">All Status</option>
        <option value="todo">Todo</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
      </select>
      <Button onClick={openCreateModal} size="sm">
        + New Task
      </Button>
    </div>
  )
}

export function TaskBoard() {
  const { selectedProjectId } = useSelectedProject()
  const { isModalOpen } = useModalState()

  if (!selectedProjectId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <div className="text-4xl">📋</div>
        <h3 className="text-lg font-semibold text-gray-700">Select a project</h3>
        <p className="text-sm text-gray-400">
          Choose a project from the sidebar to view tasks
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <FilterBar />
      {/* WHY: Suspense bọc KanbanBoard để hiển thị skeleton khi đang fetch tasks */}
      <div className="flex-1 overflow-auto">
        <Suspense fallback={<BoardSkeleton />}>
          <KanbanBoard projectId={selectedProjectId} />
        </Suspense>
      </div>
      {isModalOpen && <TaskModal projectId={selectedProjectId} />}
    </div>
  )
}
