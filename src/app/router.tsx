import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '@/features/auth/LoginPage'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { TaskBoard } from '@/features/tasks/TaskBoard'

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
          { path: '/', element: <TaskBoard /> },
        ],
      },
    ],
  },
])
