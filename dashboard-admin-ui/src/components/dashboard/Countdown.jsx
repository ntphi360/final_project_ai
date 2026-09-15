import { useEffect, useState } from 'react'
import { formatRemainingTime, getRemainingSeconds } from '../../utils/caseTime'

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
