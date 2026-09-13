import { configureStore } from '@reduxjs/toolkit'
import assignmentsReducer from '../features/assignments/assignmentsSlice'
import dashboardReducer from '../features/dashboard/dashboardSlice'
import uiReducer from '../features/ui/uiSlice'

export const store = configureStore({
  reducer: {
    assignments: assignmentsReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
  },
})
