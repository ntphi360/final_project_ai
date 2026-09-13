import { createSlice } from '@reduxjs/toolkit'
import { initialAssignments } from '../../data/mockAssignments'

const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState: {
    items: initialAssignments,
  },
  reducers: {
    addAssignments(state, action) {
      state.items.unshift(...action.payload)
    },
    acceptAssignment(state, action) {
      const assignment = state.items.find((item) => item.id === action.payload.id)
      if (!assignment || assignment.status !== 'PENDING') return
      assignment.status = 'ACCEPTED'
      assignment.acceptedAt = action.payload.acceptedAt
      assignment.rejectedAt = null
      assignment.rejectionReason = null
    },
    rejectAssignment(state, action) {
      const assignment = state.items.find((item) => item.id === action.payload.id)
      if (!assignment || assignment.status !== 'PENDING') return
      assignment.status = 'REJECTED'
      assignment.rejectedAt = action.payload.rejectedAt
      assignment.rejectionReason = action.payload.rejectionReason
      assignment.acceptedAt = null
    },
  },
})

export const { addAssignments, acceptAssignment, rejectAssignment } = assignmentsSlice.actions
export default assignmentsSlice.reducer
