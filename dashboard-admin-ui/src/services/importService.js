import api from './api'

export const importStatus = {
  SUCCESS: { label: 'Thành công', className: 'bg-emerald-50 text-emerald-700' },
  PARTIAL: { label: 'Có lỗi', className: 'bg-amber-50 text-amber-700' },
  FAILED: { label: 'Thất bại', className: 'bg-red-50 text-red-700' },
}

export function formatImportDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatImportNumber(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value) || 0)
}

function mapImportHistory(item) {
  const errorMessage = item.error_message || ''
  return {
    id: item.id,
    fileName: item.file_name,
    totalRows: item.total_rows,
    createdRows: item.created_rows,
    insertedRows: item.created_rows,
    updatedRows: item.updated_rows,
    successRows: item.created_rows + item.updated_rows,
    skippedRows: item.skipped_rows,
    errorRows: item.error_rows,
    status: item.status,
    importedAt: item.imported_at,
    errorMessage,
    errors: errorMessage ? [{ row: '—', message: errorMessage }] : [],
  }
}

export async function importCases(file) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/api/import/cases', formData, { timeout: 120000 })
  return data
}

export async function getImportHistory() {
  const { data } = await api.get('/api/import/history')
  return Array.isArray(data) ? data.map(mapImportHistory) : []
}

export async function getImportHistoryDetail(historyId) {
  const { data } = await api.get(`/api/import/history/${historyId}`)
  return mapImportHistory(data)
}
