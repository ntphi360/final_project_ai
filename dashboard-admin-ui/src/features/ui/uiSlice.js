import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    mobileSidebarOpen: false,
    sidebarCollapsed: false,
  },
  reducers: {
    toggleMobileSidebar(state) {
      state.mobileSidebarOpen = !state.mobileSidebarOpen
    },
    closeMobileSidebar(state) {
      state.mobileSidebarOpen = false
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
  },
})

export const { toggleMobileSidebar, closeMobileSidebar, toggleSidebar } = uiSlice.actions
export default uiSlice.reducer
