import { useEffect, useState } from 'react'

function getRemainingSeconds(deadlineAt) {
  const deadline = new Date(deadlineAt).getTime()
  if (!Number.isFinite(deadline)) return null
  return Math.floor((deadline - Date.now()) / 1000)
}

function formatRemainingTime(totalSeconds) {
  if (totalSeconds == null) return '—'
  const isOverdue = totalSeconds <= 0
  const absoluteSeconds = Math.abs(totalSeconds)
  const days = Math.floor(absoluteSeconds / 86400)
  const hours = Math.floor((absoluteSeconds % 86400) / 3600)
  const minutes = Math.floor((absoluteSeconds % 3600) / 60)
  const parts = []

  if (days > 0) parts.push(`${days} ngày`)
  if (hours > 0 || days > 0) parts.push(`${hours} giờ`)
  parts.push(`${minutes} phút`)
  return `${isOverdue ? 'Đã quá hạn ' : ''}${parts.join(' ')}`
}

export default function Countdown({ deadlineAt }) {
  const [remainingSeconds, setRemainingSeconds] = useState(() => (
    getRemainingSeconds(deadlineAt)
  ))

  useEffect(() => {
    const update = () => setRemainingSeconds(getRemainingSeconds(deadlineAt))
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [deadlineAt])

  return (
    <span className={`countdown ${remainingSeconds != null && remainingSeconds <= 0 ? 'danger' : ''}`}>
      <strong>{formatRemainingTime(remainingSeconds)}</strong>
    </span>
  )
}
