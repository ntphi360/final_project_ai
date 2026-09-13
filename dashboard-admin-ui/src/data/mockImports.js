export const mockImportErrors = [
  { row: 12, message: 'Thiếu mã hồ sơ' },
  { row: 35, message: 'Sai định dạng ngày tiếp nhận' },
  { row: 82, message: 'Không tìm thấy cán bộ phụ trách' },
]

export const initialImportHistory = [
  { id: 'IMP001', fileName: 'hs_09_2026.xlsx', importedAt: '2026-09-10T14:30:00', totalRows: 1248, successRows: 1230, skippedRows: 12, errorRows: 6, status: 'SUCCESS', errors: [] },
  { id: 'IMP002', fileName: 'hoso_08_2026.xlsx', importedAt: '2026-09-01T08:20:00', totalRows: 856, successRows: 830, skippedRows: 16, errorRows: 10, status: 'PARTIAL', errors: mockImportErrors },
  { id: 'IMP003', fileName: 'dataset_test.csv', importedAt: '2026-08-25T15:00:00', totalRows: 392, successRows: 0, skippedRows: 0, errorRows: 392, status: 'FAILED', errors: mockImportErrors },
  { id: 'IMP004', fileName: 'ho_so_thang_7.xlsx', importedAt: '2026-08-16T16:45:00', totalRows: 1392, successRows: 1375, skippedRows: 12, errorRows: 5, status: 'PARTIAL', errors: mockImportErrors.slice(0, 2) },
  { id: 'IMP005', fileName: 'ho_so_thang_6.xlsx', importedAt: '2026-08-01T09:10:00', totalRows: 900, successRows: 900, skippedRows: 0, errorRows: 0, status: 'SUCCESS', errors: [] },
]

export const importStatus = {
  SUCCESS: { label: 'Thành công', className: 'bg-emerald-50 text-emerald-700' },
  PARTIAL: { label: 'Có lỗi', className: 'bg-amber-50 text-amber-700' },
  FAILED: { label: 'Thất bại', className: 'bg-red-50 text-red-700' },
}

export function formatImportDate(value) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatImportNumber(value) {
  return new Intl.NumberFormat('vi-VN').format(value)
}
