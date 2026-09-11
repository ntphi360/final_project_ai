import api from './api'
import { dashboardMock } from '../data/mockDashboard'

const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

export async function getDashboardData(params = {}) {
  if (useMockData) {
    await new Promise((resolve) => setTimeout(resolve, 220))
    return dashboardMock
  }

  const { data } = await api.get('/dashboard/overview', { params })
  return data
}
