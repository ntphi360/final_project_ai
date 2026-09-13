import api from './api'

function calculateRisk(deadlineAt) {
  const remainingHours = (new Date(deadlineAt).getTime() - Date.now()) / 3600000
  if (remainingHours <= 0) return 98
  if (remainingHours <= 24) return 85
  if (remainingHours <= 72) return 65
  if (remainingHours <= 168) return 42
  return 20
}

function riskPriority(risk) {
  if (risk >= 80) return 'Rất cao'
  if (risk >= 60) return 'Cao'
  if (risk >= 40) return 'Trung bình'
  return 'Thấp'
}

export function mapCase(item) {
  const risk = calculateRisk(item.deadline_at || item.deadlineAt)
  return {
    id: item.id,
    caseCode: item.case_code || item.caseCode,
    procedure: item.procedure_name || item.procedureName,
    procedureId: item.procedure_id || item.procedureId || null,
    field: item.field_name || item.fieldName,
    department: item.department_name || item.departmentName,
    departmentId: item.department_id || item.departmentId || null,
    officer: item.officer_name || item.officerName || 'Chưa phân công',
    officerId: item.officer_id || item.officerId || null,
    receivedAt: item.received_at || item.receivedAt,
    deadlineAt: item.deadline_at || item.deadlineAt,
    completedAt: item.completed_at || item.completedAt || null,
    status: item.status,
    applicant: item.applicant_name || item.applicantName || '—',
    phone: item.phone_number || item.phoneNumber || '—',
    email: item.email || '',
    agency: item.agency_name || item.agencyName || '',
    risk,
    priority: riskPriority(risk),
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
    items.push(...data)
    if (data.length < pageSize) break
    skip += pageSize
  }
  return items.map(mapCase)
}

export function getProcessingCases() {
  return getAllPages('/cases/processing')
}

export const getAllProcessingCases = getProcessingCases

export async function getCaseById(id) {
  const { data } = await api.get(`/cases/${id}`)
  return mapCase(data)
}
