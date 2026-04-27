import axios from 'axios'
import type { AxiosError } from 'axios'

export interface ApiError {
  message: string
  status: number
  code: string
}

const TOKEN_KEY = 'token'

// WHY: 1 axiosInstance duy nhất đảm bảo mọi request đều qua interceptors
const axiosInstance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

// WHY: đọc token từ localStorage thay vì Redux store để tránh circular dependency
// Dependency chain: store → authSlice → axios → store (circular nếu import store ở đây)
// localStorage luôn đồng bộ với Redux state vì authSlice ghi vào cả hai
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status ?? 0

    if (status === 401) {
      // WHY: xóa token rồi redirect thay vì dispatch(logout())
      // Kết quả tương đương: khi app load lại tại /login, Redux sẽ đọc
      // localStorage (đã rỗng) nên auth state = null
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    }

    const normalized: ApiError = {
      message:
        (error.response?.data as { message?: string })?.message ??
        error.message ??
        'Unknown error',
      status,
      code: (error.response?.data as { code?: string })?.code ?? error.code ?? 'UNKNOWN',
    }

    return Promise.reject(normalized)
  }
)

export default axiosInstance
