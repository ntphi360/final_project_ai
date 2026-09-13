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
    items: data.items.map(mapAssignment),
    page: data.page,
    pageSize: data.pageSize,
    total: data.total,
    totalPages: data.totalPages,
  }
}

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

export async function createAssignments(data) {
  const payload = {
    caseIds: data.caseIds,
    assigneeId: data.assigneeId,
    title: data.title,
    content: data.content,
    sendEmail: data.sendEmail,
    sendSms: data.sendSms,
  }
  const response = await api.post('/api/assignments', payload, {
    params: { assignerId: currentAssignerId },
  })
  return {
    ...response.data,
    assignments: response.data.assignments.map(mapAssignment),
  }
}

export async function getMyAssignments(params = {}) {
  const supportedParams = compactParams({
    status: params.status,
    search: params.search,
    fromDate: params.fromDate,
    toDate: params.toDate,
    page: params.page,
    pageSize: params.pageSize,
    assigneeId: currentAssigneeId,
  })
  const response = await api.get('/api/assignments/my', {
    params: supportedParams,
  })
  return mapList(response.data)
}

export async function getAssignments(params = {}) {
  const supportedParams = compactParams({
    status: params.status,
    assignerId: params.assignerId,
    assigneeId: params.assigneeId,
    departmentId: params.departmentId,
    search: params.search,
    fromDate: params.fromDate,
    toDate: params.toDate,
    page: params.page,
    pageSize: params.pageSize,
  })
  const response = await api.get('/api/assignments', { params: supportedParams })
  return mapList(response.data)
}

export async function getAssignmentById(id) {
  const { data } = await api.get(`/api/assignments/${id}`)
  return mapAssignment(data)
}

export async function acceptAssignment(id) {
  const { data } = await api.post(`/api/assignments/${id}/accept`, null, {
    params: { assigneeId: currentAssigneeId },
  })
  return mapAssignment(data)
}

export async function rejectAssignment(id, reason) {
  const { data } = await api.post(
    `/api/assignments/${id}/reject`,
    { reason },
    { params: { assigneeId: currentAssigneeId } },
  )
  return mapAssignment(data)
}

export async function getAssignmentSummary(params = {}) {
  const supportedParams = compactParams({
    assignerId: params.assignerId,
    assigneeId: params.assigneeId,
  })
  const { data } = await api.get('/api/assignments/summary', { params: supportedParams })
  return data
}

export function getMyAssignmentSummary() {
  return getAssignmentSummary({ assigneeId: currentAssigneeId })
}
