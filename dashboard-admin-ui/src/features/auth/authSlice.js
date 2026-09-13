import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getCurrentUser, loginRequest } from '../../services/authService'
import { getApiErrorMessage } from '../../services/serviceUtils'

const storedToken = localStorage.getItem('accessToken')

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return await loginRequest(credentials)
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Không thể đăng nhập. Vui lòng thử lại.'))
  }
})

export const loadCurrentUser = createAsyncThunk('auth/loadCurrentUser', async (_, { rejectWithValue }) => {
  try {
    return await getCurrentUser()
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Phiên đăng nhập không còn hợp lệ.'))
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: storedToken,
    isAuthenticated: false,
    loading: Boolean(storedToken),
    initialized: !storedToken,
    error: null,
  },
  reducers: {
    logout(state) {
      localStorage.removeItem('accessToken')
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      state.initialized = true
      state.error = null
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null })
      .addCase(login.fulfilled, (state, action) => {
        localStorage.setItem('accessToken', action.payload.accessToken)
        state.loading = false
        state.initialized = true
        state.isAuthenticated = true
        state.accessToken = action.payload.accessToken
        state.user = action.payload.user
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.initialized = true
        state.error = action.payload
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.loading = false
        state.initialized = true
        state.isAuthenticated = true
        state.user = action.payload
      })
      .addCase(loadCurrentUser.rejected, (state, action) => {
        localStorage.removeItem('accessToken')
        state.loading = false
        state.initialized = true
        state.isAuthenticated = false
        state.accessToken = null
        state.user = null
        state.error = action.payload
      })
  },
})

export const { clearAuthError, logout } = authSlice.actions
export default authSlice.reducer
