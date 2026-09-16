function toValidDate(value) {
  if (value == null || value === '') return null
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date : null
}

function formatDurationParts(totalSeconds) {
  const absoluteSeconds = Math.abs(totalSeconds)
  const days = Math.floor(absoluteSeconds / 86400)
  const hours = Math.floor((absoluteSeconds % 86400) / 3600)
  const minutes = Math.floor((absoluteSeconds % 3600) / 60)
  const parts = []

  if (days > 0) parts.push(`${days} ngày`)
  if (hours > 0) parts.push(`${hours} giờ`)
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes} phút`)
  return parts.join(' ')
}

export function formatCaseDateTime(value) {
  const date = toValidDate(value)
  if (!date) return '—'

  const pad = (part) => String(part).padStart(2, '0')
  return [
    `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  ].join(' ')
}

export function formatProcessingDuration(receivedAt, deadlineAt) {
  const received = toValidDate(receivedAt)
  const deadline = toValidDate(deadlineAt)
  if (!received || !deadline) return '—'

  const durationSeconds = Math.floor((deadline.getTime() - received.getTime()) / 1000)
  if (durationSeconds < 0) return '—'
  return formatDurationParts(durationSeconds)
}

export function getRemainingTimeState(receivedAt, deadlineAt, currentTime = Date.now()) {
  const received = toValidDate(receivedAt)
  const deadline = toValidDate(deadlineAt)
  const current = toValidDate(currentTime)
  if (!received || !deadline || !current) {
    return { text: '—', isOverdue: false, isWarning: false }
  }

  const receivedTime = received.getTime()
  const deadlineTime = deadline.getTime()
  const currentTimestamp = current.getTime()
  const isOverdue = currentTimestamp >= deadlineTime
  if (isOverdue) {
    return { text: 'Đã quá hạn', isOverdue: true, isWarning: true }
  }

  const warningTime = receivedTime + ((deadlineTime - receivedTime) / 2)
  const remainingSeconds = Math.floor((deadlineTime - currentTimestamp) / 1000)
  return {
    text: `Còn ${formatDurationParts(remainingSeconds)}`,
    isOverdue: false,
    isWarning: currentTimestamp >= warningTime,
  }
}

export function formatRemainingTime(receivedAt, deadlineAt, currentTime = Date.now()) {
  return getRemainingTimeState(receivedAt, deadlineAt, currentTime).text
}
