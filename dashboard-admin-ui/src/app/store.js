import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer from '../features/dashboard/dashboardSlice'
import uiReducer from '../features/ui/uiSlice'

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    ui: uiReducer,
  },
})
