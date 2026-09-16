import { useEffect, useState } from 'react'
import { getRemainingTimeState } from '../../utils/caseTime'

export default function Countdown({ receivedAt, deadlineAt }) {
  const [currentTime, setCurrentTime] = useState(() => Date.now())

  useEffect(() => {
    const update = () => {
      const nextCurrentTime = Date.now()
      setCurrentTime(nextCurrentTime)
      return getRemainingTimeState(receivedAt, deadlineAt, nextCurrentTime).isOverdue
    }

    if (update()) return undefined
    const timer = window.setInterval(() => {
      if (update()) window.clearInterval(timer)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [receivedAt, deadlineAt])

  const remainingTime = getRemainingTimeState(receivedAt, deadlineAt, currentTime)
  return (
    <span className={`countdown ${remainingTime.isWarning ? 'danger' : 'safe'}`}>
      <strong>{remainingTime.text}</strong>
    </span>
  )
}
