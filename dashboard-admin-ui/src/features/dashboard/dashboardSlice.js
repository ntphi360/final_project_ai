import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { dashboardMock } from '../../data/mockDashboard'
import { getDashboardData } from '../../services/dashboardService'

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetchDashboard',
  async (filters = {}) => getDashboardData(filters),
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    data: dashboardMock,
    loading: false,
    error: null,
    selectedRisk: 'Tất cả mức độ',
    searchTerm: '',
  },
  reducers: {
    setSelectedRisk(state, action) {
      state.selectedRisk = action.payload
    },
    setSearchTerm(state, action) {
      state.searchTerm = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Không thể tải dữ liệu'
      })
  },
})

export const { setSelectedRisk, setSearchTerm } = dashboardSlice.actions
export default dashboardSlice.reducer
