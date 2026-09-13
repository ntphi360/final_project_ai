import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  acceptAssignment,
  createAssignments,
  getAssignmentById,
  getAssignments,
  getAssignmentSummary,
  getMyAssignments,
  getMyAssignmentSummary,
  rejectAssignment,
} from '../../services/assignmentService'
import { getApiErrorMessage } from '../../services/serviceUtils'

const emptyList = { items: [], page: 1, pageSize: 10, total: 0, totalPages: 0 }
const emptySummary = { total: 0, pending: 0, accepted: 0, rejected: 0 }

function apiThunk(type, request, fallback) {
  return createAsyncThunk(type, async (payload, { rejectWithValue }) => {
    try {
      return await request(payload)
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, fallback))
    }
  })
}

export const fetchMyAssignments = apiThunk(
  'assignments/fetchMyAssignments',
  getMyAssignments,
  'Không thể tải danh sách công việc. Vui lòng thử lại.',
)

export const fetchTrackingAssignments = apiThunk(
  'assignments/fetchTrackingAssignments',
  getAssignments,
  'Không thể tải danh sách giao việc. Vui lòng thử lại.',
)

export const fetchMyAssignmentSummary = apiThunk(
  'assignments/fetchMyAssignmentSummary',
  getMyAssignmentSummary,
  'Không thể tải số liệu công việc.',
)

export const fetchTrackingAssignmentSummary = apiThunk(
  'assignments/fetchTrackingAssignmentSummary',
  getAssignmentSummary,
  'Không thể tải số liệu giao việc.',
)

export const fetchAssignmentDetail = apiThunk(
  'assignments/fetchAssignmentDetail',
  getAssignmentById,
  'Không thể tải chi tiết giao việc.',
)

export const createAssignmentBatch = apiThunk(
  'assignments/createAssignmentBatch',
  createAssignments,
  'Không thể tạo giao việc. Vui lòng thử lại.',
)

export const confirmAssignment = apiThunk(
  'assignments/confirmAssignment',
  acceptAssignment,
  'Không thể xác nhận nhận việc.',
)

export const declineAssignment = apiThunk(
  'assignments/declineAssignment',
  ({ id, reason }) => rejectAssignment(id, reason),
  'Không thể từ chối công việc.',
)

const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState: {
    myList: emptyList,
    trackingList: emptyList,
    mySummary: emptySummary,
    trackingSummary: emptySummary,
    detail: null,
    loading: { my: false, tracking: false, detail: false, action: false },
    errors: { my: null, mySummary: null, tracking: null, trackingSummary: null, detail: null, action: null },
  },
  reducers: {
    clearAssignmentDetail(state) {
      state.detail = null
      state.errors.detail = null
    },
    clearAssignmentActionError(state) {
      state.errors.action = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAssignments.pending, (state) => {
        state.loading.my = true
        state.errors.my = null
      })
      .addCase(fetchMyAssignments.fulfilled, (state, action) => {
        state.loading.my = false
        state.myList = action.payload
      })
      .addCase(fetchMyAssignments.rejected, (state, action) => {
        state.loading.my = false
        state.errors.my = action.payload
      })
      .addCase(fetchTrackingAssignments.pending, (state) => {
        state.loading.tracking = true
        state.errors.tracking = null
      })
      .addCase(fetchTrackingAssignments.fulfilled, (state, action) => {
        state.loading.tracking = false
        state.trackingList = action.payload
      })
      .addCase(fetchTrackingAssignments.rejected, (state, action) => {
        state.loading.tracking = false
        state.errors.tracking = action.payload
      })
      .addCase(fetchMyAssignmentSummary.pending, (state) => {
        state.errors.mySummary = null
      })
      .addCase(fetchMyAssignmentSummary.fulfilled, (state, action) => {
        state.mySummary = action.payload
      })
      .addCase(fetchMyAssignmentSummary.rejected, (state, action) => {
        state.errors.mySummary = action.payload
      })
      .addCase(fetchTrackingAssignmentSummary.pending, (state) => {
        state.errors.trackingSummary = null
      })
      .addCase(fetchTrackingAssignmentSummary.fulfilled, (state, action) => {
        state.trackingSummary = action.payload
      })
      .addCase(fetchTrackingAssignmentSummary.rejected, (state, action) => {
        state.errors.trackingSummary = action.payload
      })
      .addCase(fetchAssignmentDetail.pending, (state) => {
        state.loading.detail = true
        state.errors.detail = null
        state.detail = null
      })
      .addCase(fetchAssignmentDetail.fulfilled, (state, action) => {
        state.loading.detail = false
        state.detail = action.payload
      })
      .addCase(fetchAssignmentDetail.rejected, (state, action) => {
        state.loading.detail = false
        state.errors.detail = action.payload
      })
      .addMatcher(
        (action) => [createAssignmentBatch.pending.type, confirmAssignment.pending.type, declineAssignment.pending.type].includes(action.type),
        (state) => {
          state.loading.action = true
          state.errors.action = null
        },
      )
      .addMatcher(
        (action) => [createAssignmentBatch.fulfilled.type, confirmAssignment.fulfilled.type, declineAssignment.fulfilled.type].includes(action.type),
        (state) => {
          state.loading.action = false
        },
      )
      .addMatcher(
        (action) => [createAssignmentBatch.rejected.type, confirmAssignment.rejected.type, declineAssignment.rejected.type].includes(action.type),
        (state, action) => {
          state.loading.action = false
          state.errors.action = action.payload
        },
      )
  },
})

export const { clearAssignmentDetail, clearAssignmentActionError } = assignmentsSlice.actions
export default assignmentsSlice.reducer
