import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// WHY: setupWorker chỉ dùng cho browser environment (Vite dev server)
export const worker = setupWorker(...handlers)
