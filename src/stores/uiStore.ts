import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type { TaskStatus } from '@/types'

interface FilterSlice {
  statusFilter: TaskStatus | 'all'
  searchQuery: string
  setStatusFilter: (filter: TaskStatus | 'all') => void
  setSearchQuery: (query: string) => void
  resetFilters: () => void
}

interface ModalSlice {
  isModalOpen: boolean
  editingTaskId: string | null
  openCreateModal: () => void
  openEditModal: (taskId: string) => void
  closeModal: () => void
}

interface SidebarSlice {
  selectedProjectId: string | null
  setSelectedProject: (id: string | null) => void
}

type UIStore = FilterSlice & ModalSlice & SidebarSlice

// WHY: devtools bao ngoài để theo dõi action trong Redux DevTools Extension
// persist bao bên trong để log action persist/rehydrate
export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        // Filter slice
        statusFilter: 'all',
        searchQuery: '',
        setStatusFilter: (filter) =>
          set({ statusFilter: filter }, false, 'setStatusFilter'),
        setSearchQuery: (query) =>
          set({ searchQuery: query }, false, 'setSearchQuery'),
        resetFilters: () =>
          set({ statusFilter: 'all', searchQuery: '' }, false, 'resetFilters'),

        // Modal slice
        isModalOpen: false,
        editingTaskId: null,
        openCreateModal: () =>
          set({ isModalOpen: true, editingTaskId: null }, false, 'openCreateModal'),
        openEditModal: (taskId) =>
          set({ isModalOpen: true, editingTaskId: taskId }, false, 'openEditModal'),
        closeModal: () =>
          set({ isModalOpen: false, editingTaskId: null }, false, 'closeModal'),

        // Sidebar slice
        selectedProjectId: null,
        setSelectedProject: (id) =>
          set({ selectedProjectId: id }, false, 'setSelectedProject'),
      }),
      {
        name: 'ui-storage',
        storage: createJSONStorage(() => localStorage),
        // WHY: chỉ persist selectedProjectId, không persist modal/filter state
        // Modal mở lại sau F5 gây UX kỳ lạ; filter nên reset để fresh start
        partialize: (state) => ({
          selectedProjectId: state.selectedProjectId,
        }),
      }
    ),
    {
      name: 'UIStore',
      enabled: import.meta.env.DEV,
    }
  )
)

// WHY: export selector hooks riêng để components chỉ subscribe vào phần state cần thiết
// useShallow bắt buộc vì selector trả về object mới mỗi lần render —
// nếu không có shallow comparison, Zustand sẽ trigger re-render vô tận (infinite loop)

export const useStatusFilter = () =>
  useUIStore(
    useShallow((state) => ({
      statusFilter: state.statusFilter,
      setStatusFilter: state.setStatusFilter,
    }))
  )

export const useSearchQuery = () =>
  useUIStore(
    useShallow((state) => ({
      searchQuery: state.searchQuery,
      setSearchQuery: state.setSearchQuery,
    }))
  )

export const useModalState = () =>
  useUIStore(
    useShallow((state) => ({
      isModalOpen: state.isModalOpen,
      editingTaskId: state.editingTaskId,
      openCreateModal: state.openCreateModal,
      openEditModal: state.openEditModal,
      closeModal: state.closeModal,
    }))
  )

export const useSelectedProject = () =>
  useUIStore(
    useShallow((state) => ({
      selectedProjectId: state.selectedProjectId,
      setSelectedProject: state.setSelectedProject,
    }))
  )
