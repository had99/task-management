import { TaskFormZod } from '@/features/tasks/TaskFormZod'

interface TaskSlideOverProps {
  open: boolean
  taskId: string | null
  onClose: () => void
}

export function TaskSlideOver({ open, taskId, onClose }: TaskSlideOverProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={[
          'fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl',
          'transform transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {taskId ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-6 h-[calc(100%-65px)]">
          {open && (
            <TaskFormZod taskId={taskId} onSuccess={onClose} />
          )}
        </div>
      </div>
    </>
  )
}
