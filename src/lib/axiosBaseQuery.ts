import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import type { AxiosRequestConfig } from 'axios'
import axiosInstance from '@/lib/axios'
import type { ApiError } from '@/lib/axios'

// WHY: shared axiosBaseQuery dùng chung cho mọi RTK Query API
// để không cần viết lại baseQuery ở mỗi createApi
export const axiosBaseQuery =
  (): BaseQueryFn<AxiosRequestConfig, unknown, ApiError> =>
  async ({ url = '', method = 'get', data, params }) => {
    try {
      const result = await axiosInstance({ url, method, data, params })
      return { data: result.data }
    } catch (error) {
      return { error: error as ApiError }
    }
  }
