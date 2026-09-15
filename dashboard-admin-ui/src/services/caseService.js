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
    receivedAt: item.received_at,
    deadlineAt: item.deadline_at,
    completedAt: item.completed_at ?? null,
    status: item.status,
    applicant: item.applicant_name ?? '—',
    phone: item.phone_number ?? '—',
    email: '',
    agency: item.agency_name ?? '',
    procedureRelation: item.procedure ?? null,
    departmentRelation: item.department ?? null,
    officerRelation: item.officer ?? null,
    predictedProcessingHours: toNullableNumber(item.predicted_processing_hours),
    modelVersion: item.model_version == null ? null : String(item.model_version),
    slaHours: toNullableNumber(item.sla_hours),
    riskRatio: toNullableNumber(item.risk_ratio),
    riskPercentage: toNullableNumber(item.risk_percentage),
    risk: null,
    priority: 'Chưa có AI',
    channels: [],
    note: '',
  }
}

async function getAllPages(path) {
  const pageSize = 100
  const items = []
  let skip = 0

  while (true) {
    const { data } = await api.get(path, { params: { skip, limit: pageSize } })
    if (!Array.isArray(data)) throw new TypeError(`Response của ${path} phải là một mảng`)
    items.push(...data)
    if (data.length < pageSize) break
    skip += pageSize
  }
  return items.map(mapCase)
}

export function getProcessingCases() {
  return getAllPages('/api/cases/processing')
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
