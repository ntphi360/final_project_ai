import { useEffect, useState } from 'react'

function getRemainingSeconds(deadlineAt) {
  return Math.floor((new Date(deadlineAt).getTime() - Date.now()) / 1000)
}

export function formatCountdown(totalSeconds) {
  const isOverdue = totalSeconds < 0
  const safeSeconds = Math.abs(totalSeconds)
  const days = Math.floor(safeSeconds / 86400)
  const hours = Math.floor((safeSeconds % 86400) / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60
  const parts = []

  if (days > 0) parts.push(`${days} ngày`)
  parts.push(`${hours} giờ`, `${minutes} phút`, `${seconds} giây`)

  return `${isOverdue ? 'Đã quá hạn ' : ''}${parts.join(' ')}`
}

export default function CountdownText({ deadlineAt, emphasize = false }) {
  const [remainingSeconds, setRemainingSeconds] = useState(() => getRemainingSeconds(deadlineAt))

  useEffect(() => {
    const updateCountdown = () => setRemainingSeconds(getRemainingSeconds(deadlineAt))
    updateCountdown()
    const timer = window.setInterval(updateCountdown, 1000)
    return () => window.clearInterval(timer)
  }, [deadlineAt])

  const urgencyClass = remainingSeconds < 0
    ? 'is-overdue'
    : remainingSeconds <= 86400
      ? 'is-urgent'
      : ''

  return (
    <span className={`countdown-text ${urgencyClass} ${emphasize ? 'is-emphasized' : ''}`}>
      {formatCountdown(remainingSeconds)}
    </span>
  )
}
