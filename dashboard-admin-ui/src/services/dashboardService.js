import api from './api'
import { getProcessingCases } from './caseService'

export async function getDashboardSummary() {
  const { data } = await api.get('/api/dashboard/summary')
  return data
}

export async function getStatusDistribution() {
  const { data } = await api.get('/api/dashboard/status-distribution')
  return data
}

export async function getFieldDistribution() {
  const { data } = await api.get('/api/dashboard/field-distribution')
  return data
}

export async function getMonthlyCaseTrends() {
  const { data } = await api.get('/api/dashboard/monthly-trends')
  return data
}

export async function getDepartmentStatistics() {
  const { data } = await api.get('/api/dashboard/department-statistics')
  return data
}

export async function getOfficerWorkloads() {
  const { data } = await api.get('/api/dashboard/officer-workloads')
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

export async function getReportDashboardData() {
  const [summary, statuses, fields, trends, departments, officers, processingCases] = await Promise.all([
    getDashboardSummary(),
    getStatusDistribution(),
    getFieldDistribution(),
    getMonthlyCaseTrends(),
    getDepartmentStatistics(),
    getOfficerWorkloads(),
    getProcessingCases(),
  ])
  return { summary, statuses, fields, trends, departments, officers, processingCases }
}
