import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getDashboardData } from '../../services/dashboardService'
import { getApiErrorMessage } from '../../services/serviceUtils'

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      return await getDashboardData()
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Không thể tải dữ liệu dashboard.'))
    }
  },
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    data: { summary: null, statuses: [], fields: [], recentCases: [], overdue: [], nearDeadline: [], processingCases: [] },
    loading: false,
    error: null,
    selectedRisk: 'ALL',
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
        state.error = action.payload || 'Không thể tải dữ liệu dashboard.'
      })
  },
})

export const { setSelectedRisk, setSearchTerm } = dashboardSlice.actions
export default dashboardSlice.reducer
