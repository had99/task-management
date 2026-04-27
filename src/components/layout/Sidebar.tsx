import { ProjectSidebar } from '@/features/projects/ProjectSidebar'

// WHY: Sidebar là layout shell — ProjectSidebar (feature) được render bên trong
// Tách biệt để layout không phụ thuộc vào feature logic
export function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Projects
        </span>
      </div>
      <ProjectSidebar />
    </aside>
  )
}
