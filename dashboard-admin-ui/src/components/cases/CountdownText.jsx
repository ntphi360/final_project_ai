import { useEffect, useState } from 'react'
import { formatRemainingTime, getRemainingSeconds } from '../../utils/caseTime'

export { formatRemainingTime as formatCountdown } from '../../utils/caseTime'

export default function CountdownText({ deadlineAt, emphasize = false }) {
  const [remainingSeconds, setRemainingSeconds] = useState(() => getRemainingSeconds(deadlineAt))

  useEffect(() => {
    const updateCountdown = () => setRemainingSeconds(getRemainingSeconds(deadlineAt))
    updateCountdown()
    const timer = window.setInterval(updateCountdown, 1000)
    return () => window.clearInterval(timer)
  }, [deadlineAt])

  const urgencyClass = remainingSeconds != null && remainingSeconds <= 0
    ? 'is-overdue'
    : remainingSeconds != null && remainingSeconds <= 86400
      ? 'is-urgent'
      : ''

  return (
    <span className={`countdown-text ${urgencyClass} ${emphasize ? 'is-emphasized' : ''}`}>
      {formatRemainingTime(remainingSeconds)}
    </span>
  )
}
