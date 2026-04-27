import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
import { projectsApi } from '@/features/projects/projectsApi'
import { tasksApi } from '@/features/tasks/tasksApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // WHY: RTK Query cần reducer riêng để quản lý cache, loading, error state
    [projectsApi.reducerPath]: projectsApi.reducer,
    [tasksApi.reducerPath]: tasksApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // WHY: RTK Query dùng một số non-serializable value nội bộ
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
    // WHY: RTK Query middleware cần thiết cho cache invalidation, polling, prefetching
    .concat(projectsApi.middleware, tasksApi.middleware),
})

export type AppStore = typeof store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
