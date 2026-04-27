import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/types'
import axiosInstance from '@/lib/axios'

interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  error: string | null
}

const TOKEN_KEY = 'token'

// WHY: đọc token từ localStorage khi khởi tạo để duy trì session qua page refresh
const initialState: AuthState = {
  token: localStorage.getItem(TOKEN_KEY),
  user: null,
  isLoading: false,
  error: null,
}

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<{ token: string; user: User }>(
        '/auth/login',
        credentials
      )
      // WHY: lưu token vào localStorage ngay sau login để persist qua refresh
      localStorage.setItem(TOKEN_KEY, data.token)
      return data
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // WHY: logout xóa cả state lẫn localStorage để đảm bảo consistency
    logout(state) {
      state.token = null
      state.user = null
      state.error = null
      localStorage.removeItem(TOKEN_KEY)
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.token = action.payload.token
        state.user = action.payload.user
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error =
          (action.payload as { message?: string })?.message ?? 'Login failed'
      })
  },
})

export const { logout, setUser } = authSlice.actions
export default authSlice.reducer

export const selectToken = (state: { auth: AuthState }) => state.auth.token
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.token !== null
