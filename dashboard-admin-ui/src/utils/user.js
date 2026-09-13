export const roleOptions = [
  { value: 'ADMIN', label: 'Quản trị viên' },
  { value: 'SUPERVISOR', label: 'Quản lý' },
  { value: 'OFFICER', label: 'Cán bộ xử lý' },
  { value: 'VIEWER', label: 'Chỉ xem' },
]

export const roleLabels = Object.fromEntries(roleOptions.map((item) => [item.value, item.label]))

export function formatUserDate(value, includeTime = false) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('vi-VN', includeTime ? {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  } : {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(value))
}

export function getInitials(fullName = '') {
  return fullName.split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase() || 'U'
}
