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

export async function getDashboardSummary() {
  const { data } = await api.get('/dashboard/summary')
  return data
}

export async function getStatusDistribution() {
  const { data } = await api.get('/dashboard/status-distribution')
  return data
}

export async function getFieldDistribution() {
  const { data } = await api.get('/dashboard/field-distribution')
  return data
}

export async function getRecentCases(limit = 10) {
  const { data } = await api.get('/dashboard/recent-cases', { params: { limit } })
  return data
}

export async function getNearDeadlineCases(hours = 72, limit = 20) {
  const { data } = await api.get('/dashboard/near-deadline', { params: { hours, limit } })
  return data
}

export async function getOverdueCases(limit = 20) {
  const { data } = await api.get('/dashboard/overdue', { params: { limit } })
  return data
}

export async function getReportDashboardData() {
  const [summary, statuses, fields, nearDeadline, overdue] = await Promise.all([
    getDashboardSummary(),
    getStatusDistribution(),
    getFieldDistribution(),
    getNearDeadlineCases(),
    getOverdueCases(),
  ])
  return { summary, statuses, fields, nearDeadline, overdue }
}
