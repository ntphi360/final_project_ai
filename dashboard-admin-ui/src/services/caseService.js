import api from './api'

function toNullableNumber(value) {
  if (value == null || String(value).trim() === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function mapCase(item) {
  return {
    id: item.id,
    caseCode: item.case_code,
    procedure: item.procedure_name,
    procedureId: item.procedure_id ?? null,
    field: item.field_name,
    department: item.department_name,
    departmentId: item.department_id ?? null,
    officer: item.officer_name ?? 'Chưa phân công',
    officerId: item.officer_id ?? null,
    officerPhone: item.officer_phone_number ?? null,
    officerEmail: item.officer_email ?? null,
    receivedAt: item.received_at,
    deadlineAt: item.deadline_at,
    completedAt: item.completed_at ?? null,
    status: item.status,
    applicant: item.applicant_name ?? '—',
    phone: item.phone_number ?? '—',
    applicantEmail: item.applicant_email ?? null,
    email: item.applicant_email ?? '—',
    agency: item.agency_name ?? '',
    procedureRelation: item.procedure ?? null,
    departmentRelation: item.department ?? null,
    officerRelation: item.officer ?? null,
    predictedProcessingHours: toNullableNumber(item.predicted_processing_hours),
    modelVersion: item.model_version == null ? null : String(item.model_version),
    slaHours: toNullableNumber(item.sla_hours),
    riskRatio: toNullableNumber(item.risk_ratio),
    riskPercentage: toNullableNumber(item.risk_percentage),
    riskLevel: item.risk_level ?? null,
    riskLabel: item.risk_label || 'Chưa có AI',
    timeStatus: item.time_status ?? null,
    risk: toNullableNumber(item.risk_percentage),
    priority: item.risk_label || 'Chưa có AI',
    channels: [],
    note: '',
  }
}

async function getAllPages(path, params = {}) {
  const pageSize = 100
  const items = []
  let skip = 0

  while (true) {
    const { data } = await api.get(path, { params: { ...params, skip, limit: pageSize } })
    if (!Array.isArray(data)) throw new TypeError(`Response của ${path} phải là một mảng`)
    items.push(...data)
    if (data.length < pageSize) break
    skip += pageSize
  }
  return items.map(mapCase)
}

export function getProcessingCases(params = {}) {
  return getAllPages('/api/cases/processing', params)
}

export const getAllProcessingCases = getProcessingCases

export function getCases() {
  return getAllPages('/api/cases')
}

export function getCompletedCases() {
  return getAllPages('/api/cases/completed')
}

export async function getCaseById(id) {
  const { data } = await api.get(`/api/cases/${id}`)
  return mapCase(data)
}

export async function performCaseAction(id, payload) {
  const { data } = await api.post(`/api/cases/${id}/action`, payload, { timeout: 60000 })
  return data
}

export async function performCaseBulkAction(payload) {
  const { data } = await api.post('/api/cases/bulk-action', payload, { timeout: 300000 })
  return data
}
