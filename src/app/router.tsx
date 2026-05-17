import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '@/features/auth/LoginPage'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { TaskBoard } from '@/features/tasks/TaskBoard'
import { TasksPage } from '@/features/tasks/TasksPage'
import { TaskFormPage } from '@/features/tasks/TaskFormPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    // WHY: ProtectedRoute bọc toàn bộ /dashboard để đảm bảo auth
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <TaskBoard /> },
          { path: '/dashboard/tasks', element: <TasksPage /> },
          { path: '/dashboard/tasks/new', element: <TaskFormPage /> },
          { path: '/dashboard/tasks/:id/edit', element: <TaskFormPage /> },
          { path: '/', element: <TaskBoard /> },
        ],
      },
    ],
  },
])
