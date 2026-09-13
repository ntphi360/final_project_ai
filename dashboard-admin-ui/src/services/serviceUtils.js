export function getApiErrorMessage(error, fallback) {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (typeof detail?.message === 'string') return detail.message
  return fallback
}

export function formatApiNumber(value) {
  return new Intl.NumberFormat('vi-VN').format(value ?? 0)
}
