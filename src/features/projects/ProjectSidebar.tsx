import { useGetProjectsQuery } from '@/features/projects/projectsApi'
import { useSelectedProject } from '@/stores/uiStore'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Project } from '@/types'

function ProjectItem({ project, isSelected, onSelect }: {
  project: Project
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={[
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
        isSelected
          ? 'bg-blue-50 font-medium text-blue-700'
          : 'text-gray-700 hover:bg-gray-50',
      ].join(' ')}
    >
      <span
        className="size-2.5 flex-shrink-0 rounded-full"
        style={{ backgroundColor: project.color }}
      />
      <span className="flex-1 truncate">{project.name}</span>
      <span className={`text-xs ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>
        {project.taskCount}
      </span>
    </button>
  )
}

export function ProjectSidebar() {
  const { data: projects, isLoading, isError } = useGetProjectsQuery()
  const { selectedProjectId, setSelectedProject } = useSelectedProject()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-lg" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <div className="p-4 text-sm text-red-600">Failed to load projects</div>
  }

  return (
    <nav className="flex flex-col gap-1 p-3">
      {projects?.map((project) => (
        <ProjectItem
          key={project.id}
          project={project}
          isSelected={project.id === selectedProjectId}
          onSelect={() => setSelectedProject(project.id)}
        />
      ))}
    </nav>
  )
}
