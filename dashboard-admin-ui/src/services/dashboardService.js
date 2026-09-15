import api from './api'
import { getProcessingCases } from './caseService'

export async function getDashboardSummary(params = {}) {
  const { data } = await api.get('/api/dashboard/summary', { params })
  return data
}

export async function getStatusDistribution(params = {}) {
  const { data } = await api.get('/api/dashboard/status-distribution', { params })
  return data
}

export async function getFieldDistribution(params = {}) {
  const { data } = await api.get('/api/dashboard/field-distribution', { params })
  return data
}

export async function getMonthlyCaseTrends(params = {}) {
  const { data } = await api.get('/api/dashboard/monthly-trends', { params })
  return data
}

export async function getDepartmentStatistics(params = {}) {
  const { data } = await api.get('/api/dashboard/department-statistics', { params })
  return data
}

export async function getOfficerWorkloads(params = {}) {
  const { data } = await api.get('/api/dashboard/officer-workloads', { params })
  return data
}

export async function getRecentCases(limit = 10) {
  const { data } = await api.get('/api/dashboard/recent-cases', { params: { limit } })
  return data
}

export async function getNearDeadlineCases(hours = 72, limit = 20) {
  const { data } = await api.get('/api/dashboard/near-deadline', { params: { hours, limit } })
  return data
}

export async function getOverdueCases(limit = 20) {
  const { data } = await api.get('/api/dashboard/overdue', { params: { limit } })
  return data
}

export async function getDashboardData() {
  const [summary, statuses, fields, recentCases, overdue, nearDeadline, processingCases] = await Promise.all([
    getDashboardSummary(),
    getStatusDistribution(),
    getFieldDistribution(),
    getRecentCases(),
    getOverdueCases(),
    getNearDeadlineCases(),
    getProcessingCases(),
  ])
  return { summary, statuses, fields, recentCases, overdue, nearDeadline, processingCases }
}

export async function getReportDashboardData(params = {}, granularity = 'month') {
  const [summary, statuses, fields, trends, departments, officers, processingCases] = await Promise.all([
    getDashboardSummary(params),
    getStatusDistribution(params),
    getFieldDistribution(params),
    getMonthlyCaseTrends({ ...params, granularity }),
    getDepartmentStatistics(params),
    getOfficerWorkloads(params),
    getProcessingCases(params),
  ])
  return { summary, statuses, fields, trends, departments, officers, processingCases }
}
