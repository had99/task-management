import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

// WHY: typed hooks thay vì useDispatch/useSelector thông thường
// để không cần type annotation ở mỗi component
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
