import { useEffect, useState } from 'react'
import { getRemainingTimeState } from '../../utils/caseTime'

export { formatRemainingTime as formatCountdown } from '../../utils/caseTime'

export default function CountdownText({ receivedAt, deadlineAt, emphasize = false }) {
  const [currentTime, setCurrentTime] = useState(() => Date.now())

  useEffect(() => {
    const updateCountdown = () => {
      const nextCurrentTime = Date.now()
      setCurrentTime(nextCurrentTime)
      return getRemainingTimeState(receivedAt, deadlineAt, nextCurrentTime).isOverdue
    }

    if (updateCountdown()) return undefined
    const timer = window.setInterval(() => {
      if (updateCountdown()) window.clearInterval(timer)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [receivedAt, deadlineAt])

  const remainingTime = getRemainingTimeState(receivedAt, deadlineAt, currentTime)
  const urgencyClass = remainingTime.isOverdue
    ? 'is-overdue'
    : remainingTime.isWarning
      ? 'is-warning'
      : ''

  return (
    <span className={`countdown-text ${urgencyClass} ${emphasize ? 'is-emphasized' : ''}`}>
      {remainingTime.text}
    </span>
  )
}
