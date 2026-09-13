import { currentAssigneeId, currentAssignerId } from '../config/currentIdentity'
import api from './api'

function mapAssignment(item) {
  if (!item) return null
  return {
    ...item,
    notificationChannels: [
      ...(item.sendEmail ? ['Email'] : []),
      ...(item.sendSms ? ['SMS'] : []),
    ],
  }
}

function mapList(data) {
  return {
    ...data,
    items: (data.items || []).map(mapAssignment),
  }
}

export async function createAssignments(data) {
  const response = await api.post('/assignments', data, {
    params: { assignerId: currentAssignerId },
  })
  return {
    ...response.data,
    assignments: (response.data.assignments || []).map(mapAssignment),
  }
}

export async function getMyAssignments(params = {}) {
  const response = await api.get('/assignments/my', {
    params: { ...params, assigneeId: currentAssigneeId },
  })
  return mapList(response.data)
}

export async function getAssignments(params = {}) {
  const response = await api.get('/assignments', { params })
  return mapList(response.data)
}

export async function getAssignmentById(id) {
  const { data } = await api.get(`/assignments/${id}`)
  return mapAssignment(data)
}

export async function acceptAssignment(id) {
  const { data } = await api.post(`/assignments/${id}/accept`, null, {
    params: { assigneeId: currentAssigneeId },
  })
  return mapAssignment(data)
}

export async function rejectAssignment(id, reason) {
  const { data } = await api.post(
    `/assignments/${id}/reject`,
    { reason },
    { params: { assigneeId: currentAssigneeId } },
  )
  return mapAssignment(data)
}

export async function getAssignmentSummary(params = {}) {
  const { data } = await api.get('/assignments/summary', { params })
  return data
}

export function getMyAssignmentSummary() {
  return getAssignmentSummary({ assigneeId: currentAssigneeId })
}
